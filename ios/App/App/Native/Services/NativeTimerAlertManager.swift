import AudioToolbox
import Foundation
import UserNotifications

final class NativeTimerAlertManager: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NativeTimerAlertManager()

    private override init() {
        super.init()
    }

    func configure() {
        UNUserNotificationCenter.current().delegate = self
    }

    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }

    func trigger(settings: NativeSettings, levelIndex: Int, level: NativeTimerLevel) {
        if settings.timerSoundEnabled {
            playAlarmPattern()
        }

        if settings.timerVibrationEnabled {
            playVibrationPattern()
        }

        if settings.timerNotificationEnabled {
            requestNotificationPermission()
            sendNotification(levelIndex: levelIndex, level: level)
        }
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound])
        } else {
            completionHandler([.alert, .sound])
        }
    }

    private func sendNotification(levelIndex: Int, level: NativeTimerLevel) {
        let content = UNMutableNotificationContent()
        content.title = "Новый уровень \(levelIndex + 1)"
        content.body = "\(level.smallBlind)/\(level.bigBlind)/\(level.ante)"
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: "poker-points-level-\(levelIndex)-\(Date().timeIntervalSince1970)",
            content: content,
            trigger: nil
        )

        UNUserNotificationCenter.current().add(request)
    }

    private func playAlarmPattern() {
        Task.detached {
            for _ in 0..<6 {
                AudioServicesPlayAlertSound(1005)
                try? await Task.sleep(nanoseconds: 700_000_000)
            }
        }
    }

    private func playVibrationPattern() {
        Task.detached {
            for _ in 0..<8 {
                AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
                try? await Task.sleep(nanoseconds: 500_000_000)
            }
        }
    }
}
