import Foundation

struct NativePlayer: Identifiable, Codable, Equatable {
    var id = UUID()
    var name: String
    var buyIns = 1
    var paidEntries = 0
    var isEliminated = false
    var eliminatedAt: Date?
}

struct NativeTimerLevel: Codable, Equatable {
    var smallBlind: Int
    var bigBlind: Int
    var ante: Int
    var durationSeconds: Int
    var colorUpChip: Int?
}

struct NativeSettings: Codable, Equatable {
    var buyInPoints = 1
    var buyInChips = 1
    var prizeAdjustmentPoints = 0
    var prizePlaces = 3
    var prizeDistribution = [60, 30, 10]
    var prizeRoundingStep = 1
    var timerLevels = NativeSettings.defaultTimerLevels
    var timerSoundEnabled = true
    var timerVibrationEnabled = true
    var timerNotificationEnabled = true

    init() {}

    private enum CodingKeys: String, CodingKey {
        case buyInPoints
        case buyInChips
        case prizeAdjustmentPoints
        case prizePlaces
        case prizeDistribution
        case prizeRoundingStep
        case timerLevels
        case timerSoundEnabled
        case timerVibrationEnabled
        case timerNotificationEnabled
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        buyInPoints = try container.decodeIfPresent(Int.self, forKey: .buyInPoints) ?? 1
        buyInChips = try container.decodeIfPresent(Int.self, forKey: .buyInChips) ?? 1
        prizeAdjustmentPoints = try container.decodeIfPresent(Int.self, forKey: .prizeAdjustmentPoints) ?? 0
        prizePlaces = try container.decodeIfPresent(Int.self, forKey: .prizePlaces) ?? 3
        prizeDistribution = try container.decodeIfPresent([Int].self, forKey: .prizeDistribution) ?? [60, 30, 10]
        prizeRoundingStep = try container.decodeIfPresent(Int.self, forKey: .prizeRoundingStep) ?? 1
        timerLevels = try container.decodeIfPresent([NativeTimerLevel].self, forKey: .timerLevels) ?? NativeSettings.defaultTimerLevels
        timerSoundEnabled = try container.decodeIfPresent(Bool.self, forKey: .timerSoundEnabled) ?? true
        timerVibrationEnabled = try container.decodeIfPresent(Bool.self, forKey: .timerVibrationEnabled) ?? true
        timerNotificationEnabled = try container.decodeIfPresent(Bool.self, forKey: .timerNotificationEnabled) ?? true
    }

    static let defaultTimerLevels: [NativeTimerLevel] = [
        .init(smallBlind: 100, bigBlind: 200, ante: 200, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 150, bigBlind: 250, ante: 250, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 150, bigBlind: 300, ante: 300, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 200, bigBlind: 400, ante: 400, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 250, bigBlind: 500, ante: 500, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 300, bigBlind: 600, ante: 600, durationSeconds: 900, colorUpChip: 50),
        .init(smallBlind: 400, bigBlind: 800, ante: 800, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 500, bigBlind: 1000, ante: 1000, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 600, bigBlind: 1200, ante: 1200, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 800, bigBlind: 1600, ante: 1600, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 1000, bigBlind: 2000, ante: 2000, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 1200, bigBlind: 2400, ante: 2400, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 1500, bigBlind: 3000, ante: 3000, durationSeconds: 900, colorUpChip: 100),
        .init(smallBlind: 2000, bigBlind: 4000, ante: 4000, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 2500, bigBlind: 5000, ante: 5000, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 3000, bigBlind: 6000, ante: 6000, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 4000, bigBlind: 8000, ante: 8000, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 5000, bigBlind: 10000, ante: 10000, durationSeconds: 900, colorUpChip: nil),
        .init(smallBlind: 6000, bigBlind: 12000, ante: 12000, durationSeconds: 900, colorUpChip: 500),
        .init(smallBlind: 8000, bigBlind: 16000, ante: 16000, durationSeconds: 900, colorUpChip: nil)
    ]
}

struct NativeTimerState: Codable, Equatable {
    var currentLevelIndex = 0
    var remainingSeconds = 900
    var isRunning = false
    var levelStartedAt: Date?
    var endsAt: Date?
}

struct NativeTournamentSnapshot: Codable {
    var players: [NativePlayer]
    var settings: NativeSettings
    var timer: NativeTimerState
    var playerNameHistory: [String]

    init(players: [NativePlayer], settings: NativeSettings, timer: NativeTimerState, playerNameHistory: [String]) {
        self.players = players
        self.settings = settings
        self.timer = timer
        self.playerNameHistory = playerNameHistory
    }

    private enum CodingKeys: String, CodingKey {
        case players
        case settings
        case timer
        case playerNameHistory
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        players = try container.decode([NativePlayer].self, forKey: .players)
        settings = try container.decode(NativeSettings.self, forKey: .settings)
        timer = try container.decode(NativeTimerState.self, forKey: .timer)
        playerNameHistory = try container.decodeIfPresent([String].self, forKey: .playerNameHistory) ?? []
    }
}

struct NativePrizePayout: Identifiable {
    let place: Int
    let percent: Int
    let effectivePercent: Double
    let amount: Int
    let playerName: String?

    var id: Int { place }
}
