import ActivityKit
import Foundation

@available(iOS 16.1, *)
struct PokerTimerActivityAttributes: ActivityAttributes {
    public struct TimerLevel: Codable, Hashable {
        var smallBlind: Int
        var bigBlind: Int
        var ante: Int
        var durationSeconds: Int
        var colorUpChip: Int?
    }

    public struct ContentState: Codable, Hashable {
        var levelIndex: Int
        var smallBlind: Int
        var bigBlind: Int
        var ante: Int
        var endsAt: Date
        var isRunning: Bool
        var remainingSeconds: Int
        var colorUpChip: Int?
        var levelStartedAt: Date?
        var levels: [TimerLevel]
    }

    var tournamentName: String
}
