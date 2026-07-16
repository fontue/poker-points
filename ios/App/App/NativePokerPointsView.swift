import SwiftUI
import UIKit

enum NativeTheme {
    static let backgroundTop = Color(red: 0.075, green: 0.074, blue: 0.09)
    static let backgroundBottom = Color(red: 0.025, green: 0.026, blue: 0.032)
    static let surface = Color.white.opacity(0.065)
    static let surfaceStrong = Color.white.opacity(0.095)
    static let border = Color.white.opacity(0.105)
    static let mutedButton = Color.white.opacity(0.18)
    static let accent = Color(red: 0.64, green: 0.54, blue: 0.92)
    static let accentSoft = Color(red: 0.64, green: 0.54, blue: 0.92).opacity(0.18)
    static let orange = Color(red: 0.94, green: 0.66, blue: 0.36)
    static let green = Color(red: 0.47, green: 0.78, blue: 0.61)
    static let cyan = Color(red: 0.48, green: 0.78, blue: 0.86)
    static let blue = Color(red: 0.50, green: 0.64, blue: 0.94)
    static let yellow = Color(red: 0.96, green: 0.78, blue: 0.34)
    static let red = Color(red: 0.94, green: 0.45, blue: 0.48)
    static let dialogBackground = Color(uiColor: .systemBackground)
    static let mainSurface = Color(uiColor: .secondarySystemGroupedBackground)
    static let mainControl = Color(uiColor: .tertiarySystemFill)
}

extension View {
    @ViewBuilder
    func scrollContentBackgroundHiddenIfAvailable() -> some View {
        if #available(iOS 16.0, *) {
            self.scrollContentBackground(.hidden)
        } else {
            self
        }
    }

}

struct NativePokerPointsView: View {
    @StateObject private var store = NativeTournamentStore()
    @State private var activeSheet: NativeSheet?
    @State private var confirmation: NativeConfirmation?
    private let ticker = Timer.publish(every: 1, on: .main, in: .default).autoconnect()

    var body: some View {
        ZStack {
            Color(uiColor: .systemBackground)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                header
                controls
                timerCard
                playersList
                footer
            }
            .padding(.horizontal, 16)
        }
        .preferredColorScheme(.dark)
        .onReceive(ticker) { _ in store.tick() }
        .task {
            try? await Task.sleep(for: .milliseconds(300))
            store.activateExternalTimerServices()
        }
        .sheet(item: $activeSheet) { sheet in
            switch sheet {
            case .addPlayer:
                NativeAddPlayerSheet(store: store)
            case .settings:
                NativeSettingsSheet(store: store)
            case .timerAlerts:
                NativeTimerAlertSettingsSheet(store: store)
            case .reference:
                NativeReferenceSheet()
            case .info:
                NativeInfoSheet(store: store)
            }
        }
        .alert(item: $confirmation) { item in
            Alert(
                title: Text(item.title),
                message: Text(item.message),
                primaryButton: .destructive(Text(item.confirmTitle), action: item.action),
                secondaryButton: .cancel(Text("Отмена"))
            )
        }
    }

    private var header: some View {
        HStack {
            Text("Poker Points")
                .font(.headline.weight(.semibold))
                .foregroundStyle(.primary)

            Button {
                activeSheet = .reference
            } label: {
                Image(systemName: "book.closed.fill")
                    .font(.subheadline.weight(.semibold))
                    .frame(width: 30, height: 30)
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .buttonBorderShape(.circle)
            .tint(.primary)

            Spacer()

            Button {
                activeSheet = .timerAlerts
            } label: {
                Image(systemName: "bell.fill")
                    .font(.subheadline.weight(.semibold))
                    .frame(width: 30, height: 30)
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .buttonBorderShape(.circle)
            .tint(.primary)

            Button {
                confirmation = .resetTournament {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                        store.resetTournament()
                    }
                }
            } label: {
                Text("Сброс")
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 10)
                    .frame(height: 30)
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .buttonBorderShape(.capsule)
            .tint(NativeTheme.red)
        }
        .padding(.top, 10)
        .padding(.bottom, 14)
    }

    private var controls: some View {
        HStack(spacing: 10) {
            Button {
                activeSheet = .settings
            } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Параметры")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text("\(store.settings.buyInPoints) pts · \(store.settings.earlyEntryChips) chips")
                            .font(.headline.weight(.semibold))
                            .foregroundStyle(.primary)
                    }
                    Spacer()
                    Image(systemName: "slider.horizontal.3")
                }
                .frame(height: 42)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(NativeTheme.mainSurface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
            .buttonStyle(.plain)

            Button {
                activeSheet = .addPlayer
            } label: {
                Image(systemName: "person.badge.plus")
                    .font(.title3.weight(.semibold))
                    .frame(width: 54)
                    .frame(maxHeight: .infinity)
                    .background(NativeTheme.mainSurface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
            .buttonStyle(.plain)
        }
        .frame(height: 62)
        .padding(.bottom, 10)
    }

    private var timerCard: some View {
        let level = store.currentLevel

        return VStack(spacing: 14) {
                HStack(alignment: .center, spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Уровень \(store.timer.currentLevelIndex + 1)")
                            .font(.caption.weight(.black))
                            .foregroundStyle(.secondary)
                        Text(timerBlindsText(level))
                            .font(.title3.weight(.black))
                            .monospacedDigit()
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)
                    }

                    Spacer(minLength: 8)

                    Text(formatTime(store.timer.remainingSeconds))
                        .font(.system(size: 42, weight: .black, design: .rounded))
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.75)
                        .foregroundStyle(store.timer.isRunning ? .white : .yellow)
                }

                HStack(spacing: 10) {
                    timerControlButton("backward.fill") {
                        store.previousLevel()
                    }

                    Button {
                        store.toggleTimer()
                    } label: {
                        Image(systemName: store.timer.isRunning ? "pause.fill" : "play.fill")
                            .font(.headline.weight(.semibold))
                            .frame(width: 54, height: 38)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                    .buttonBorderShape(.roundedRectangle(radius: 12))
                    .tint(NativeTheme.accent)

                    timerControlButton("forward.fill") {
                        store.nextLevel()
                    }

                    Spacer(minLength: 6)

                    if let chip = level.colorUpChip {
                        Text("CU \(chip)")
                            .font(.caption.weight(.black))
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                            .padding(.horizontal, 10)
                            .frame(height: 34)
                            .background(chipColor(chip).opacity(0.22), in: Capsule())
                            .foregroundStyle(chipColor(chip))
                    }
                }
            }
        .padding(14)
        .background(NativeTheme.mainSurface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .padding(.bottom, 12)
    }

    @ViewBuilder
    private var playersList: some View {
        let placesByPlayer = store.eliminatedPlacesByPlayer

        if store.players.isEmpty {
            ContentUnavailableView {
                Label("Нет игроков", systemImage: "person.2")
            } description: {
                Text("Добавьте первого игрока, чтобы начать игру.")
            } actions: {
                Button {
                    activeSheet = .addPlayer
                } label: {
                    Label("Добавить игрока", systemImage: "person.badge.plus")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .tint(NativeTheme.accent)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            List {
                ForEach(store.players) { player in
                    NativePlayerRow(
                        store: store,
                        player: player,
                        place: placesByPlayer[player.id],
                        buyInPoints: store.settings.buyInPoints,
                        rebuyTimerEnabled: store.settings.rebuyTimerEnabled,
                        onDecrementEarlyEntry: {
                            confirmation = .decrementEarlyEntry(player.name) {
                                store.decrementEarlyEntry(player)
                            }
                        },
                        onDecrementBuyIn: {
                            confirmation = .decrementBuyIn(player.name) {
                                store.decrementBuyIn(player)
                            }
                        },
                        onDecrementPaid: {
                            confirmation = .decrementPaid(player.name) {
                                store.decrementPaid(player)
                            }
                        },
                        onToggleEliminated: {
                            if player.isEliminated {
                                confirmation = .returnPlayer(player.name) {
                                    store.toggleEliminated(player)
                                }
                            } else {
                                store.toggleEliminated(player)
                            }
                        },
                        onDelete: {
                            confirmation = .deletePlayer(player.name) {
                                store.delete(player)
                            }
                        }
                    )
                    .equatable()
                    .listRowInsets(EdgeInsets(top: 5, leading: 0, bottom: 5, trailing: 0))
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                }
            }
            .listStyle(.plain)
            .background(Color.clear)
            .scrollContentBackgroundHiddenIfAvailable()
            .frame(maxHeight: .infinity)
        }
    }

    private var footer: some View {
        Button {
            activeSheet = .info
        } label: {
            HStack(spacing: 8) {
                NativeMetric(label: "Поинты", value: store.pointsInGame, color: NativeTheme.accent)
                NativeMetric(label: "Оплачено", value: store.pointsPaid, color: NativeTheme.orange)
                NativeMetric(label: "Фишки", value: store.chipsInGame, color: NativeTheme.cyan)
            }
            .padding(8)
            .background(NativeTheme.mainSurface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .buttonStyle(.plain)
        .padding(.top, 4)
        .padding(.bottom, 2)
    }

    private func compact(_ value: Int) -> String {
        guard value >= 1000 else { return "\(value)" }
        let thousands = Double(value) / 1000
        return thousands.rounded() == thousands ? "\(Int(thousands))k" : String(format: "%.1fk", thousands)
    }

    private func timerBlindsText(_ level: NativeTimerLevel) -> String {
        let blinds = "\(compact(level.smallBlind)) / \(compact(level.bigBlind))"
        guard level.ante > 0 else { return blinds }
        return "\(blinds) / \(compact(level.ante))"
    }

    private func formatTime(_ seconds: Int) -> String {
        String(format: "%02d:%02d", max(0, seconds) / 60, max(0, seconds) % 60)
    }

    private func chipColor(_ chip: Int) -> Color {
        switch chip {
        case 50: return .blue
        case 100: return .white
        case 500: return NativeTheme.accent
        case 1000: return .yellow
        default: return NativeTheme.orange
        }
    }

    private func timerControlButton(_ systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.headline.weight(.semibold))
                .frame(width: 44, height: 38)
        }
        .buttonStyle(.bordered)
        .controlSize(.small)
        .buttonBorderShape(.roundedRectangle(radius: 12))
        .tint(.primary)
    }

}

struct NativePlayerRow: View, Equatable {
    let store: NativeTournamentStore
    let player: NativePlayer
    let place: Int?
    let buyInPoints: Int
    let rebuyTimerEnabled: Bool
    let onDecrementEarlyEntry: () -> Void
    let onDecrementBuyIn: () -> Void
    let onDecrementPaid: () -> Void
    let onToggleEliminated: () -> Void
    let onDelete: () -> Void

    static func == (lhs: NativePlayerRow, rhs: NativePlayerRow) -> Bool {
        lhs.player == rhs.player
            && lhs.place == rhs.place
            && lhs.buyInPoints == rhs.buyInPoints
            && lhs.rebuyTimerEnabled == rhs.rebuyTimerEnabled
    }

    var body: some View {
        VStack(spacing: 10) {
            HStack {
                Text(playerNameText)
                    .font(.headline.weight(.black))
                    .strikethrough(player.isEliminated)
                    .foregroundStyle(playerNameColor)
                if let medal = medalText {
                    Text(medal)
                        .font(.headline)
                }
                Text("• \(player.earlyEntries)")
                    .font(.headline.weight(.black))
                    .foregroundStyle(NativeTheme.green)
                Text("• \(player.buyIns)")
                    .font(.headline.weight(.black))
                    .foregroundStyle(NativeTheme.accent)
                Text("• \(player.paidEntries)")
                    .font(.headline.weight(.black))
                    .foregroundStyle(NativeTheme.orange)
                Spacer()
                Text(paymentStatusText)
                    .font(.caption2.weight(.black))
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background((player.paidEntries >= player.totalEntries ? NativeTheme.green : NativeTheme.orange).opacity(0.18), in: Capsule())
                    .foregroundStyle(player.paidEntries >= player.totalEntries ? NativeTheme.green : NativeTheme.orange)
            }

            HStack(spacing: 8) {
                action("door.left.hand.open", color: NativeTheme.green) {
                    playAddHaptic()
                    store.incrementEarlyEntry(player)
                }
                .disabled(player.totalEntries > 0)
                .opacity(player.totalEntries > 0 ? 0.4 : 1)

                action("plus.circle.fill", color: NativeTheme.accent) {
                    playAddHaptic()
                    store.incrementBuyIn(player)
                }
                action("creditcard.fill", color: NativeTheme.orange) {
                    playAddHaptic()
                    store.incrementPaid(player)
                }
                .disabled(player.paidEntries >= player.totalEntries)
                .opacity(player.paidEntries >= player.totalEntries ? 0.4 : 1)
            }
        }
        .padding(12)
        .background(NativeTheme.mainSurface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .swipeActions(edge: .leading, allowsFullSwipe: false) {
            Button(action: onDecrementEarlyEntry) {
                Label("Бай-ин", systemImage: "door.left.hand.closed")
            }
            .tint(NativeTheme.green)
            .disabled(player.earlyEntries <= 0)

            Button(action: onDecrementBuyIn) {
                Label("Ребай", systemImage: "minus.circle")
            }
            .tint(NativeTheme.accent)
            .disabled(player.buyIns <= 0)

            Button(action: onDecrementPaid) {
                Label("Оплата", systemImage: "creditcard.trianglebadge.exclamationmark")
            }
            .tint(NativeTheme.orange)
            .disabled(player.paidEntries <= 0)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button(action: onToggleEliminated) {
                Label(player.isEliminated ? "Вернуть" : "Выбыл", systemImage: player.isEliminated ? "arrow.uturn.left.circle" : "xmark.circle")
            }
            .tint(NativeTheme.red)
        }
        .contextMenu {
            Button(role: .destructive, action: onDelete) {
                Label("Удалить игрока", systemImage: "trash")
            }
        }
    }

    private var paymentStatusText: String {
        let debtEntries = max(0, player.totalEntries - player.paidEntries)
        guard debtEntries > 0 else { return "Оплачено" }
        return "Не оплачено \(debtEntries * buyInPoints)"
    }

    private var playerNameText: String {
        guard rebuyTimerEnabled,
              let remaining = player.rebuyTimerRemainingSeconds,
              remaining > 0 else {
            return player.name
        }
        return "\(player.name) (\(formatRebuyTime(remaining)))"
    }

    private var playerNameColor: Color {
        if player.isEliminated {
            return NativeTheme.red
        }
        if rebuyTimerEnabled,
           let remaining = player.rebuyTimerRemainingSeconds,
           remaining > 0 {
            return NativeTheme.yellow
        }
        return .white
    }

    private var medalText: String? {
        switch place {
        case 1: return "🥇"
        case 2: return "🥈"
        case 3: return "🥉"
        default: return nil
        }
    }

    private func action(_ systemName: String, color: Color, perform: @escaping () -> Void) -> some View {
        Button(action: perform) {
            Image(systemName: systemName)
                .font(.headline.weight(.semibold))
                .frame(maxWidth: .infinity)
                .frame(height: 28)
        }
        .buttonStyle(.bordered)
        .controlSize(.small)
        .buttonBorderShape(.roundedRectangle(radius: 12))
        .tint(color)
    }

    private func playAddHaptic() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    private func formatRebuyTime(_ seconds: Int) -> String {
        String(format: "%02d:%02d", max(0, seconds) / 60, max(0, seconds) % 60)
    }
}

struct NativeMetric: View {
    let label: String
    let value: Int
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(label)
                .font(.system(size: 9, weight: .black))
                .textCase(.uppercase)
                .foregroundStyle(color.opacity(0.72))
            Text("\(value)")
                .font(.subheadline.weight(.black))
                .monospacedDigit()
                .foregroundStyle(color)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
    }
}

struct NativeAddPlayerSheet: View {
    let store: NativeTournamentStore
    @State private var history: [String]
    @State private var playerNames: Set<String>
    @State private var newPlayerName = ""
    @State private var showAddPlayerPrompt = false

    init(store: NativeTournamentStore) {
        self.store = store
        _history = State(initialValue: store.playerNameHistory)
        _playerNames = State(initialValue: Set(store.players.map { $0.name.lowercased() }))
    }

    var body: some View {
        NavigationStack {
            Group {
                if history.isEmpty {
                    ContentUnavailableView(
                        "История пуста",
                        systemImage: "person.crop.circle.badge.plus",
                        description: Text("Введите имя первого игрока")
                    )
                } else {
                    List {
                        ForEach(historySectionTitles, id: \.self) { title in
                            Section(title) {
                                ForEach(historyNames(in: title), id: \.self) { historyName in
                                    historyRow(historyName)
                                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                            Button(role: .destructive) {
                                                deleteHistoryName(historyName)
                                            } label: {
                                                Image(systemName: "trash")
                                            }
                                            .tint(.red)
                                        }
                                }
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Добавить игрока")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        newPlayerName = ""
                        showAddPlayerPrompt = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .tint(NativeTheme.accent)
                    .accessibilityLabel("Добавить нового игрока")
                }
            }
        }
        .alert("Новый игрок", isPresented: $showAddPlayerPrompt) {
            TextField("Имя игрока", text: $newPlayerName)
                .textInputAutocapitalization(.words)
                .autocorrectionDisabled()
                .onSubmit(submitNewPlayer)

            Button("Добавить", action: submitNewPlayer)
                .disabled(newPlayerName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            Button("Отмена", role: .cancel) {
                newPlayerName = ""
            }
        } message: {
            Text("Введите имя игрока, которого нужно добавить в игру.")
        }
        .presentationDetents([.fraction(0.67)])
        .presentationDragIndicator(.visible)
        .presentationContentInteraction(.scrolls)
    }

    private var sortedHistory: [String] {
        history.sorted { $0.localizedCaseInsensitiveCompare($1) == .orderedAscending }
    }

    private var historySectionTitles: [String] {
        Array(Set(sortedHistory.map { historySectionTitle(for: $0) }))
            .sorted { lhs, rhs in
                if lhs == "#" { return false }
                if rhs == "#" { return true }
                return lhs.localizedCaseInsensitiveCompare(rhs) == .orderedAscending
            }
    }

    private func historyNames(in section: String) -> [String] {
        sortedHistory.filter { historySectionTitle(for: $0) == section }
    }

    private func historySectionTitle(for name: String) -> String {
        guard let character = name.trimmingCharacters(in: .whitespacesAndNewlines).first,
              let scalar = character.unicodeScalars.first,
              CharacterSet.letters.contains(scalar) else {
            return "#"
        }
        return String(character).uppercased(with: .current)
    }

    private func historyRow(_ historyName: String) -> some View {
        let isAdded = playerNames.contains(historyName.lowercased())

        return Button {
            if !isAdded {
                _ = addPlayer(historyName)
            }
        } label: {
            HStack(spacing: 12) {
                Text(historyName)
                    .lineLimit(1)
                    .font(.body)
                    .foregroundStyle(.primary)

                Spacer(minLength: 8)

                if isAdded {
                    Text("В игре")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(NativeTheme.accent)
                }
            }
            .frame(maxWidth: .infinity)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func deleteHistoryName(_ historyName: String) {
        store.deleteHistoryName(historyName)
        history.removeAll { $0.caseInsensitiveCompare(historyName) == .orderedSame }
    }

    @discardableResult
    private func addPlayer(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return false }
        store.addPlayer(name: trimmed)
        playerNames.insert(trimmed.lowercased())
        history = store.playerNameHistory
        return true
    }

    private func submitNewPlayer() {
        guard addPlayer(newPlayerName) else { return }
        newPlayerName = ""
        showAddPlayerPrompt = false
    }
}

struct NativeSettingsSheet: View {
    @ObservedObject var store: NativeTournamentStore
    @State private var settings: NativeSettings
    @State private var showDistributionInfo = false
    @State private var showTimerSettings = false
    @State private var showRebuyTimerSettings = false
    @State private var showTimerResetConfirmation = false
    @State private var activeNumberPicker: NativeSettingsPickerField?
    @State private var prizeMode: NativePrizeMode

    init(store: NativeTournamentStore) {
        self.store = store
        let settings = store.settings
        _settings = State(initialValue: settings)
        _prizeMode = State(initialValue: NativePrizeMode(settings: settings))
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Игра") {
                    pickerRow(.buyInPoints, value: settings.buyInPoints)
                    pickerRow(.earlyEntryChips, value: settings.earlyEntryChips)
                    pickerRow(.buyInChips, value: settings.buyInChips)
                    pickerRow(.prizeAdjustment, value: settings.prizeAdjustmentPoints)

                }

                Section("Таймер") {
                    Button {
                        showRebuyTimerSettings = true
                    } label: {
                        settingsLinkRow(
                            title: "Таймер ребаев",
                            systemImage: "repeat.circle.fill",
                            detail: store.settings.rebuyTimerEnabled ? "Включен" : "Выключен"
                        )
                    }
                    .buttonStyle(.plain)

                    Button {
                        showTimerSettings = true
                    } label: {
                        settingsLinkRow(
                            title: "Настройки таймера",
                            systemImage: "timer",
                            detail: "\(store.settings.timerLevels.count) уровней"
                        )
                    }
                    .buttonStyle(.plain)

                    Button(role: .destructive) {
                        showTimerResetConfirmation = true
                    } label: {
                        Label("Сбросить таймер", systemImage: "arrow.counterclockwise")
                            .foregroundStyle(NativeTheme.red)
                    }
                }

                Section("Призы") {
                    Picker("Количество призовых мест", selection: $prizeMode) {
                        ForEach(NativePrizeMode.allCases, id: \.self) { mode in
                            Text(mode.title)
                                .tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)
                    .onChange(of: prizeMode) { _, mode in
                        applyPrizeMode(mode)
                    }

                    if prizeMode == .custom {
                        pickerRow(.prizePlaces, value: settings.prizePlaces)
                    }

                    pickerRow(.prizeRoundingStep, value: settings.prizeRoundingStep)

                    if isPrizeDistributionValid {
                        Button {
                            showDistributionInfo = true
                        } label: {
                            Label("Расчет по шагам", systemImage: "info.circle")
                                .foregroundStyle(NativeTheme.accent)
                        }
                    }
                }

                Section("Распределение призовых") {
                    if prizeMode == .custom {
                        prizeDistributionEditor
                    } else {
                        LabeledContent("Распределение") {
                            Text(normalizedDistribution.map(String.init).joined(separator: "/") + "%")
                                .monospacedDigit()
                                .foregroundStyle(.secondary)
                        }
                    }

                    if !prizeValidationMessages.isEmpty {
                        ForEach(prizeValidationMessages, id: \.self) { message in
                            Text(message)
                                .font(.footnote)
                                .foregroundStyle(.red)
                        }
                    }
                }
            }
            .navigationTitle("Параметры")
            .navigationBarTitleDisplayMode(.inline)
            .onChange(of: settings) { _, nextSettings in
                store.updateGameSettings(nextSettings)
            }
        }
        .sheet(isPresented: $showDistributionInfo) {
            NativePrizeDistributionInfoSheet(settings: settings)
        }
        .sheet(item: $activeNumberPicker) { field in
            NativeNumberPickerSheet(
                title: field.title,
                value: pickerBinding(for: field),
                minimum: field.minimum,
                maximum: field.maximum,
                step: field.step
            )
        }
        .sheet(isPresented: $showRebuyTimerSettings) {
            NativeRebuyTimerSettingsSheet(store: store)
        }
        .sheet(isPresented: $showTimerSettings) {
            NativeTimerSettingsSheet(store: store)
        }
        .alert("Сбросить таймер?", isPresented: $showTimerResetConfirmation) {
            Button("Сбросить", role: .destructive) {
                store.resetTimer()
            }
            Button("Отмена", role: .cancel) {}
        } message: {
            Text("Таймер остановится, вернется на первый уровень и выставит полное время первого уровня.")
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }

    private var prizeDistributionEditor: some View {
        ForEach(0..<settings.prizePlaces, id: \.self) { index in
            pickerRow(.prizePercent(index), value: prizePercent(at: index))
        }
    }

    private var prizePlacesBinding: Binding<Int> {
        Binding {
            settings.prizePlaces
        } set: { value in
            settings.prizePlaces = max(1, min(20, value))
            resizePrizeDistribution()
            prizeMode = .custom
        }
    }

    private var distributionTotal: Int {
        normalizedDistribution.reduce(0, +)
    }

    private var normalizedDistribution: [Int] {
        Array(settings.prizeDistribution.prefix(settings.prizePlaces))
    }

    private var isPrizeDistributionValid: Bool {
        prizeValidationMessages.isEmpty
    }

    private var prizeValidationMessages: [String] {
        var messages: [String] = []
        let distribution = normalizedDistribution

        if distributionTotal != 100 {
            messages.append("Сумма распределения должна быть 100%, сейчас \(distributionTotal)%.")
        }

        for index in 1..<distribution.count where distribution[index] > distribution[index - 1] {
            messages.append("\(index + 1) место не может быть больше \(index) места.")
            break
        }

        return messages
    }

    private func prizePercent(at index: Int) -> Int {
        guard index < settings.prizeDistribution.count else { return 0 }
        return settings.prizeDistribution[index]
    }

    private func prizePercentBinding(at index: Int) -> Binding<Int> {
        Binding {
            prizePercent(at: index)
        } set: { value in
            while settings.prizeDistribution.count <= index {
                settings.prizeDistribution.append(0)
            }
            settings.prizeDistribution[index] = value
        }
    }

    private func pickerRow(_ field: NativeSettingsPickerField, value: Int) -> some View {
        Button {
            activeNumberPicker = field
        } label: {
            HStack(spacing: 8) {
                Text(field.title)
                    .foregroundStyle(.primary)
                Spacer(minLength: 8)
                Text(value.formatted())
                    .monospacedDigit()
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func settingsLinkRow(title: String, systemImage: String, detail: String) -> some View {
        HStack(spacing: 10) {
            Label(title, systemImage: systemImage)
                .foregroundStyle(.primary)
            Spacer(minLength: 8)
            Text(detail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .contentShape(Rectangle())
    }

    private func pickerBinding(for field: NativeSettingsPickerField) -> Binding<Int> {
        switch field {
        case .buyInPoints:
            return $settings.buyInPoints
        case .earlyEntryChips:
            return $settings.earlyEntryChips
        case .buyInChips:
            return $settings.buyInChips
        case .prizeAdjustment:
            return $settings.prizeAdjustmentPoints
        case .prizeRoundingStep:
            return $settings.prizeRoundingStep
        case .prizePlaces:
            return prizePlacesBinding
        case .prizePercent(let index):
            return prizePercentBinding(at: index)
        }
    }

    private func applyPrizeMode(_ mode: NativePrizeMode) {
        if let distribution = mode.distribution {
            settings.prizePlaces = distribution.count
            settings.prizeDistribution = distribution
        } else {
            resizePrizeDistribution()
        }
    }

    private func resizePrizeDistribution() {
        settings.prizeDistribution = Array(settings.prizeDistribution.prefix(settings.prizePlaces))
        while settings.prizeDistribution.count < settings.prizePlaces {
            settings.prizeDistribution.append(0)
        }
    }

}

enum NativeSettingsPickerField: Identifiable {
    case buyInPoints
    case earlyEntryChips
    case buyInChips
    case prizeAdjustment
    case prizeRoundingStep
    case prizePlaces
    case prizePercent(Int)

    var id: String {
        switch self {
        case .buyInPoints: return "buy-in-points"
        case .earlyEntryChips: return "early-entry-chips"
        case .buyInChips: return "buy-in-chips"
        case .prizeAdjustment: return "prize-adjustment"
        case .prizeRoundingStep: return "prize-rounding-step"
        case .prizePlaces: return "prize-places"
        case .prizePercent(let index): return "prize-percent-\(index)"
        }
    }

    var title: String {
        switch self {
        case .buyInPoints: return "Цена"
        case .earlyEntryChips: return "Фишек за бай-ин"
        case .buyInChips: return "Фишек за ребай"
        case .prizeAdjustment: return "Корректировка фонда"
        case .prizeRoundingStep: return "Шаг округления призовых"
        case .prizePlaces: return "Количество призовых мест"
        case .prizePercent(let index): return "\(index + 1) место, %"
        }
    }

    var minimum: Int? {
        switch self {
        case .buyInPoints: return 100
        case .earlyEntryChips: return 5_000
        case .buyInChips: return 5_000
        case .prizeAdjustment: return nil
        case .prizeRoundingStep: return 100
        case .prizePlaces: return 1
        case .prizePercent: return 0
        }
    }

    var maximum: Int? {
        switch self {
        case .prizePlaces: return 20
        case .prizePercent: return 100
        default: return nil
        }
    }

    var step: Int {
        switch self {
        case .buyInPoints, .prizeAdjustment, .prizeRoundingStep: return 100
        case .earlyEntryChips, .buyInChips: return 5_000
        case .prizePlaces: return 1
        case .prizePercent: return 5
        }
    }
}

struct NativeNumberPickerSheet: View {
    let title: String
    @Binding var value: Int
    let minimum: Int?
    let maximum: Int?
    let step: Int

    var body: some View {
        NavigationStack {
            NativeInfiniteStepPicker(value: $value, minimum: minimum, maximum: maximum, step: step)
                .frame(height: 240)
                .padding(.horizontal, 20)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.height(340)])
        .presentationDragIndicator(.visible)
        .presentationContentInteraction(.scrolls)
    }
}

struct NativeInfiniteStepPicker: UIViewRepresentable {
    @Binding var value: Int
    let minimum: Int?
    let maximum: Int?
    let step: Int

    private let unboundedRowCount = 100_001

    func makeUIView(context: Context) -> UIPickerView {
        let picker = UIPickerView()
        picker.dataSource = context.coordinator
        picker.delegate = context.coordinator
        picker.backgroundColor = .clear
        picker.selectRow(row(for: value), inComponent: 0, animated: false)
        return picker
    }

    func updateUIView(_ picker: UIPickerView, context: Context) {
        context.coordinator.parent = self
        let targetRow = row(for: value)
        if picker.selectedRow(inComponent: 0) != targetRow {
            picker.selectRow(targetRow, inComponent: 0, animated: false)
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    private func row(for value: Int) -> Int {
        if let minimum {
            let rawRow = Int((Double(value - minimum) / Double(step)).rounded())
            return min(rowCount - 1, max(0, rawRow))
        }

        let offset = Int((Double(value) / Double(step)).rounded())
        return min(rowCount - 1, max(0, rowCount / 2 + offset))
    }

    private var rowCount: Int {
        guard let minimum, let maximum else { return unboundedRowCount }
        return max(1, (maximum - minimum) / step + 1)
    }

    private func value(for row: Int) -> Int {
        if let minimum {
            return minimum + row * step
        }
        return (row - rowCount / 2) * step
    }

    final class Coordinator: NSObject, UIPickerViewDataSource, UIPickerViewDelegate {
        var parent: NativeInfiniteStepPicker

        init(parent: NativeInfiniteStepPicker) {
            self.parent = parent
        }

        func numberOfComponents(in pickerView: UIPickerView) -> Int {
            1
        }

        func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
            parent.rowCount
        }

        func pickerView(
            _ pickerView: UIPickerView,
            viewForRow row: Int,
            forComponent component: Int,
            reusing view: UIView?
        ) -> UIView {
            let label = (view as? UILabel) ?? UILabel()
            label.text = String(parent.value(for: row))
            label.textAlignment = .center
            label.textColor = .label
            label.font = .monospacedDigitSystemFont(ofSize: 22, weight: .semibold)
            return label
        }

        func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
            parent.value = parent.value(for: row)
        }
    }
}

enum NativePrizeMode: Hashable, CaseIterable {
    case onePlace
    case twoPlaces
    case threePlaces
    case custom

    init(settings: NativeSettings) {
        let distribution = Array(settings.prizeDistribution.prefix(settings.prizePlaces))
        switch distribution {
        case [100]:
            self = .onePlace
        case [70, 30]:
            self = .twoPlaces
        case [60, 30, 10]:
            self = .threePlaces
        default:
            self = .custom
        }
    }

    var title: String {
        switch self {
        case .onePlace: return "1 место"
        case .twoPlaces: return "2 места"
        case .threePlaces: return "3 места"
        case .custom: return "Кастом"
        }
    }

    var subtitle: String {
        switch self {
        case .onePlace: return "100"
        case .twoPlaces: return "70/30"
        case .threePlaces: return "60/30/10"
        case .custom: return "%"
        }
    }

    var distribution: [Int]? {
        switch self {
        case .onePlace: return [100]
        case .twoPlaces: return [70, 30]
        case .threePlaces: return [60, 30, 10]
        case .custom: return nil
        }
    }
}

struct NativeNumberField: View {
    let title: String
    @Binding var value: Int
    let placeholder: String
    let minimum: Int?
    @State private var text: String = ""

    var body: some View {
        HStack(spacing: 12) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
            Spacer(minLength: 12)
            NativeEndCursorTextField(
                text: $text,
                placeholder: placeholder,
                keyboardType: minimum == nil ? .numbersAndPunctuation : .numberPad
            )
                .frame(minWidth: 92, maxWidth: 132)
                .frame(height: 38)
                .padding(.horizontal, 12)
                .background(NativeTheme.surfaceStrong, in: RoundedRectangle(cornerRadius: 12))
                .onAppear {
                    text = "\(value)"
                }
                .onChange(of: text) { _, nextText in
                    applyText(nextText)
                }
                .onChange(of: value) { _, nextValue in
                    if text != "\(nextValue)" {
                        text = "\(nextValue)"
                    }
                }
        }
    }

    private func applyText(_ nextText: String) {
        let allowed = minimum == nil ? "-0123456789" : "0123456789"
        let filtered = String(nextText.filter { allowed.contains($0) })

        if filtered != nextText {
            text = filtered
            return
        }

        if minimum == nil, filtered == "-" {
            return
        }

        guard let nextValue = Int(filtered) else {
            return
        }

        value = nextValue
    }
}

struct NativeEndCursorTextField: UIViewRepresentable {
    @Binding var text: String
    let placeholder: String
    let keyboardType: UIKeyboardType

    func makeUIView(context: Context) -> UITextField {
        let textField = NativeEndCursorUITextField()
        textField.delegate = context.coordinator
        if textField.keyboardType != keyboardType {
            textField.keyboardType = keyboardType
        }
        textField.textAlignment = .right
        textField.textColor = .white
        textField.tintColor = UIColor(NativeTheme.accent)
        textField.font = .monospacedDigitSystemFont(ofSize: 17, weight: .bold)
        textField.attributedPlaceholder = NSAttributedString(
            string: placeholder,
            attributes: [.foregroundColor: UIColor.secondaryLabel]
        )
        textField.addTarget(context.coordinator, action: #selector(Coordinator.editingChanged(_:)), for: .editingChanged)
        return textField
    }

    func updateUIView(_ textField: UITextField, context: Context) {
        context.coordinator.parent = self
        if textField.text != text {
            textField.text = text
        }
        if textField.keyboardType != keyboardType {
            textField.keyboardType = keyboardType
        }
        if textField.isFirstResponder {
            context.coordinator.moveCursorToEnd(textField)
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    final class Coordinator: NSObject, UITextFieldDelegate {
        var parent: NativeEndCursorTextField

        init(parent: NativeEndCursorTextField) {
            self.parent = parent
        }

        @objc func editingChanged(_ textField: UITextField) {
            parent.text = textField.text ?? ""
            moveCursorToEnd(textField)
        }

        func textFieldDidBeginEditing(_ textField: UITextField) {
            moveCursorToEnd(textField)
        }

        func moveCursorToEnd(_ textField: UITextField) {
            guard textField.isFirstResponder else { return }
            let end = textField.endOfDocument
            if textField.selectedTextRange != textField.textRange(from: end, to: end) {
                textField.selectedTextRange = textField.textRange(from: end, to: end)
            }
        }
    }
}

final class NativeEndCursorUITextField: UITextField {
    override func closestPosition(to point: CGPoint) -> UITextPosition? {
        endOfDocument
    }
}

struct NativePrizeDistributionInfoSheet: View {
    let settings: NativeSettings

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(rows, id: \.fund) { row in
                        NativePrizeDistributionInfoRowView(row: row)
                    }
                } header: {
                    HStack(spacing: 12) {
                        Text("Фонд")
                            .frame(width: 72, alignment: .leading)
                        Text("Выплаты")
                    }
                } footer: {
                    Text("Расчет для 20 последовательных шагов округления призовых.")
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Распределение")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.fraction(0.5)])
        .presentationDragIndicator(.visible)
        .presentationContentInteraction(.scrolls)
    }

    private var rows: [NativePrizeDistributionInfoRow] {
        let step = max(1, settings.prizeRoundingStep)
        return (1...20).map { index in
            let fund = step * index
            return NativePrizeDistributionInfoRow(fund: fund, payouts: payouts(for: fund))
        }
    }

    private func payouts(for fund: Int) -> [NativePrizeDistributionInfoPayout] {
        let distribution = Array(settings.prizeDistribution.prefix(settings.prizePlaces))
        let shares = distribution.map { Double(max(0, $0)) / 100 }
        let rawAmounts = shares.map { Double(fund) * $0 }
        let step = max(1, settings.prizeRoundingStep)
        var amounts = rawAmounts.map { Int(floor($0 / Double(step))) * step }
        var remaining = fund - amounts.reduce(0, +)
        let order = rawAmounts.indices.sorted {
            (rawAmounts[$0] - Double(amounts[$0])) > (rawAmounts[$1] - Double(amounts[$1]))
        }

        while remaining >= step && !order.isEmpty {
            for index in order where remaining >= step {
                amounts[index] += step
                remaining -= step
            }
        }

        return amounts.enumerated().map { index, amount in
            NativePrizeDistributionInfoPayout(
                place: index + 1,
                amount: amount,
                percent: fund > 0 ? Double(amount) / Double(fund) * 100 : 0
            )
        }
    }

}

struct NativePrizeDistributionInfoRowView: View {
    let row: NativePrizeDistributionInfoRow

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(row.fund.formatted())
                .font(.subheadline.weight(.semibold))
                .monospacedDigit()
                .foregroundStyle(NativeTheme.green)
                .frame(width: 72, alignment: .leading)

            VStack(spacing: 5) {
                ForEach(row.payouts, id: \.place) { payout in
                    HStack(spacing: 8) {
                        Text("\(payout.place) место")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)

                        Spacer(minLength: 8)

                        Text(payout.amount.formatted())
                            .font(.subheadline)
                            .monospacedDigit()
                            .foregroundStyle(.white)

                        Text("\(formatDecimal(payout.percent))%")
                            .font(.caption)
                            .monospacedDigit()
                            .foregroundStyle(NativeTheme.accent)
                            .frame(width: 44, alignment: .trailing)
                    }
                }
            }
        }
    }

    private func formatDecimal(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 1
        return formatter.string(from: NSNumber(value: value)) ?? "0"
    }
}

struct NativePrizeDistributionInfoRow {
    let fund: Int
    let payouts: [NativePrizeDistributionInfoPayout]
}

struct NativePrizeDistributionInfoPayout {
    let place: Int
    let amount: Int
    let percent: Double
}

struct NativeInfoSheet: View {
    @ObservedObject var store: NativeTournamentStore
    @State private var measuredContentHeight: CGFloat = 450

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    HStack(spacing: 8) {
                        infoCard("Поинты в игре", store.pointsInGame, NativeTheme.accent)
                        infoCard("Оплачено", store.pointsPaid, NativeTheme.orange)
                        infoCard("Призовые", store.prizePoints, NativeTheme.green)
                    }

                    HStack(spacing: 8) {
                        infoCard("Фишки", store.chipsInGame, NativeTheme.cyan, details: "\(formatDecimal(store.totalChipsInBigBlinds)) BB")
                        infoCard("Средний стек", store.averageStack, NativeTheme.blue, details: "\(formatDecimal(store.averageStackInBigBlinds)) BB")
                    }

                    VStack(alignment: .leading, spacing: 0) {
                        Text("Призовые места")
                            .font(.headline)
                            .padding(.bottom, 8)

                        ForEach(Array(store.prizePayouts().enumerated()), id: \.element.id) { index, payout in
                            if index > 0 {
                                Divider()
                            }
                            prizePayoutRow(payout)
                        }

                        Divider()

                        HStack {
                            Text("Осталось за финальным столом")
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text(store.finalTableRemainder().formatted())
                                .font(.body.weight(.semibold))
                                .foregroundStyle(NativeTheme.green)
                        }
                        .padding(.top, 12)
                    }
                    .padding(16)
                    .background(
                        Color(uiColor: .secondarySystemGroupedBackground),
                        in: RoundedRectangle(cornerRadius: 16, style: .continuous)
                    )
                }
                .padding(16)
                .onGeometryChange(for: CGFloat.self) { proxy in
                    proxy.size.height
                } action: { height in
                    if abs(measuredContentHeight - height) > 1 {
                        measuredContentHeight = height
                    }
                }
            }
            .scrollBounceBehavior(.basedOnSize)
            .navigationTitle("Информация об игре")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([preferredDetent])
        .presentationDragIndicator(.visible)
    }

    private var preferredDetent: PresentationDetent {
        let desiredHeight = max(320, measuredContentHeight + 72)
        let maximumCompactHeight = max(420, screenHeight - 110)
        return desiredHeight < maximumCompactHeight ? .height(desiredHeight) : .large
    }

    private var screenHeight: CGFloat {
        let scene = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first { $0.activationState == .foregroundActive }
        return scene?.screen.bounds.height ?? 844
    }

    private func prizePayoutRow(_ payout: NativePrizePayout) -> some View {
        HStack(spacing: 10) {
            Text("\(payout.place)")
                .font(.headline.weight(.semibold))
                .monospacedDigit()
                .frame(width: 34, height: 34)
                .background(placeColor(payout.place).opacity(0.2), in: Circle())
                .foregroundStyle(placeColor(payout.place))

            VStack(alignment: .leading, spacing: 2) {
                Text("\(payout.place) место")
                    .font(.subheadline.weight(.semibold))
                Text(payout.playerName ?? "Не определено")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 8)

            VStack(alignment: .trailing, spacing: 2) {
                Text(payout.amount.formatted())
                    .font(.headline.weight(.semibold))
                    .monospacedDigit()
                    .foregroundStyle(NativeTheme.green)
                Text("\(formatDecimal(realPrizePercent(for: payout)))%")
                    .font(.caption)
                    .monospacedDigit()
                    .foregroundStyle(NativeTheme.accent)
            }
        }
        .padding(.vertical, 9)
    }

    private func infoCard(_ title: String, _ value: Int, _ color: Color, details: String? = nil) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            Text(value.formatted())
                .font(.headline.weight(.semibold))
                .monospacedDigit()
                .foregroundStyle(color)
            if let details {
                Text(details)
                    .font(.caption)
                    .foregroundStyle(color.opacity(0.72))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(
            Color(uiColor: .secondarySystemGroupedBackground),
            in: RoundedRectangle(cornerRadius: 16, style: .continuous)
        )
    }

    private func realPrizePercent(for payout: NativePrizePayout) -> Double {
        guard store.prizePoints > 0 else { return 0 }
        return Double(payout.amount) / Double(store.prizePoints) * 100
    }

    private func placeColor(_ place: Int) -> Color {
        switch place {
        case 1: return .yellow
        case 2: return Color(red: 0.82, green: 0.84, blue: 0.9)
        case 3: return Color(red: 0.78, green: 0.48, blue: 0.26)
        default: return NativeTheme.accent
        }
    }

    private func formatDecimal(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 1
        return formatter.string(from: NSNumber(value: value)) ?? "0"
    }
}

enum NativeTimerBulkAction {
    case duration
    case bigBlindAnte
    case resetAnte
}

struct NativeTimerSettingsSheet: View {
    let store: NativeTournamentStore
    @Environment(\.dismiss) private var dismiss
    @State private var levels: [NativeTimerLevel]
    @State private var originalLevels: [NativeTimerLevel]
    @State private var bulkDurationMinutes: Int
    @State private var showResetConfirmation = false
    @State private var activeNumberPicker: NativeTimerPickerTarget?
    @State private var bulkActionFeedback: NativeTimerBulkAction?

    init(store: NativeTournamentStore) {
        self.store = store
        let currentLevels = store.settings.timerLevels
        _levels = State(initialValue: currentLevels)
        _originalLevels = State(initialValue: currentLevels)
        _bulkDurationMinutes = State(initialValue: max(1, (currentLevels.first?.durationSeconds ?? 900) / 60))
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Для всех уровней") {
                    pickerButton(
                        title: "Длительность",
                        value: "\(bulkDurationMinutes) мин",
                        target: .bulkDuration
                    )

                    Button {
                        bulkDurationMinutes = max(1, bulkDurationMinutes)
                        for index in levels.indices {
                            levels[index].durationSeconds = bulkDurationMinutes * 60
                        }
                        bulkActionFeedback = .duration
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    } label: {
                        Label("Применить длительность", systemImage: "checkmark.circle.fill")
                            .foregroundStyle(NativeTheme.accent)
                    }

                    if bulkActionFeedback == .duration {
                        actionFeedback("Длительность применена к \(levels.count) уровням", color: NativeTheme.accent)
                    }
                }

                Section("Анте для всех уровней") {
                    Button {
                        for index in levels.indices {
                            levels[index].ante = levels[index].bigBlind
                        }
                        bulkActionFeedback = .bigBlindAnte
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    } label: {
                        Label("Установить ББ анте", systemImage: "equal.circle.fill")
                            .foregroundStyle(NativeTheme.accent)
                    }

                    Button(role: .destructive) {
                        for index in levels.indices {
                            levels[index].ante = 0
                        }
                        bulkActionFeedback = .resetAnte
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    } label: {
                        Label("Сбросить анте", systemImage: "xmark.circle.fill")
                            .foregroundStyle(NativeTheme.red)
                    }

                    if bulkActionFeedback == .bigBlindAnte {
                        actionFeedback("ББ анте установлено для всех уровней", color: NativeTheme.accent)
                    } else if bulkActionFeedback == .resetAnte {
                        actionFeedback("Анте сброшено для всех уровней", color: NativeTheme.red)
                    }
                }

                Section("Уровни") {
                    ForEach(levels.indices, id: \.self) { index in
                        NativeTimerLevelEditor(
                            index: index,
                            level: levelBinding(at: index),
                            onSelect: { field in
                                activeNumberPicker = .level(index: index, field: field)
                            },
                            onDelete: levels.count > 1 ? { levels.remove(at: index) } : nil
                        )
                    }

                    Button {
                        levels.append(nextLevel())
                    } label: {
                        Label("Добавить уровень", systemImage: "plus")
                            .foregroundStyle(NativeTheme.accent)
                    }
                }
            }
            .navigationTitle("Таймер")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(role: .destructive) {
                        showResetConfirmation = true
                    } label: {
                        Label("Сбросить", systemImage: "arrow.counterclockwise")
                    }
                    .tint(NativeTheme.red)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") {
                        var next = store.settings
                        next.timerLevels = levels.map(normalizedLevel)
                        store.updateSettings(next)
                        dismiss()
                    }
                    .disabled(!hasChanges)
                    .tint(NativeTheme.accent)
                }
            }
        }
        .sheet(item: $activeNumberPicker) { target in
            NativeNumberPickerSheet(
                title: target.title,
                value: pickerBinding(for: target),
                minimum: target.minimum,
                maximum: nil,
                step: target.step
            )
        }
        .alert(isPresented: $showResetConfirmation) {
            Alert(
                title: Text("Сбросить настройки таймера?"),
                message: Text("Все уровни, длительности, анте и color up будут возвращены к стандартным значениям."),
                primaryButton: .destructive(Text("Сбросить")) {
                    levels = NativeSettings.defaultTimerLevels
                    bulkDurationMinutes = 15
                    bulkActionFeedback = nil
                },
                secondaryButton: .cancel(Text("Отмена"))
            )
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }

    private var hasChanges: Bool {
        levels != originalLevels
    }

    private func actionFeedback(_ text: String, color: Color) -> some View {
        Label(text, systemImage: "checkmark")
            .font(.caption)
            .foregroundStyle(color)
    }

    private func pickerButton(title: String, value: String, target: NativeTimerPickerTarget) -> some View {
        Button {
            activeNumberPicker = target
        } label: {
            HStack(spacing: 8) {
                Text(title)
                    .foregroundStyle(.primary)
                Spacer(minLength: 8)
                Text(value)
                    .monospacedDigit()
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func pickerBinding(for target: NativeTimerPickerTarget) -> Binding<Int> {
        switch target {
        case .bulkDuration:
            return $bulkDurationMinutes
        case .level(let index, let field):
            return Binding {
                guard levels.indices.contains(index) else { return field.minimum }
                switch field {
                case .smallBlind: return levels[index].smallBlind
                case .bigBlind: return levels[index].bigBlind
                case .ante: return levels[index].ante
                case .duration: return max(1, levels[index].durationSeconds / 60)
                }
            } set: { value in
                guard levels.indices.contains(index) else { return }
                switch field {
                case .smallBlind: levels[index].smallBlind = max(50, value)
                case .bigBlind: levels[index].bigBlind = max(50, value)
                case .ante: levels[index].ante = max(0, value)
                case .duration: levels[index].durationSeconds = max(1, value) * 60
                }
            }
        }
    }

    private func levelBinding(at index: Int) -> Binding<NativeTimerLevel> {
        Binding {
            levels[index]
        } set: { value in
            levels[index] = value
        }
    }

    private func nextLevel() -> NativeTimerLevel {
        guard let last = levels.last else {
            return NativeTimerLevel(smallBlind: 100, bigBlind: 200, ante: 200, durationSeconds: bulkDurationMinutes * 60, colorUpChip: nil)
        }

        let proposedSmallBlind = last.smallBlind + max(50, last.smallBlind / 4)
        let smallBlind = max(50, ((proposedSmallBlind + 49) / 50) * 50)
        let bigBlind = max(50, ((smallBlind * 2 + 49) / 50) * 50)
        return NativeTimerLevel(
            smallBlind: smallBlind,
            bigBlind: bigBlind,
            ante: bigBlind,
            durationSeconds: last.durationSeconds,
            colorUpChip: nil
        )
    }

    private func normalizedLevel(_ level: NativeTimerLevel) -> NativeTimerLevel {
        NativeTimerLevel(
            smallBlind: max(1, level.smallBlind),
            bigBlind: max(1, level.bigBlind),
            ante: max(0, level.ante),
            durationSeconds: max(60, level.durationSeconds),
            colorUpChip: level.colorUpChip
        )
    }
}

enum NativeTimerLevelField: String {
    case smallBlind
    case bigBlind
    case ante
    case duration

    var title: String {
        switch self {
        case .smallBlind: return "SB"
        case .bigBlind: return "BB"
        case .ante: return "Ante"
        case .duration: return "Длительность"
        }
    }

    var minimum: Int {
        switch self {
        case .smallBlind, .bigBlind: return 50
        case .ante: return 0
        case .duration: return 1
        }
    }

    var step: Int {
        self == .duration ? 1 : 50
    }
}

enum NativeTimerPickerTarget: Identifiable {
    case bulkDuration
    case level(index: Int, field: NativeTimerLevelField)

    var id: String {
        switch self {
        case .bulkDuration: return "bulk-duration"
        case .level(let index, let field): return "level-\(index)-\(field.rawValue)"
        }
    }

    var title: String {
        switch self {
        case .bulkDuration: return "Длительность уровней"
        case .level(let index, let field): return "Уровень \(index + 1) · \(field.title)"
        }
    }

    var minimum: Int {
        switch self {
        case .bulkDuration: return 1
        case .level(_, let field): return field.minimum
        }
    }

    var step: Int {
        switch self {
        case .bulkDuration: return 1
        case .level(_, let field): return field.step
        }
    }
}

struct NativeTimerLevelEditor: View {
    let index: Int
    @Binding var level: NativeTimerLevel
    let onSelect: (NativeTimerLevelField) -> Void
    let onDelete: (() -> Void)?
    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 10) {
                Button {
                    withAnimation(.snappy(duration: 0.22)) {
                        isExpanded.toggle()
                    }
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.tertiary)
                            .rotationEffect(.degrees(isExpanded ? 90 : 0))

                        VStack(alignment: .leading, spacing: 3) {
                            Text("Уровень \(index + 1)")
                                .font(.body.weight(.semibold))
                                .foregroundStyle(.primary)
                            Text(levelSummary)
                                .font(.caption)
                                .monospacedDigit()
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                        }

                        Spacer(minLength: 4)
                    }
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)

                Menu {
                    colorUpOption(nil, title: "Без Color Up")
                    colorUpOption(50, title: "CU 50")
                    colorUpOption(100, title: "CU 100")
                    colorUpOption(500, title: "CU 500")
                    colorUpOption(1000, title: "CU 1000")
                } label: {
                    Text(colorUpTitle)
                        .font(.caption.weight(.black))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(colorUpColor.opacity(0.18), in: Capsule())
                        .foregroundStyle(colorUpColor)
                }
            }
            .padding(.vertical, 4)

            if isExpanded {
                Divider()
                    .padding(.vertical, 6)
                    .padding(.leading, 24)

                VStack(spacing: 14) {
                    valueRow("SB", value: level.smallBlind, field: .smallBlind)
                    valueRow("BB", value: level.bigBlind, field: .bigBlind)
                    valueRow("Ante", value: level.ante, field: .ante)
                    valueRow("Длительность", value: durationMinutes, suffix: " мин", field: .duration)
                }
                .padding(.leading, 24)
                .padding(.bottom, 6)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            if let onDelete {
                Button(role: .destructive, action: onDelete) {
                    Label("Удалить", systemImage: "trash")
                }
            }
        }
    }

    private func valueRow(
        _ title: String,
        value: Int,
        suffix: String = "",
        field: NativeTimerLevelField
    ) -> some View {
        Button {
            onSelect(field)
        } label: {
            HStack(spacing: 8) {
                Text(title)
                    .foregroundStyle(.primary)
                Spacer(minLength: 8)
                Text("\(value)\(suffix)")
                    .monospacedDigit()
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private var durationMinutes: Int {
        max(1, level.durationSeconds / 60)
    }

    private var levelSummary: String {
        let blinds = "\(level.smallBlind) / \(level.bigBlind)"
        let ante = level.ante > 0 ? " · Ante \(level.ante)" : ""
        return "\(blinds)\(ante) · \(durationMinutes) мин"
    }

    private var colorUpTitle: String {
        if let chip = level.colorUpChip {
            return "CU \(chip)"
        }
        return "CU -"
    }

    private var colorUpColor: Color {
        switch level.colorUpChip {
        case 50: return .blue
        case 100: return .white
        case 500: return NativeTheme.accent
        case 1000: return .yellow
        default: return .secondary
        }
    }

    private func colorUpOption(_ chip: Int?, title: String) -> some View {
        Button {
            level.colorUpChip = chip
        } label: {
            if level.colorUpChip == chip {
                Label(title, systemImage: "checkmark")
            } else {
                Text(title)
            }
        }
    }
}

struct NativeSoftButtonStyle: ButtonStyle {
    var tint: Color = NativeTheme.accent

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.black))
            .foregroundStyle(tint)
            .padding(.horizontal, 12)
            .frame(minHeight: 38)
            .frame(maxWidth: .infinity)
            .background(tint.opacity(configuration.isPressed ? 0.24 : 0.16), in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(tint.opacity(0.24)))
            .opacity(configuration.isPressed ? 0.85 : 1)
    }
}

struct NativeTimerAlertSettingsSheet: View {
    let store: NativeTournamentStore
    @State private var settings: NativeSettings
    @State private var alarmStatusText: String?

    init(store: NativeTournamentStore) {
        self.store = store
        _settings = State(initialValue: store.settings)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Системный сигнал", isOn: systemAlarmBinding)
                        .tint(NativeTheme.accent)
                    Toggle("Звук", isOn: $settings.timerSoundEnabled)
                        .tint(NativeTheme.accent)
                        .disabled(!settings.timerNotificationEnabled)
                } header: {
                    Text("Смена уровня")
                } footer: {
                    Text("AlarmKit показывает системный сигнал на экране блокировки и срабатывает даже в бесшумном режиме и при активном Focus.")
                }

                Section {
                    Button {
                        testSystemAlarm()
                    } label: {
                        Label("Проверить сигнал", systemImage: "bell.and.waves.left.and.right.fill")
                    }
                    .foregroundStyle(NativeTheme.accent)
                    .disabled(!settings.timerNotificationEnabled)
                } footer: {
                    Text(alarmStatusText ?? "Тестовый системный сигнал сработает через 3 секунды.")
                }
            }
            .navigationTitle("Уведомления")
            .navigationBarTitleDisplayMode(.inline)
            .onChange(of: settings) { _, nextSettings in
                store.updateSettings(nextSettings)
            }
        }
        .presentationDetents([.height(420)])
        .presentationDragIndicator(.visible)
        .presentationContentInteraction(.scrolls)
    }

    private var systemAlarmBinding: Binding<Bool> {
        Binding {
            settings.timerNotificationEnabled
        } set: { value in
            settings.timerNotificationEnabled = value
            if value {
                Task {
                    let authorized = await NativeTimerAlertManager.shared.requestAuthorization()
                    if !authorized {
                        settings.timerNotificationEnabled = false
                        alarmStatusText = "Доступ к системным сигналам запрещён. Его можно включить в настройках iOS."
                    }
                }
            }
        }
    }

    private func testSystemAlarm() {
        alarmStatusText = "Сигнал запланирован…"
        Task {
            let scheduled = await NativeTimerAlertManager.shared.scheduleTest(
                levelIndex: store.timer.currentLevelIndex,
                level: store.currentLevel,
                soundEnabled: settings.timerSoundEnabled
            )
            alarmStatusText = scheduled
                ? "Системный сигнал сработает через 3 секунды."
                : "Не удалось запланировать сигнал. Проверьте разрешение AlarmKit в настройках iOS."
        }
    }
}

struct NativeRebuyTimerSettingsSheet: View {
    let store: NativeTournamentStore
    @State private var settings: NativeSettings
    @State private var intervalMinutes: Int
    @State private var showIntervalPicker = false

    init(store: NativeTournamentStore) {
        self.store = store
        let settings = store.settings
        _settings = State(initialValue: settings)
        _intervalMinutes = State(initialValue: max(1, settings.rebuyTimerIntervalSeconds / 60))
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Включить", isOn: $settings.rebuyTimerEnabled)
                        .tint(NativeTheme.accent)
                    Button {
                        showIntervalPicker = true
                    } label: {
                        HStack(spacing: 8) {
                            Text("Интервал")
                                .foregroundStyle(.primary)
                            Spacer(minLength: 8)
                            Text("\(intervalMinutes) мин")
                                .monospacedDigit()
                                .foregroundStyle(.secondary)
                            Image(systemName: "chevron.right")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.tertiary)
                        }
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                } header: {
                    Text("Таймер ребаев")
                } footer: {
                    Text("Таймер запускается индивидуально для игрока при добавлении ребая. На паузе блайндов таймер ребаев тоже останавливается.")
                }
            }
            .navigationTitle("Таймер ребаев")
            .navigationBarTitleDisplayMode(.inline)
            .onChange(of: intervalMinutes) { _, minutes in
                settings.rebuyTimerIntervalSeconds = max(1, minutes) * 60
            }
            .onChange(of: settings) { _, nextSettings in
                store.updateSettings(nextSettings)
            }
        }
        .sheet(isPresented: $showIntervalPicker) {
            NativeNumberPickerSheet(
                title: "Интервал ребаев",
                value: $intervalMinutes,
                minimum: 1,
                maximum: nil,
                step: 1
            )
        }
        .presentationDetents([.height(310)])
        .presentationDragIndicator(.visible)
        .presentationContentInteraction(.scrolls)
    }
}

struct NativeReferenceSheet: View {
    @State private var expandedSectionIDs: Set<String> = []

    var body: some View {
        NavigationStack {
            List {
                ForEach(NativeReferenceContent.sections) { section in
                    Section {
                        DisclosureGroup(
                            isExpanded: expansionBinding(for: section.id)
                        ) {
                            referenceSectionContent(section)
                        } label: {
                            Text(section.title)
                                .font(.body.weight(.semibold))
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Справочник")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }

    private func referenceSectionContent(_ section: NativeReferenceSection) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            ForEach(section.items) { item in
                VStack(alignment: .leading, spacing: 8) {
                    if let title = item.title {
                        Text(title)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.primary)
                    }

                    ForEach(item.bullets, id: \.self) { bullet in
                        HStack(alignment: .firstTextBaseline, spacing: 8) {
                            Text("•")
                                .foregroundStyle(.primary)

                            Text(bullet)
                                .font(.subheadline)
                                .foregroundStyle(.primary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
        }
        .padding(.top, 10)
        .padding(.bottom, 4)
    }

    private func expansionBinding(for id: String) -> Binding<Bool> {
        Binding(
            get: { expandedSectionIDs.contains(id) },
            set: { isExpanded in
                if isExpanded {
                    expandedSectionIDs.insert(id)
                } else {
                    expandedSectionIDs.remove(id)
                }
            }
        )
    }
}

struct NativeConfirmation: Identifiable {
    let id = UUID()
    let title: String
    let message: String
    let confirmTitle: String
    let action: () -> Void

    static func resetTournament(action: @escaping () -> Void) -> NativeConfirmation {
        NativeConfirmation(
            title: "Сбросить турнир?",
            message: "Все игроки, бай-ины, ребаи и оплаты будут удалены. Параметры игры и история имен сохранятся.",
            confirmTitle: "Сбросить",
            action: action
        )
    }

    static func resetTimer(action: @escaping () -> Void) -> NativeConfirmation {
        NativeConfirmation(
            title: "Сбросить таймер?",
            message: "Таймер остановится, вернется на первый уровень и выставит полное время первого уровня.",
            confirmTitle: "Сбросить",
            action: action
        )
    }

    static func deletePlayer(_ name: String, action: @escaping () -> Void) -> NativeConfirmation {
        NativeConfirmation(
            title: "Удалить игрока?",
            message: "Игрок «\(name)» будет удален вместе со всеми его бай-инами, ребаями и оплатами.",
            confirmTitle: "Удалить",
            action: action
        )
    }

    static func decrementBuyIn(_ name: String, action: @escaping () -> Void) -> NativeConfirmation {
        NativeConfirmation(
            title: "Убрать ребай?",
            message: "У игрока «\(name)» будет убран один ребай. Если оплат станет больше, они тоже будут скорректированы.",
            confirmTitle: "Убрать",
            action: action
        )
    }

    static func decrementEarlyEntry(_ name: String, action: @escaping () -> Void) -> NativeConfirmation {
        NativeConfirmation(
            title: "Убрать бай-ин?",
            message: "У игрока «\(name)» будет убран бай-ин. Общие оплаты будут скорректированы при необходимости.",
            confirmTitle: "Убрать",
            action: action
        )
    }

    static func decrementPaid(_ name: String, action: @escaping () -> Void) -> NativeConfirmation {
        NativeConfirmation(
            title: "Убрать оплату?",
            message: "У игрока «\(name)» будет убрана одна оплаченная запись.",
            confirmTitle: "Убрать",
            action: action
        )
    }

    static func returnPlayer(_ name: String, action: @escaping () -> Void) -> NativeConfirmation {
        NativeConfirmation(
            title: "Вернуть игрока в игру?",
            message: "Игрок «\(name)» снова будет отмечен как «В игре».",
            confirmTitle: "Вернуть",
            action: action
        )
    }
}

enum NativeSheet: Identifiable {
    case addPlayer
    case settings
    case timerAlerts
    case reference
    case info

    var id: String {
        switch self {
        case .addPlayer: return "add-player"
        case .settings: return "settings"
        case .timerAlerts: return "timer-alerts"
        case .reference: return "reference"
        case .info: return "info"
        }
    }
}
