import Combine
import Foundation

final class NativeTournamentStore: ObservableObject {
    @Published var players: [NativePlayer] = []
    @Published var settings = NativeSettings()
    @Published var timer = NativeTimerState()
    @Published var playerNameHistory: [String] = []

    private let storageKey = "native-poker-points-state"

    init() {
        load()
        normalizeTimer()
        syncLiveActivity()
    }

    var currentLevel: NativeTimerLevel {
        settings.timerLevels[min(timer.currentLevelIndex, settings.timerLevels.count - 1)]
    }

    var pointsInGame: Int {
        players.reduce(0) { $0 + $1.buyIns * settings.buyInPoints }
    }

    var pointsPaid: Int {
        players.reduce(0) { $0 + $1.paidEntries * settings.buyInPoints }
    }

    var prizePoints: Int {
        pointsInGame + settings.prizeAdjustmentPoints
    }

    var chipsInGame: Int {
        players.reduce(0) { $0 + $1.buyIns * settings.buyInChips }
    }

    var activePlayersCount: Int {
        players.filter { !$0.isEliminated }.count
    }

    var averageStack: Int {
        guard activePlayersCount > 0 else { return 0 }
        return chipsInGame / activePlayersCount
    }

    var totalChipsInBigBlinds: Double {
        guard currentLevel.bigBlind > 0 else { return 0 }
        return Double(chipsInGame) / Double(currentLevel.bigBlind)
    }

    var averageStackInBigBlinds: Double {
        guard currentLevel.bigBlind > 0 else { return 0 }
        return Double(averageStack) / Double(currentLevel.bigBlind)
    }

    func addPlayer(name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        guard !players.contains(where: { $0.name.caseInsensitiveCompare(trimmed) == .orderedSame }) else { return }
        players.append(NativePlayer(name: trimmed))
        rememberPlayerName(trimmed)
        save()
    }

    func deleteHistoryName(_ name: String) {
        playerNameHistory.removeAll { $0.caseInsensitiveCompare(name) == .orderedSame }
        save()
    }

    func incrementBuyIn(_ player: NativePlayer) {
        mutate(player) { $0.buyIns += 1 }
    }

    func decrementBuyIn(_ player: NativePlayer) {
        mutate(player) {
            $0.buyIns = max(0, $0.buyIns - 1)
            $0.paidEntries = min($0.paidEntries, $0.buyIns)
        }
    }

    func incrementPaid(_ player: NativePlayer) {
        mutate(player) { $0.paidEntries = min($0.buyIns, $0.paidEntries + 1) }
    }

    func decrementPaid(_ player: NativePlayer) {
        mutate(player) { $0.paidEntries = max(0, $0.paidEntries - 1) }
    }

    func toggleEliminated(_ player: NativePlayer) {
        mutate(player) {
            $0.isEliminated.toggle()
            $0.eliminatedAt = $0.isEliminated ? Date() : nil
        }
    }

    func delete(_ player: NativePlayer) {
        players.removeAll { $0.id == player.id }
        save()
    }

    func resetTournament() {
        players = []
        resetTimer()
        save()
    }

    func toggleTimer() {
        syncTimer(to: Date())
        if timer.isRunning {
            timer.isRunning = false
            timer.levelStartedAt = nil
            timer.endsAt = nil
        } else if timer.remainingSeconds > 0 {
            let now = Date()
            let elapsedInCurrentLevel = max(0, currentLevel.durationSeconds - timer.remainingSeconds)
            timer.isRunning = true
            timer.levelStartedAt = now.addingTimeInterval(-TimeInterval(elapsedInCurrentLevel))
            timer.endsAt = now.addingTimeInterval(TimeInterval(timer.remainingSeconds))
        }
        save()
        syncLiveActivity()
    }

    func tick() {
        syncTimer(to: Date())
    }

    func nextLevel() {
        setLevel(timer.currentLevelIndex + 1)
    }

    func previousLevel() {
        setLevel(timer.currentLevelIndex - 1)
    }

    func resetTimer() {
        timer.currentLevelIndex = 0
        timer.remainingSeconds = settings.timerLevels.first?.durationSeconds ?? 900
        timer.isRunning = false
        timer.levelStartedAt = nil
        timer.endsAt = nil
        save()
        syncLiveActivity()
    }

    func updateSettings(_ next: NativeSettings) {
        settings = normalizedSettings(next)
        timer.currentLevelIndex = min(timer.currentLevelIndex, max(0, settings.timerLevels.count - 1))
        timer.remainingSeconds = min(timer.remainingSeconds, currentLevel.durationSeconds)
        save()
        syncLiveActivity()
    }

    func eliminatedPlace(for player: NativePlayer) -> Int? {
        eliminatedPlaces()[player.id]
    }

    func prizePayouts() -> [NativePrizePayout] {
        let amounts = prizeAmounts()
        let distribution = normalizedPrizeDistribution()
        let places = max(1, settings.prizePlaces)
        let placeMap = eliminatedPlaces()

        return (0..<places).map { index in
            let place = index + 1
            let amount = index < amounts.count ? amounts[index] : 0
            let player = players.first { placeMap[$0.id] == place }

            return NativePrizePayout(
                place: place,
                percent: index < distribution.count ? distribution[index] : 0,
                effectivePercent: prizePoints > 0 ? Double(amount) / Double(prizePoints) * 100 : 0,
                amount: amount,
                playerName: player?.name
            )
        }
    }

    func finalTableRemainder() -> Int {
        let payouts = prizePayouts()
        guard let second = payouts.first(where: { $0.place == 2 }) else {
            return prizePoints
        }

        let lowerPaid = payouts.filter { $0.place >= 3 }.reduce(0) { $0 + $1.amount }
        return max(0, prizePoints - lowerPaid - second.amount * 2)
    }

    private func eliminatedPlaces() -> [UUID: Int] {
        let eliminated = players
            .filter { $0.isEliminated && $0.eliminatedAt != nil }
            .sorted { ($0.eliminatedAt ?? .distantPast) < ($1.eliminatedAt ?? .distantPast) }

        var places: [UUID: Int] = [:]
        let totalPlayers = players.count
        for (index, player) in eliminated.enumerated() {
            places[player.id] = max(1, totalPlayers - index)
        }

        let active = players.filter { !$0.isEliminated }
        if active.count == 1 {
            places[active[0].id] = 1
        }

        return places
    }

    private func prizeAmounts() -> [Int] {
        let shares = normalizedPrizeShares()
        let step = max(1, settings.prizeRoundingStep)
        let rawAmounts = shares.map { Double(prizePoints) * $0 }
        var amounts = rawAmounts.map { Int(floor($0 / Double(step))) * step }
        var remaining = prizePoints - amounts.reduce(0, +)
        let order = rawAmounts.indices.sorted {
            (rawAmounts[$0] - Double(amounts[$0])) > (rawAmounts[$1] - Double(amounts[$1]))
        }

        while remaining >= step && !order.isEmpty {
            for index in order where remaining >= step {
                amounts[index] += step
                remaining -= step
            }
        }

        return amounts
    }

    private func normalizedPrizeShares() -> [Double] {
        let distribution = normalizedPrizeDistribution()
        let total = distribution.reduce(0, +)
        if total > 0 {
            return distribution.map { Double($0) / Double(total) }
        }
        return createEqualPrizeDistribution(places: settings.prizePlaces).map { Double($0) / 100 }
    }

    private func normalizedPrizeDistribution() -> [Int] {
        let places = max(1, settings.prizePlaces)
        let raw = Array(settings.prizeDistribution.prefix(places)).map { max(0, $0) }
        if raw.count < places {
            let fallback = createEqualPrizeDistribution(places: places)
            return raw + fallback.dropFirst(raw.count)
        }
        return raw
    }

    private func createEqualPrizeDistribution(places: Int) -> [Int] {
        let safePlaces = max(1, places)
        let base = 100 / safePlaces
        var distribution = Array(repeating: base, count: safePlaces)
        distribution[0] += 100 - base * safePlaces
        return distribution
    }

    private func setLevel(_ levelIndex: Int) {
        let nextIndex = min(max(0, levelIndex), max(0, settings.timerLevels.count - 1))
        timer.currentLevelIndex = nextIndex
        timer.remainingSeconds = settings.timerLevels[nextIndex].durationSeconds
        if timer.isRunning {
            let now = Date()
            timer.levelStartedAt = now
            timer.endsAt = now.addingTimeInterval(TimeInterval(timer.remainingSeconds))
        }
        save()
        syncLiveActivity()
    }

    private func syncTimer(to now: Date) {
        guard timer.isRunning, var endsAt = timer.endsAt else { return }
        var index = timer.currentLevelIndex
        var levelStart = timer.levelStartedAt ?? now

        let previousLevelIndex = index

        while now >= endsAt && index < settings.timerLevels.count - 1 {
            index += 1
            levelStart = endsAt
            endsAt = levelStart.addingTimeInterval(TimeInterval(settings.timerLevels[index].durationSeconds))
        }

        let remaining = max(0, Int(ceil(endsAt.timeIntervalSince(now))))
        timer.currentLevelIndex = index
        timer.remainingSeconds = remaining
        if remaining == 0 {
            timer.isRunning = false
            timer.levelStartedAt = nil
            timer.endsAt = nil
        } else {
            timer.levelStartedAt = levelStart
            timer.endsAt = endsAt
        }
        if previousLevelIndex != timer.currentLevelIndex {
            NativeTimerAlertManager.shared.trigger(settings: settings, levelIndex: timer.currentLevelIndex, level: currentLevel)
        }
        if previousLevelIndex != timer.currentLevelIndex || !timer.isRunning {
            save()
            syncLiveActivity()
        }
    }

    private func normalizeTimer() {
        settings = normalizedSettings(settings)
        timer.currentLevelIndex = min(timer.currentLevelIndex, max(0, settings.timerLevels.count - 1))
        if !timer.isRunning {
            timer.remainingSeconds = min(timer.remainingSeconds, currentLevel.durationSeconds)
        }
    }

    private func normalizedSettings(_ settings: NativeSettings) -> NativeSettings {
        var normalized = settings
        normalized.buyInPoints = max(1, normalized.buyInPoints)
        normalized.buyInChips = max(1, normalized.buyInChips)
        normalized.prizePlaces = max(1, min(20, normalized.prizePlaces))
        normalized.prizeRoundingStep = max(1, normalized.prizeRoundingStep)
        normalized.prizeDistribution = Array(normalized.prizeDistribution.prefix(normalized.prizePlaces))
        if normalized.prizeDistribution.count < normalized.prizePlaces {
            normalized.prizeDistribution = createEqualPrizeDistribution(places: normalized.prizePlaces)
        }
        if normalized.timerLevels.isEmpty {
            normalized.timerLevels = NativeSettings.defaultTimerLevels
        }
        return normalized
    }

    private func mutate(_ player: NativePlayer, _ update: (inout NativePlayer) -> Void) {
        guard let index = players.firstIndex(where: { $0.id == player.id }) else { return }
        update(&players[index])
        save()
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let snapshot = try? JSONDecoder().decode(NativeTournamentSnapshot.self, from: data) else {
            timer.remainingSeconds = settings.timerLevels.first?.durationSeconds ?? 900
            return
        }

        players = snapshot.players
        settings = snapshot.settings
        timer = snapshot.timer
        playerNameHistory = snapshot.playerNameHistory
    }

    private func save() {
        let snapshot = NativeTournamentSnapshot(
            players: players,
            settings: settings,
            timer: timer,
            playerNameHistory: playerNameHistory
        )
        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    private func rememberPlayerName(_ name: String) {
        playerNameHistory.removeAll { $0.caseInsensitiveCompare(name) == .orderedSame }
        playerNameHistory.insert(name, at: 0)
        playerNameHistory = Array(playerNameHistory.prefix(40))
    }

    private func syncLiveActivity() {
        NativeLiveActivityManager.shared.sync(settings: settings, timer: timer)
    }
}
