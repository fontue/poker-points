import ActivityKit
import Foundation

final class NativeLiveActivityManager {
    static let shared = NativeLiveActivityManager()

    private var lastSyncedSignature: String?

    private init() {}

    func sync(settings: NativeSettings, timer: NativeTimerState) {
        guard #available(iOS 16.1, *) else { return }

        let signature = syncSignature(settings: settings, timer: timer)
        guard signature != lastSyncedSignature else { return }
        lastSyncedSignature = signature

        if isInitialStoppedTimer(settings: settings, timer: timer) {
            Task { await end() }
            return
        }

        guard let state = makeContentState(settings: settings, timer: timer) else { return }

        Task {
            if let activity = Activity<PokerTimerActivityAttributes>.activities.first {
                await update(activity, state: state)
            } else if state.isRunning {
                request(state: state)
            }
        }
    }

    func end() async {
        guard #available(iOS 16.1, *) else { return }

        for activity in Activity<PokerTimerActivityAttributes>.activities {
            if #available(iOS 16.2, *) {
                await activity.end(
                    ActivityContent(state: activity.content.state, staleDate: nil),
                    dismissalPolicy: .immediate
                )
            }
        }
    }

    @available(iOS 16.1, *)
    private func request(state: PokerTimerActivityAttributes.ContentState) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

        let attributes = PokerTimerActivityAttributes(tournamentName: "Poker Points")
        do {
            if #available(iOS 16.2, *) {
                _ = try Activity.request(
                    attributes: attributes,
                    content: ActivityContent(state: state, staleDate: state.endsAt),
                    pushType: nil
                )
            } else {
                _ = try Activity.request(attributes: attributes, contentState: state, pushType: nil)
            }
        } catch {
            print("Live Activity request failed:", error.localizedDescription)
        }
    }

    @available(iOS 16.1, *)
    private func update(_ activity: Activity<PokerTimerActivityAttributes>, state: PokerTimerActivityAttributes.ContentState) async {
        if #available(iOS 16.2, *) {
            await activity.update(ActivityContent(state: state, staleDate: state.endsAt))
        } else {
            await activity.update(using: state)
        }
    }

    private func isInitialStoppedTimer(settings: NativeSettings, timer: NativeTimerState) -> Bool {
        guard let firstLevel = settings.timerLevels.first else { return true }
        return timer.currentLevelIndex == 0 && !timer.isRunning && timer.remainingSeconds >= firstLevel.durationSeconds
    }

    private func syncSignature(settings: NativeSettings, timer: NativeTimerState) -> String {
        let levelsSignature = settings.timerLevels
            .map { "\($0.smallBlind)/\($0.bigBlind)/\($0.ante)/\($0.durationSeconds)/\($0.colorUpChip ?? 0)" }
            .joined(separator: "|")
        let endsAt = timer.endsAt?.timeIntervalSince1970 ?? 0
        let startedAt = timer.levelStartedAt?.timeIntervalSince1970 ?? 0
        return [
            "\(timer.currentLevelIndex)",
            "\(timer.isRunning)",
            "\(Int(endsAt))",
            "\(Int(startedAt))",
            levelsSignature
        ].joined(separator: "#")
    }

    @available(iOS 16.1, *)
    private func makeContentState(settings: NativeSettings, timer: NativeTimerState) -> PokerTimerActivityAttributes.ContentState? {
        guard !settings.timerLevels.isEmpty else { return nil }

        let levelIndex = min(max(0, timer.currentLevelIndex), settings.timerLevels.count - 1)
        let level = settings.timerLevels[levelIndex]
        let endsAt = timer.endsAt ?? Date().addingTimeInterval(TimeInterval(timer.remainingSeconds))

        return PokerTimerActivityAttributes.ContentState(
            levelIndex: levelIndex,
            smallBlind: level.smallBlind,
            bigBlind: level.bigBlind,
            ante: level.ante,
            endsAt: endsAt,
            isRunning: timer.isRunning,
            remainingSeconds: timer.remainingSeconds,
            colorUpChip: level.colorUpChip,
            levelStartedAt: timer.levelStartedAt,
            levels: settings.timerLevels.map { level in
                PokerTimerActivityAttributes.TimerLevel(
                    smallBlind: level.smallBlind,
                    bigBlind: level.bigBlind,
                    ante: level.ante,
                    durationSeconds: level.durationSeconds,
                    colorUpChip: level.colorUpChip
                )
            }
        )
    }
}
