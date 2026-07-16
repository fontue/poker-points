import Combine
import Foundation

final class NativeTournamentStore: ObservableObject {
    @Published var players: [NativePlayer] = []
    @Published var settings = NativeSettings()
    @Published var timer = NativeTimerState()
    private(set) var playerNameHistory: [String] = []

    private let storageKey = "native-poker-points-state"
    private let persistenceQueue = DispatchQueue(label: "app.pokerpoints.persistence", qos: .utility)
    private var lastRebuySyncAt: Date?
    private var externalTimerServicesActivated = false

    init() {
        load()
        normalizeTimer()
    }

    func activateExternalTimerServices() {
        guard !externalTimerServicesActivated else { return }
        externalTimerServicesActivated = true
        syncTimer(to: Date())
        syncLiveActivity()
        syncAlarms()
    }

    var currentLevel: NativeTimerLevel {
        settings.timerLevels[min(timer.currentLevelIndex, settings.timerLevels.count - 1)]
    }

    var pointsInGame: Int {
        players.reduce(0) { $0 + $1.totalEntries * settings.buyInPoints }
    }

    var pointsPaid: Int {
        players.reduce(0) { $0 + $1.paidEntries * settings.buyInPoints }
    }

    var prizePoints: Int {
        pointsInGame + settings.prizeAdjustmentPoints
    }

    var chipsInGame: Int {
        players.reduce(0) {
            $0 + $1.earlyEntries * settings.earlyEntryChips + $1.buyIns * settings.buyInChips
        }
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
        rememberPlayerName(trimmed)
        guard !players.contains(where: { $0.name.caseInsensitiveCompare(trimmed) == .orderedSame }) else {
            save()
            return
        }
        syncRunningRebuyTimersBeforeMutation()
        var nextPlayers = players
        nextPlayers.append(NativePlayer(name: trimmed))
        players = nextPlayers
        save()
    }

    func deleteHistoryName(_ name: String) {
        playerNameHistory.removeAll { $0.caseInsensitiveCompare(name) == .orderedSame }
        save()
    }

    func incrementEarlyEntry(_ player: NativePlayer) {
        syncRunningRebuyTimersBeforeMutation()
        mutate(player) {
            guard $0.totalEntries == 0 else { return }
            $0.earlyEntries = 1
        }
    }

    func decrementEarlyEntry(_ player: NativePlayer) {
        mutate(player) {
            $0.earlyEntries = 0
            $0.paidEntries = min($0.paidEntries, $0.totalEntries)
            if $0.totalEntries <= 1 {
                $0.rebuyTimerRemainingSeconds = nil
            }
        }
    }

    func incrementBuyIn(_ player: NativePlayer) {
        syncRunningRebuyTimersBeforeMutation()
        mutate(player) {
            let shouldStartRebuyTimer = $0.totalEntries > 0
            $0.buyIns += 1
            if shouldStartRebuyTimer {
                startRebuyTimerIfNeeded(for: &$0)
            }
        }
    }

    func decrementBuyIn(_ player: NativePlayer) {
        mutate(player) {
            $0.buyIns = max(0, $0.buyIns - 1)
            $0.paidEntries = min($0.paidEntries, $0.totalEntries)
            if $0.totalEntries <= 1 {
                $0.rebuyTimerRemainingSeconds = nil
            }
        }
    }

    func incrementPaid(_ player: NativePlayer) {
        mutate(player) { $0.paidEntries = min($0.totalEntries, $0.paidEntries + 1) }
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
        players = players.filter { $0.id != player.id }
        save()
    }

    func resetTournament() {
        players = []
        timer = initialTimerState()
        lastRebuySyncAt = nil
        save()
        syncLiveActivity()
        syncAlarms()
    }

    func toggleTimer() {
        syncTimer(to: Date())
        var nextTimer = timer
        if nextTimer.isRunning {
            syncRebuyTimers(to: Date())
            nextTimer.isRunning = false
            nextTimer.levelStartedAt = nil
            nextTimer.endsAt = nil
            lastRebuySyncAt = nil
        } else if nextTimer.remainingSeconds > 0 {
            let now = Date()
            let elapsedInCurrentLevel = max(0, currentLevel.durationSeconds - nextTimer.remainingSeconds)
            nextTimer.isRunning = true
            nextTimer.levelStartedAt = now.addingTimeInterval(-TimeInterval(elapsedInCurrentLevel))
            nextTimer.endsAt = now.addingTimeInterval(TimeInterval(nextTimer.remainingSeconds))
            lastRebuySyncAt = now
        }
        timer = nextTimer
        save()
        syncLiveActivity()
        syncAlarms()
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
        timer = initialTimerState()
        lastRebuySyncAt = nil
        save()
        syncLiveActivity()
        syncAlarms()
    }

    func updateSettings(_ next: NativeSettings) {
        let nextSettings = normalizedSettings(next)
        settings = nextSettings
        if !nextSettings.rebuyTimerEnabled {
            clearRebuyTimers()
        }
        var nextTimer = timer
        nextTimer.currentLevelIndex = min(nextTimer.currentLevelIndex, max(0, nextSettings.timerLevels.count - 1))
        nextTimer.remainingSeconds = min(nextTimer.remainingSeconds, currentLevel.durationSeconds)
        timer = nextTimer
        save()
        syncLiveActivity()
        syncAlarms()
    }

    func updateGameSettings(_ next: NativeSettings) {
        var merged = settings
        merged.buyInPoints = next.buyInPoints
        merged.buyInChips = next.buyInChips
        merged.earlyEntryChips = next.earlyEntryChips
        merged.prizeAdjustmentPoints = next.prizeAdjustmentPoints
        merged.prizePlaces = next.prizePlaces
        merged.prizeDistribution = next.prizeDistribution
        merged.prizeRoundingStep = next.prizeRoundingStep
        settings = normalizedSettings(merged)
        save()
    }

    var eliminatedPlacesByPlayer: [UUID: Int] {
        eliminatedPlaces()
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
        var nextTimer = timer
        nextTimer.currentLevelIndex = nextIndex
        nextTimer.remainingSeconds = settings.timerLevels[nextIndex].durationSeconds
        if nextTimer.isRunning {
            let now = Date()
            nextTimer.levelStartedAt = now
            nextTimer.endsAt = now.addingTimeInterval(TimeInterval(nextTimer.remainingSeconds))
        }
        timer = nextTimer
        save()
        syncLiveActivity()
        syncAlarms()
    }

    private func syncTimer(to now: Date) {
        guard timer.isRunning, var endsAt = timer.endsAt else { return }
        syncRebuyTimers(to: now)
        var nextTimer = timer
        var index = nextTimer.currentLevelIndex
        var levelStart = nextTimer.levelStartedAt ?? now

        let previousLevelIndex = index

        while now >= endsAt && index < settings.timerLevels.count - 1 {
            index += 1
            levelStart = endsAt
            endsAt = levelStart.addingTimeInterval(TimeInterval(settings.timerLevels[index].durationSeconds))
        }

        let remaining = max(0, Int(ceil(endsAt.timeIntervalSince(now))))
        nextTimer.currentLevelIndex = index
        nextTimer.remainingSeconds = remaining
        if remaining == 0 {
            nextTimer.isRunning = false
            nextTimer.levelStartedAt = nil
            nextTimer.endsAt = nil
        } else {
            nextTimer.levelStartedAt = levelStart
            nextTimer.endsAt = endsAt
        }
        guard nextTimer != timer else { return }
        timer = nextTimer
        if previousLevelIndex != nextTimer.currentLevelIndex || !nextTimer.isRunning {
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
        normalized.buyInPoints = max(100, ((normalized.buyInPoints + 50) / 100) * 100)
        normalized.buyInChips = max(5_000, Int((Double(normalized.buyInChips) / 5_000).rounded()) * 5_000)
        normalized.earlyEntryChips = max(5_000, Int((Double(normalized.earlyEntryChips) / 5_000).rounded()) * 5_000)
        normalized.prizeAdjustmentPoints = Int((Double(normalized.prizeAdjustmentPoints) / 100).rounded()) * 100
        normalized.prizePlaces = max(1, min(20, normalized.prizePlaces))
        normalized.prizeRoundingStep = max(100, Int((Double(normalized.prizeRoundingStep) / 100).rounded()) * 100)
        normalized.rebuyTimerIntervalSeconds = max(60, normalized.rebuyTimerIntervalSeconds)
        normalized.prizeDistribution = Array(normalized.prizeDistribution.prefix(normalized.prizePlaces))
        if normalized.prizeDistribution.count < normalized.prizePlaces {
            normalized.prizeDistribution = createEqualPrizeDistribution(places: normalized.prizePlaces)
        }
        if normalized.timerLevels.isEmpty {
            normalized.timerLevels = NativeSettings.defaultTimerLevels
        }
        return normalized
    }

    private func startRebuyTimerIfNeeded(for player: inout NativePlayer) {
        guard settings.rebuyTimerEnabled else { return }
        player.rebuyTimerRemainingSeconds = max(60, settings.rebuyTimerIntervalSeconds)
    }

    private func syncRebuyTimers(to now: Date) {
        guard settings.rebuyTimerEnabled else { return }
        guard let lastSync = lastRebuySyncAt else {
            lastRebuySyncAt = now
            return
        }

        let elapsed = Int(now.timeIntervalSince(lastSync))
        guard elapsed > 0 else { return }

        var nextPlayers = players
        var changed = false
        for index in nextPlayers.indices {
            guard let remaining = nextPlayers[index].rebuyTimerRemainingSeconds, remaining > 0 else { continue }
            nextPlayers[index].rebuyTimerRemainingSeconds = max(0, remaining - elapsed)
            changed = true
        }
        lastRebuySyncAt = lastSync.addingTimeInterval(TimeInterval(elapsed))

        if changed {
            players = nextPlayers
        }
    }

    private func syncRunningRebuyTimersBeforeMutation() {
        guard timer.isRunning else { return }
        syncRebuyTimers(to: Date())
    }

    private func clearRebuyTimers() {
        let nextPlayers = players.map { player -> NativePlayer in
            var player = player
            player.rebuyTimerRemainingSeconds = nil
            return player
        }
        if nextPlayers != players {
            players = nextPlayers
        }
    }

    private func mutate(_ player: NativePlayer, _ update: (inout NativePlayer) -> Void) {
        guard let index = players.firstIndex(where: { $0.id == player.id }) else { return }
        var nextPlayers = players
        update(&nextPlayers[index])
        players = nextPlayers
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
        let storageKey = storageKey
        persistenceQueue.async {
            guard let data = try? JSONEncoder().encode(snapshot) else { return }
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func rememberPlayerName(_ name: String) {
        var nextHistory = playerNameHistory.filter { $0.caseInsensitiveCompare(name) != .orderedSame }
        nextHistory.insert(name, at: 0)
        playerNameHistory = Array(nextHistory.prefix(40))
    }

    private func initialTimerState() -> NativeTimerState {
        NativeTimerState(
            currentLevelIndex: 0,
            remainingSeconds: settings.timerLevels.first?.durationSeconds ?? 900,
            isRunning: false,
            levelStartedAt: nil,
            endsAt: nil
        )
    }

    private func syncLiveActivity() {
        NativeLiveActivityManager.shared.sync(settings: settings, timer: timer)
    }

    private func syncAlarms() {
        NativeTimerAlertManager.shared.sync(settings: settings, timer: timer)
    }
}
