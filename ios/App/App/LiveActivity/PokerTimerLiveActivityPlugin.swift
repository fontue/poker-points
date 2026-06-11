import ActivityKit
import Capacitor
import Foundation

@objc(PokerTimerLiveActivityPlugin)
public class PokerTimerLiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PokerTimerLiveActivityPlugin"
    public let jsName = "PokerTimerLiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise)
    ]

    @objc public func start(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.reject("Live Activity requires iOS 16.1 or later.")
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.reject("Live Activities are disabled for this device or app.")
            return
        }

        Task {
            await endCurrentActivity()

            do {
                let attributes = PokerTimerActivityAttributes(tournamentName: "Poker Points")
                let state = try makeState(from: call)
                try requestActivity(attributes: attributes, state: state)
                call.resolve()
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc public func update(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.reject("Live Activity requires iOS 16.1 or later.")
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.reject("Live Activities are disabled for this device or app.")
            return
        }

        Task {
            do {
                let state = try makeState(from: call)
                if let activity = Activity<PokerTimerActivityAttributes>.activities.first {
                    await updateActivity(activity, state: state)
                } else if state.isRunning {
                    let attributes = PokerTimerActivityAttributes(tournamentName: "Poker Points")
                    try requestActivity(attributes: attributes, state: state)
                }
                call.resolve()
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc public func end(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve()
            return
        }

        Task {
            await endCurrentActivity()
            call.resolve()
        }
    }

    @available(iOS 16.1, *)
    private func endCurrentActivity() async {
        for activity in Activity<PokerTimerActivityAttributes>.activities {
            await activity.end(using: nil, dismissalPolicy: .immediate)
        }
    }

    @available(iOS 16.1, *)
    private func requestActivity(attributes: PokerTimerActivityAttributes, state: PokerTimerActivityAttributes.ContentState) throws {
        if #available(iOS 16.2, *) {
            _ = try Activity.request(
                attributes: attributes,
                content: ActivityContent(state: state, staleDate: state.endsAt),
                pushType: nil
            )
        } else {
            _ = try Activity.request(attributes: attributes, contentState: state, pushType: nil)
        }
    }

    @available(iOS 16.1, *)
    private func updateActivity(_ activity: Activity<PokerTimerActivityAttributes>, state: PokerTimerActivityAttributes.ContentState) async {
        if #available(iOS 16.2, *) {
            await activity.update(ActivityContent(state: state, staleDate: state.endsAt))
        } else {
            await activity.update(using: state)
        }
    }

    @available(iOS 16.1, *)
    private func makeState(from call: CAPPluginCall) throws -> PokerTimerActivityAttributes.ContentState {
        let levelIndex = call.getInt("levelIndex") ?? 0
        let smallBlind = call.getInt("smallBlind") ?? 0
        let bigBlind = call.getInt("bigBlind") ?? 0
        let ante = call.getInt("ante") ?? 0
        let endsAtMilliseconds = call.getDouble("endsAt") ?? Date().timeIntervalSince1970 * 1000
        let isRunning = call.getBool("isRunning") ?? false
        let remainingSeconds = call.getInt("remainingSeconds") ?? 0
        let colorUpChip = call.getInt("colorUpChip")
        let levelStartedAtMilliseconds = call.getDouble("levelStartedAt")
        let rawLevels = call.getArray("levels", JSObject.self) ?? []
        let levels = rawLevels.map { rawLevel in
            PokerTimerActivityAttributes.TimerLevel(
                smallBlind: intValue(rawLevel["smallBlind"]),
                bigBlind: intValue(rawLevel["bigBlind"]),
                ante: intValue(rawLevel["ante"]),
                durationSeconds: max(1, intValue(rawLevel["durationSeconds"], fallback: 1)),
                colorUpChip: optionalIntValue(rawLevel["colorUpChip"])
            )
        }

        return PokerTimerActivityAttributes.ContentState(
            levelIndex: levelIndex,
            smallBlind: smallBlind,
            bigBlind: bigBlind,
            ante: ante,
            endsAt: Date(timeIntervalSince1970: endsAtMilliseconds / 1000),
            isRunning: isRunning,
            remainingSeconds: remainingSeconds,
            colorUpChip: colorUpChip,
            levelStartedAt: levelStartedAtMilliseconds.map { Date(timeIntervalSince1970: $0 / 1000) },
            levels: levels
        )
    }

    private func intValue(_ value: Any?, fallback: Int = 0) -> Int {
        if let intValue = value as? Int {
            return intValue
        }
        if let numberValue = value as? NSNumber {
            return numberValue.intValue
        }
        if let stringValue = value as? String, let intValue = Int(stringValue) {
            return intValue
        }
        return fallback
    }

    private func optionalIntValue(_ value: Any?) -> Int? {
        guard value != nil else { return nil }
        return intValue(value)
    }
}
