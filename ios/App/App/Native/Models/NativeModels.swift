import Foundation

struct NativePlayer: Identifiable, Codable, Equatable {
    var id = UUID()
    var name: String
    var earlyEntries = 0
    var buyIns = 0
    var paidEntries = 0
    var isEliminated = false
    var eliminatedAt: Date?
    var rebuyTimerRemainingSeconds: Int?

    init(name: String) {
        self.name = name
    }

    var totalEntries: Int {
        earlyEntries + buyIns
    }

    private enum CodingKeys: String, CodingKey {
        case id
        case name
        case earlyEntries
        case buyIns
        case paidEntries
        case isEliminated
        case eliminatedAt
        case rebuyTimerRemainingSeconds
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        name = try container.decode(String.self, forKey: .name)
        earlyEntries = try container.decodeIfPresent(Int.self, forKey: .earlyEntries) ?? 0
        buyIns = try container.decodeIfPresent(Int.self, forKey: .buyIns) ?? 0
        paidEntries = try container.decodeIfPresent(Int.self, forKey: .paidEntries) ?? 0
        isEliminated = try container.decodeIfPresent(Bool.self, forKey: .isEliminated) ?? false
        eliminatedAt = try container.decodeIfPresent(Date.self, forKey: .eliminatedAt)
        rebuyTimerRemainingSeconds = try container.decodeIfPresent(Int.self, forKey: .rebuyTimerRemainingSeconds)
    }
}

struct NativeTimerLevel: Codable, Equatable {
    var smallBlind: Int
    var bigBlind: Int
    var ante: Int
    var durationSeconds: Int
    var colorUpChip: Int?
}

struct NativeSettings: Codable, Equatable {
    var buyInPoints = 500
    var buyInChips = 20_000
    var earlyEntryChips = 20_000
    var prizeAdjustmentPoints = 0
    var prizePlaces = 3
    var prizeDistribution = [60, 30, 10]
    var prizeRoundingStep = 500
    var timerLevels = NativeSettings.defaultTimerLevels
    var timerSoundEnabled = true
    var timerNotificationEnabled = true
    var rebuyTimerEnabled = false
    var rebuyTimerIntervalSeconds = 900

    init() {}

    private enum CodingKeys: String, CodingKey {
        case buyInPoints
        case buyInChips
        case earlyEntryChips
        case prizeAdjustmentPoints
        case prizePlaces
        case prizeDistribution
        case prizeRoundingStep
        case timerLevels
        case timerSoundEnabled
        case timerNotificationEnabled
        case rebuyTimerEnabled
        case rebuyTimerIntervalSeconds
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        buyInPoints = try container.decodeIfPresent(Int.self, forKey: .buyInPoints) ?? 500
        buyInChips = try container.decodeIfPresent(Int.self, forKey: .buyInChips) ?? 20_000
        earlyEntryChips = try container.decodeIfPresent(Int.self, forKey: .earlyEntryChips) ?? buyInChips
        prizeAdjustmentPoints = try container.decodeIfPresent(Int.self, forKey: .prizeAdjustmentPoints) ?? 0
        prizePlaces = try container.decodeIfPresent(Int.self, forKey: .prizePlaces) ?? 3
        prizeDistribution = try container.decodeIfPresent([Int].self, forKey: .prizeDistribution) ?? [60, 30, 10]
        prizeRoundingStep = try container.decodeIfPresent(Int.self, forKey: .prizeRoundingStep) ?? 500
        timerLevels = try container.decodeIfPresent([NativeTimerLevel].self, forKey: .timerLevels) ?? NativeSettings.defaultTimerLevels
        timerSoundEnabled = try container.decodeIfPresent(Bool.self, forKey: .timerSoundEnabled) ?? true
        timerNotificationEnabled = try container.decodeIfPresent(Bool.self, forKey: .timerNotificationEnabled) ?? true
        rebuyTimerEnabled = try container.decodeIfPresent(Bool.self, forKey: .rebuyTimerEnabled) ?? false
        rebuyTimerIntervalSeconds = try container.decodeIfPresent(Int.self, forKey: .rebuyTimerIntervalSeconds) ?? 900
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
