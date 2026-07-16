import AlarmKit
import Foundation
import SwiftUI

struct PokerLevelAlarmMetadata: AlarmMetadata {
    let levelIndex: Int
    let smallBlind: Int
    let bigBlind: Int
    let ante: Int
}

final class NativeTimerAlertManager {
    static let shared = NativeTimerAlertManager()

    private let scheduler = NativeAlarmScheduler()

    private init() {}

    func sync(settings: NativeSettings, timer: NativeTimerState) {
        Task {
            await scheduler.replaceSchedule(settings: settings, timer: timer)
        }
    }

    func requestAuthorization() async -> Bool {
        await scheduler.requestAuthorization()
    }

    func scheduleTest(levelIndex: Int, level: NativeTimerLevel, soundEnabled: Bool) async -> Bool {
        await scheduler.scheduleTest(levelIndex: levelIndex, level: level, soundEnabled: soundEnabled)
    }
}

private actor NativeAlarmScheduler {
    private let alarmManager = AlarmManager.shared
    private let storedAlarmIDsKey = "native-poker-points-alarm-ids"
    private var scheduleRevision = 0

    func requestAuthorization() async -> Bool {
        switch alarmManager.authorizationState {
        case .authorized:
            return true
        case .denied:
            return false
        case .notDetermined:
            do {
                return try await alarmManager.requestAuthorization() == .authorized
            } catch {
                return false
            }
        @unknown default:
            return false
        }
    }

    func replaceSchedule(settings: NativeSettings, timer: NativeTimerState) async {
        scheduleRevision += 1
        let revision = scheduleRevision
        cancelManagedAlarms()

        guard settings.timerNotificationEnabled,
              timer.isRunning,
              timer.remainingSeconds > 0,
              !settings.timerLevels.isEmpty,
              await requestAuthorization() else {
            return
        }

        let firstLevelIndex = min(max(0, timer.currentLevelIndex), settings.timerLevels.count - 1)
        var fireDate = timer.endsAt ?? Date().addingTimeInterval(TimeInterval(timer.remainingSeconds))
        var scheduledIDs: [UUID] = []

        do {
            try ensureAlarmSoundsExist()
        } catch {
            print("AlarmKit sound preparation failed:", error.localizedDescription)
            return
        }

        for completedLevelIndex in firstLevelIndex..<settings.timerLevels.count {
            guard revision == scheduleRevision else {
                cancelAlarms(scheduledIDs)
                return
            }

            let nextLevelIndex = completedLevelIndex + 1
            let id = UUID()
            let metadataLevelIndex = min(nextLevelIndex, settings.timerLevels.count - 1)
            let metadataLevel = settings.timerLevels[metadataLevelIndex]
            let title = alarmTitle(after: completedLevelIndex, levels: settings.timerLevels)

            do {
                let configuration = makeConfiguration(
                    fireDate: fireDate,
                    title: title,
                    levelIndex: metadataLevelIndex,
                    level: metadataLevel,
                    soundEnabled: settings.timerSoundEnabled
                )
                _ = try await alarmManager.schedule(id: id, configuration: configuration)
                scheduledIDs.append(id)
            } catch {
                print("AlarmKit schedule failed:", error.localizedDescription)
            }

            guard revision == scheduleRevision else {
                cancelAlarms(scheduledIDs)
                return
            }

            guard nextLevelIndex < settings.timerLevels.count else { break }
            fireDate = fireDate.addingTimeInterval(
                TimeInterval(settings.timerLevels[nextLevelIndex].durationSeconds)
            )
        }

        if revision == scheduleRevision {
            storeManagedAlarmIDs(scheduledIDs)
        } else {
            cancelAlarms(scheduledIDs)
        }
    }

    func scheduleTest(levelIndex: Int, level: NativeTimerLevel, soundEnabled: Bool) async -> Bool {
        guard await requestAuthorization() else { return false }

        let id = UUID()
        do {
            try ensureAlarmSoundsExist()
            let configuration = makeConfiguration(
                fireDate: Date().addingTimeInterval(3),
                title: alarmTitle(levelIndex: levelIndex, level: level),
                levelIndex: levelIndex,
                level: level,
                soundEnabled: soundEnabled
            )
            _ = try await alarmManager.schedule(id: id, configuration: configuration)
            var ids = managedAlarmIDs()
            ids.append(id)
            storeManagedAlarmIDs(ids)
            return true
        } catch {
            print("AlarmKit test failed:", error.localizedDescription)
            return false
        }
    }

    private func makeConfiguration(
        fireDate: Date,
        title: LocalizedStringResource,
        levelIndex: Int,
        level: NativeTimerLevel,
        soundEnabled: Bool
    ) -> AlarmManager.AlarmConfiguration<PokerLevelAlarmMetadata> {
        let alert: AlarmPresentation.Alert
        if #available(iOS 26.1, *) {
            alert = AlarmPresentation.Alert(title: title)
        } else {
            alert = AlarmPresentation.Alert(
                title: title,
                stopButton: AlarmButton(
                    text: "Остановить",
                    textColor: .white,
                    systemImageName: "stop.fill"
                )
            )
        }

        let presentation = AlarmPresentation(alert: alert)
        let attributes = AlarmAttributes(
            presentation: presentation,
            metadata: PokerLevelAlarmMetadata(
                levelIndex: levelIndex,
                smallBlind: level.smallBlind,
                bigBlind: level.bigBlind,
                ante: level.ante
            ),
            tintColor: Color(red: 0.96, green: 0.78, blue: 0.34)
        )

        return AlarmManager.AlarmConfiguration<PokerLevelAlarmMetadata>.alarm(
            schedule: .fixed(fireDate),
            attributes: attributes,
            sound: .named(soundEnabled ? "poker-alarm.wav" : "poker-silence.wav")
        )
    }

    private func alarmTitle(
        after completedLevelIndex: Int,
        levels: [NativeTimerLevel]
    ) -> LocalizedStringResource {
        let nextLevelIndex = completedLevelIndex + 1
        guard nextLevelIndex < levels.count else {
            return "Таймер турнира завершён"
        }

        return alarmTitle(levelIndex: nextLevelIndex, level: levels[nextLevelIndex])
    }

    private func alarmTitle(
        levelIndex: Int,
        level: NativeTimerLevel
    ) -> LocalizedStringResource {
        let colorUp = level.colorUpChip.map { "(CU\($0))" } ?? ""
        return "L\(levelIndex + 1)\(colorUp): \(level.smallBlind)/\(level.bigBlind)"
    }

    private func cancelManagedAlarms() {
        cancelAlarms(managedAlarmIDs())
        storeManagedAlarmIDs([])
    }

    private func cancelAlarms(_ ids: [UUID]) {
        for id in ids {
            try? alarmManager.cancel(id: id)
        }
    }

    private func managedAlarmIDs() -> [UUID] {
        let values = UserDefaults.standard.stringArray(forKey: storedAlarmIDsKey) ?? []
        return values.compactMap(UUID.init(uuidString:))
    }

    private func storeManagedAlarmIDs(_ ids: [UUID]) {
        UserDefaults.standard.set(ids.map(\.uuidString), forKey: storedAlarmIDsKey)
    }

    private func ensureAlarmSoundsExist() throws {
        let fileManager = FileManager.default
        let libraryURL = try fileManager.url(
            for: .libraryDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
        let soundsURL = libraryURL.appendingPathComponent("Sounds", isDirectory: true)
        try fileManager.createDirectory(at: soundsURL, withIntermediateDirectories: true)
        let alarmURL = soundsURL.appendingPathComponent("poker-alarm.wav")
        if !fileManager.fileExists(atPath: alarmURL.path) {
            try makeAlarmSoundData().write(to: alarmURL, options: .atomic)
        }
        let silenceURL = soundsURL.appendingPathComponent("poker-silence.wav")
        if !fileManager.fileExists(atPath: silenceURL.path) {
            try makeAlarmSoundData(isSilent: true).write(to: silenceURL, options: .atomic)
        }
    }

    private func makeAlarmSoundData(isSilent: Bool = false) -> Data {
        let sampleRate: UInt32 = 44_100
        let duration = isSilent ? 1.0 : 4.0
        let sampleCount = Int(Double(sampleRate) * duration)
        let bytesPerSample: UInt16 = 2
        let audioDataSize = UInt32(sampleCount) * UInt32(bytesPerSample)

        var data = Data("RIFF".utf8)
        appendLittleEndian(36 + audioDataSize, to: &data)
        data.append(contentsOf: Data("WAVEfmt ".utf8))
        appendLittleEndian(UInt32(16), to: &data)
        appendLittleEndian(UInt16(1), to: &data)
        appendLittleEndian(UInt16(1), to: &data)
        appendLittleEndian(sampleRate, to: &data)
        appendLittleEndian(sampleRate * UInt32(bytesPerSample), to: &data)
        appendLittleEndian(bytesPerSample, to: &data)
        appendLittleEndian(UInt16(16), to: &data)
        data.append(contentsOf: Data("data".utf8))
        appendLittleEndian(audioDataSize, to: &data)
        data.reserveCapacity(44 + Int(audioDataSize))

        for sampleIndex in 0..<sampleCount {
            if isSilent {
                appendLittleEndian(Int16(0), to: &data)
                continue
            }
            let time = Double(sampleIndex) / Double(sampleRate)
            let pulsePosition = time.truncatingRemainder(dividingBy: 0.62)
            let isAudible = pulsePosition < 0.44
            let frequency = Int(time / 0.62).isMultiple(of: 2) ? 294.0 : 247.0
            let edgeEnvelope = min(1, pulsePosition / 0.025, (0.44 - pulsePosition) / 0.035)
            let envelope = isAudible ? max(0, edgeEnvelope) : 0
            let fundamental = sin(2 * .pi * frequency * time)
            let harmonic = sin(2 * .pi * frequency * 2 * time) * 0.18
            let value = max(-1, min(1, (fundamental + harmonic) * envelope * 0.52))
            appendLittleEndian(Int16(value * Double(Int16.max)), to: &data)
        }

        return data
    }

    private func appendLittleEndian<T: FixedWidthInteger>(_ value: T, to data: inout Data) {
        var littleEndianValue = value.littleEndian
        withUnsafeBytes(of: &littleEndianValue) { bytes in
            data.append(contentsOf: bytes)
        }
    }
}
