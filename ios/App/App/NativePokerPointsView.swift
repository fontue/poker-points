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
    static let red = Color(red: 0.94, green: 0.45, blue: 0.48)
    static let dialogBackground = backgroundTop
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
    private let ticker = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [NativeTheme.backgroundTop, NativeTheme.backgroundBottom],
                startPoint: .top,
                endPoint: .bottom
            )
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
        .sheet(item: $activeSheet) { sheet in
            switch sheet {
            case .addPlayer:
                NativeAddPlayerSheet(store: store)
            case .settings:
                NativeSettingsSheet(store: store)
            case .timerSettings:
                NativeTimerSettingsSheet(store: store)
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
            Text("Poker points")
                .font(.caption.weight(.black))
                .tracking(3)
                .foregroundStyle(NativeTheme.accent)
                .textCase(.uppercase)
            Spacer()
            Button {
                activeSheet = .reference
            } label: {
                Image(systemName: "book.closed.fill")
                    .font(.headline.weight(.black))
                    .frame(width: 42, height: 34)
                    .background(NativeTheme.surfaceStrong, in: RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(NativeTheme.border))
            }
            .buttonStyle(.plain)
            .foregroundStyle(.white)

            Button {
                confirmation = .resetTournament {
                    store.resetTournament()
                }
            } label: {
                Text("Сброс")
                    .font(.subheadline.weight(.black))
                    .padding(.horizontal, 14)
                    .frame(height: 34)
                    .background(NativeTheme.red.opacity(0.16), in: RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(NativeTheme.red.opacity(0.22)))
            }
            .buttonStyle(.plain)
            .foregroundStyle(NativeTheme.red)
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
                            .font(.caption.weight(.bold))
                            .foregroundStyle(.secondary)
                        Text("\(store.settings.buyInPoints) pts · \(store.settings.buyInChips) chips")
                            .font(.headline.weight(.black))
                            .foregroundStyle(.white)
                    }
                    Spacer()
                    Image(systemName: "slider.horizontal.3")
                }
                .frame(height: 58)
                .padding(14)
                .background(NativeTheme.surface, in: RoundedRectangle(cornerRadius: 22))
                .overlay(RoundedRectangle(cornerRadius: 22).stroke(NativeTheme.border))
            }
            .buttonStyle(.plain)

            Button {
                activeSheet = .addPlayer
            } label: {
                Image(systemName: "person.badge.plus")
                    .font(.title3.weight(.black))
                    .frame(width: 58)
                    .frame(maxHeight: .infinity)
                    .background(NativeTheme.surface, in: RoundedRectangle(cornerRadius: 22))
                    .overlay(RoundedRectangle(cornerRadius: 22).stroke(NativeTheme.border))
            }
            .buttonStyle(.plain)
        }
        .frame(height: 86)
        .padding(.bottom, 12)
    }

    private var timerCard: some View {
        let level = store.currentLevel

        return VStack(spacing: 14) {
                HStack(alignment: .center, spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Уровень \(store.timer.currentLevelIndex + 1)")
                            .font(.caption.weight(.black))
                            .foregroundStyle(.secondary)
                        Text("\(compact(level.smallBlind)) / \(compact(level.bigBlind)) / \(compact(level.ante))")
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
                            .font(.headline.weight(.black))
                            .frame(width: 54, height: 38)
                    }
                    .buttonStyle(.plain)
                    .background(NativeTheme.accent.opacity(0.22), in: RoundedRectangle(cornerRadius: 14))
                    .foregroundStyle(NativeTheme.accent)

                    timerControlButton("forward.fill") {
                        store.nextLevel()
                    }

                    Menu {
                        Button {
                            activeSheet = .timerSettings
                        } label: {
                            Label("Настройки таймера", systemImage: "gearshape.fill")
                        }

                        Button {
                            activeSheet = .timerAlerts
                        } label: {
                            Label("Настройки уведомлений", systemImage: "bell.badge.fill")
                        }

                        Button(role: .destructive) {
                            confirmation = .resetTimer {
                                store.resetTimer()
                            }
                        } label: {
                            Label("Сбросить таймер", systemImage: "arrow.counterclockwise")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle.fill")
                            .font(.headline.weight(.black))
                            .frame(width: 44, height: 38)
                            .background(NativeTheme.surfaceStrong, in: RoundedRectangle(cornerRadius: 14))
                            .foregroundStyle(.white)
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
        .background(NativeTheme.surface, in: RoundedRectangle(cornerRadius: 28))
        .overlay(RoundedRectangle(cornerRadius: 28).stroke(NativeTheme.border))
        .padding(.bottom, 12)
    }

    private var playersList: some View {
        List {
            ForEach(store.players) { player in
                NativePlayerRow(
                    store: store,
                    player: player,
                    place: store.eliminatedPlace(for: player),
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

    private var footer: some View {
        Button {
            activeSheet = .info
        } label: {
            HStack(spacing: 8) {
                NativeMetric(label: "Поинты", value: store.pointsInGame, color: NativeTheme.accent)
                NativeMetric(label: "Оплачено", value: store.pointsPaid, color: NativeTheme.orange)
                NativeMetric(label: "Фишки", value: store.chipsInGame, color: NativeTheme.cyan)
            }
            .padding(6)
            .background(Color.black.opacity(0.52), in: RoundedRectangle(cornerRadius: 22))
            .overlay(RoundedRectangle(cornerRadius: 22).stroke(NativeTheme.border))
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
                .font(.headline.weight(.black))
                .frame(width: 44, height: 38)
        }
        .buttonStyle(.plain)
        .background(NativeTheme.surfaceStrong, in: RoundedRectangle(cornerRadius: 14))
        .foregroundStyle(.white)
    }

}

struct NativePlayerRow: View {
    @ObservedObject var store: NativeTournamentStore
    let player: NativePlayer
    let place: Int?
    let onDecrementBuyIn: () -> Void
    let onDecrementPaid: () -> Void
    let onToggleEliminated: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(spacing: 10) {
            HStack {
                Text(player.name)
                    .font(.headline.weight(.black))
                    .strikethrough(player.isEliminated)
                    .foregroundStyle(player.isEliminated ? NativeTheme.red : .white)
                if let medal = medalText {
                    Text(medal)
                        .font(.headline)
                }
                Text("• \(player.buyIns)")
                    .font(.headline.weight(.black))
                    .foregroundStyle(NativeTheme.accent)
                Text("• \(player.paidEntries)")
                    .font(.headline.weight(.black))
                    .foregroundStyle(NativeTheme.orange)
                Spacer()
                Text(paymentStatusText)
                    .font(.caption2.weight(.black))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background((player.paidEntries >= player.buyIns ? NativeTheme.green : NativeTheme.orange).opacity(0.18), in: Capsule())
                    .foregroundStyle(player.paidEntries >= player.buyIns ? NativeTheme.green : NativeTheme.orange)
            }

            HStack(spacing: 8) {
                action("plus.circle.fill", color: NativeTheme.accent.opacity(0.42)) {
                    playAddHaptic()
                    store.incrementBuyIn(player)
                }
                action("creditcard.fill", color: NativeTheme.orange.opacity(0.42)) {
                    playAddHaptic()
                    store.incrementPaid(player)
                }
            }
        }
        .padding(12)
        .background(NativeTheme.surface, in: RoundedRectangle(cornerRadius: 24))
        .overlay(RoundedRectangle(cornerRadius: 24).stroke(NativeTheme.border))
        .swipeActions(edge: .leading, allowsFullSwipe: false) {
            Button(action: onDecrementBuyIn) {
                Label("Бай-ин", systemImage: "minus.circle")
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
        let debtEntries = max(0, player.buyIns - player.paidEntries)
        guard debtEntries > 0 else { return "Оплачено" }
        return "Не оплачено \(debtEntries * store.settings.buyInPoints)"
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
                .font(.headline.weight(.black))
                .frame(maxWidth: .infinity)
                .frame(height: 34)
                .background(color, in: RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }

    private func playAddHaptic() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
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
        .background(color.opacity(0.12), in: RoundedRectangle(cornerRadius: 16))
    }
}

struct NativeAddPlayerSheet: View {
    @ObservedObject var store: NativeTournamentStore
    @State private var name = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Добавить игрока")
                .font(.title2.weight(.black))
            TextField("Имя", text: $name)
                .textInputAutocapitalization(.words)
                .font(.title3.weight(.bold))
                .padding(14)
                .background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 18))
                .onSubmit(addCurrentName)

            if !store.playerNameHistory.isEmpty {
                Text("История имен")
                    .font(.caption.weight(.black))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)

                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(sortedHistory, id: \.self) { historyName in
                            historyRow(historyName)
                        }
                    }
                    .padding(.bottom, 6)
                }
            }
        }
        .padding(20)
        .background(NativeTheme.dialogBackground.ignoresSafeArea())
    }

    private var sortedHistory: [String] {
        store.playerNameHistory.sorted { $0.localizedCaseInsensitiveCompare($1) == .orderedAscending }
    }

    private func historyRow(_ historyName: String) -> some View {
        let isAdded = store.players.contains { $0.name.caseInsensitiveCompare(historyName) == .orderedSame }

        return HStack(spacing: 10) {
            Button {
                if !isAdded {
                    store.addPlayer(name: historyName)
                }
            } label: {
                Text(historyName)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(.white)
            }
            .buttonStyle(.plain)
            .disabled(isAdded)

            if isAdded {
                Text("В игре")
                    .font(.caption.weight(.black))
                    .foregroundStyle(NativeTheme.accent)
                    .textCase(.uppercase)
            }

            Button {
                store.deleteHistoryName(historyName)
            } label: {
                Image(systemName: "xmark")
                    .font(.caption.weight(.black))
                    .foregroundStyle(.secondary)
                    .frame(width: 28, height: 28)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(NativeTheme.surface, in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(NativeTheme.border))
    }

    private func canAddName(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return false }
        return !store.players.contains { $0.name.caseInsensitiveCompare(trimmed) == .orderedSame }
    }

    private func addCurrentName() {
        guard canAddName(name) else { return }
        store.addPlayer(name: name)
        name = ""
    }
}

struct NativeSettingsSheet: View {
    @ObservedObject var store: NativeTournamentStore
    @Environment(\.dismiss) private var dismiss
    @State private var settings: NativeSettings
    @State private var showDistributionInfo = false
    @State private var prizeMode: NativePrizeMode

    init(store: NativeTournamentStore) {
        self.store = store
        let settings = store.settings
        _settings = State(initialValue: settings)
        _prizeMode = State(initialValue: NativePrizeMode(settings: settings))
    }

    var body: some View {
        NavigationView {
            Form {
                Section("Игра") {
                    NativeNumberField(title: "Цена бай-ина", value: $settings.buyInPoints, placeholder: "1", minimum: 1)
                    NativeNumberField(title: "Фишек за бай-ин", value: $settings.buyInChips, placeholder: "1", minimum: 1)
                    NativeNumberField(title: "Корректировка фонда", value: $settings.prizeAdjustmentPoints, placeholder: "0", minimum: nil)
                }

                Section("Призы") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                        presetButton(.onePlace)
                        presetButton(.twoPlaces)
                        presetButton(.threePlaces)
                        presetButton(.custom)
                    }

                    if prizeMode == .custom {
                        NativeNumberField(title: "Количество призовых мест", value: prizePlacesBinding, placeholder: "1", minimum: 1)
                    }

                    NativeNumberField(title: "Шаг округления призовых", value: $settings.prizeRoundingStep, placeholder: "1", minimum: 1)

                    if isPrizeDistributionValid {
                        Button {
                            showDistributionInfo = true
                        } label: {
                            Label("Показать расчет по шагам", systemImage: "info.circle.fill")
                        }
                    }
                }

                Section("Распределение призовых") {
                    if prizeMode == .custom {
                        prizeDistributionEditor
                    } else {
                        HStack {
                            Text("Текущий пресет")
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text(normalizedDistribution.map(String.init).joined(separator: "/") + "%")
                                .font(.body.weight(.black))
                                .monospacedDigit()
                        }
                    }

                    if !prizeValidationMessages.isEmpty {
                        ForEach(prizeValidationMessages, id: \.self) { message in
                            Text(message)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(NativeTheme.red)
                        }
                    }
                }
            }
            .navigationTitle("Параметры")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Готово") {
                        normalizeBeforeSave()
                        if isPrizeDistributionValid {
                            store.updateSettings(settings)
                            dismiss()
                        }
                    }
                    .disabled(!isPrizeDistributionValid)
                }
            }
        }
        .sheet(isPresented: $showDistributionInfo) {
            NativePrizeDistributionInfoSheet(settings: settings, prizePoints: store.prizePoints)
        }
        .background(NativeTheme.dialogBackground.ignoresSafeArea())
    }

    private var prizeDistributionEditor: some View {
        ForEach(0..<settings.prizePlaces, id: \.self) { index in
            NativeNumberField(
                title: "\(index + 1) место, %",
                value: prizePercentBinding(at: index),
                placeholder: "0",
                minimum: 0
            )
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

    private func presetButton(_ mode: NativePrizeMode) -> some View {
        Button {
            prizeMode = mode
            if let distribution = mode.distribution {
                settings.prizePlaces = distribution.count
                settings.prizeDistribution = distribution
            } else {
                resizePrizeDistribution()
            }
        } label: {
            VStack(spacing: 2) {
                Text(mode.title)
                    .font(.caption.weight(.black))
                Text(mode.subtitle)
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(prizeMode == mode ? NativeTheme.accentSoft : NativeTheme.surfaceStrong, in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(prizeMode == mode ? NativeTheme.accent.opacity(0.35) : NativeTheme.border))
        }
        .buttonStyle(.plain)
    }

    private func resizePrizeDistribution() {
        settings.prizeDistribution = Array(settings.prizeDistribution.prefix(settings.prizePlaces))
        while settings.prizeDistribution.count < settings.prizePlaces {
            settings.prizeDistribution.append(0)
        }
    }

    private func normalizeBeforeSave() {
        settings.buyInPoints = max(1, settings.buyInPoints)
        settings.buyInChips = max(1, settings.buyInChips)
        settings.prizePlaces = max(1, min(20, settings.prizePlaces))
        settings.prizeRoundingStep = max(1, settings.prizeRoundingStep)
        resizePrizeDistribution()
    }
}

enum NativePrizeMode: Hashable {
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
        textField.keyboardType = keyboardType
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
        textField.keyboardType = keyboardType
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
    @Environment(\.dismiss) private var dismiss
    let settings: NativeSettings
    let prizePoints: Int

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Расчет показывает, как будет округляться распределение при текущем шаге призовых.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    VStack(spacing: 0) {
                        HStack {
                            Text("Фонд")
                                .frame(width: 66, alignment: .leading)
                            Text("Выплаты")
                            Spacer()
                        }
                        .font(.caption.weight(.black))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                        .padding(.horizontal, 14)
                        .padding(.top, 12)
                        .padding(.bottom, 8)

                        ForEach(rows, id: \.fund) { row in
                            Divider()
                                .background(NativeTheme.border)
                            NativePrizeDistributionInfoRowView(row: row)
                        }
                    }
                    .background(NativeTheme.surface, in: RoundedRectangle(cornerRadius: 20))
                    .overlay(RoundedRectangle(cornerRadius: 20).stroke(NativeTheme.border))
                }
                .padding(20)
            }
            .navigationTitle("Распределение")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Закрыть") { dismiss() }
                }
            }
            .background(NativeTheme.dialogBackground.ignoresSafeArea())
        }
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

    private func formatDecimal(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 1
        return formatter.string(from: NSNumber(value: value)) ?? "0"
    }
}

struct NativePrizeDistributionInfoRowView: View {
    let row: NativePrizeDistributionInfoRow

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            VStack(alignment: .leading, spacing: 3) {
                Text("Фонд")
                    .font(.caption2.weight(.black))
                    .foregroundStyle(.secondary)
                Text("\(row.fund)")
                    .font(.subheadline.weight(.black))
                    .monospacedDigit()
                    .foregroundStyle(NativeTheme.green)
            }
            .frame(width: 66, alignment: .leading)

            VStack(spacing: 6) {
                ForEach(row.payouts, id: \.place) { payout in
                    HStack(spacing: 8) {
                        Text("\(payout.place) место")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.secondary)
                            .frame(width: 62, alignment: .leading)

                        Spacer(minLength: 8)

                        Text("\(payout.amount)")
                            .font(.subheadline.weight(.black))
                            .monospacedDigit()
                            .foregroundStyle(.white)

                        Text("\(formatDecimal(payout.percent))%")
                            .font(.caption.weight(.bold))
                            .monospacedDigit()
                            .foregroundStyle(NativeTheme.accent)
                            .frame(width: 48, alignment: .trailing)
                    }
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(NativeTheme.surfaceStrong, in: RoundedRectangle(cornerRadius: 14))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
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

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Информация об игре")
                    .font(.title2.weight(.black))

                HStack(spacing: 8) {
                    infoCard("Поинты в игре", store.pointsInGame, NativeTheme.accent)
                    infoCard("Оплачено", store.pointsPaid, NativeTheme.orange)
                    infoCard("Призовые", store.prizePoints, NativeTheme.green)
                }

                HStack(spacing: 8) {
                    infoCard("Фишки", store.chipsInGame, NativeTheme.cyan, details: "\(formatDecimal(store.totalChipsInBigBlinds)) BB")
                    infoCard("Средний стек", store.averageStack, NativeTheme.blue, details: "\(formatDecimal(store.averageStackInBigBlinds)) BB")
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Призовые места")
                        .font(.headline.weight(.black))
                    ForEach(store.prizePayouts()) { payout in
                        prizePayoutRow(payout)
                    }

                    Divider()

                    HStack {
                        Text("Осталось за финальным столом")
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text("\(store.finalTableRemainder())")
                            .font(.body.weight(.black))
                            .foregroundStyle(NativeTheme.green)
                    }
                }
                .padding()
                .background(NativeTheme.surface, in: RoundedRectangle(cornerRadius: 22))
                .overlay(RoundedRectangle(cornerRadius: 22).stroke(NativeTheme.border))
            }
            .padding(20)
        }
        .background(NativeTheme.dialogBackground.ignoresSafeArea())
    }

    private func prizePayoutRow(_ payout: NativePrizePayout) -> some View {
        HStack(spacing: 10) {
            Text("\(payout.place)")
                .font(.headline.weight(.black))
                .monospacedDigit()
                .frame(width: 34, height: 34)
                .background(placeColor(payout.place).opacity(0.2), in: Circle())
                .foregroundStyle(placeColor(payout.place))

            VStack(alignment: .leading, spacing: 2) {
                Text("\(payout.place) место")
                    .font(.subheadline.weight(.black))
                Text(payout.playerName ?? "Не определено")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 8)

            VStack(alignment: .trailing, spacing: 2) {
                Text("\(payout.amount)")
                    .font(.headline.weight(.black))
                    .monospacedDigit()
                    .foregroundStyle(NativeTheme.green)
                Text("\(formatDecimal(realPrizePercent(for: payout)))%")
                    .font(.caption.weight(.bold))
                    .monospacedDigit()
                    .foregroundStyle(NativeTheme.accent)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(NativeTheme.surfaceStrong, in: RoundedRectangle(cornerRadius: 16))
    }

    private func infoCard(_ title: String, _ value: Int, _ color: Color, details: String? = nil) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.caption.weight(.black))
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            Text("\(value)")
                .font(.headline.weight(.black))
                .monospacedDigit()
                .foregroundStyle(color)
            if let details {
                Text(details)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(color.opacity(0.72))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(color.opacity(0.12), in: RoundedRectangle(cornerRadius: 22))
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

struct NativeTimerSettingsSheet: View {
    @ObservedObject var store: NativeTournamentStore
    @Environment(\.dismiss) private var dismiss
    @State private var levels: [NativeTimerLevel]
    @State private var bulkDurationMinutes: Int
    @State private var showResetConfirmation = false

    init(store: NativeTournamentStore) {
        self.store = store
        let currentLevels = store.settings.timerLevels
        _levels = State(initialValue: currentLevels)
        _bulkDurationMinutes = State(initialValue: max(1, (currentLevels.first?.durationSeconds ?? 900) / 60))
    }

    var body: some View {
        NavigationView {
            Form {
                Section("Длительность") {
                    HStack(spacing: 10) {
                        NativeNumberField(title: "Мин.", value: $bulkDurationMinutes, placeholder: "15", minimum: 1)
                        Button("Применить") {
                            bulkDurationMinutes = max(1, bulkDurationMinutes)
                            for index in levels.indices {
                                levels[index].durationSeconds = bulkDurationMinutes * 60
                            }
                        }
                        .buttonStyle(NativeSoftButtonStyle())
                        .fixedSize(horizontal: true, vertical: false)
                    }
                }

                Section("Анте") {
                    HStack(spacing: 8) {
                        Button("ББ Анте") {
                            for index in levels.indices {
                                levels[index].ante = levels[index].bigBlind
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .buttonStyle(NativeSoftButtonStyle())

                        Button("Убрать анте", role: .destructive) {
                            for index in levels.indices {
                                levels[index].ante = 0
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .buttonStyle(NativeSoftButtonStyle(tint: NativeTheme.red))
                    }
                }

                Section("Уровни") {
                    ForEach(levels.indices, id: \.self) { index in
                        NativeTimerLevelEditor(
                            index: index,
                            level: levelBinding(at: index),
                            onDelete: levels.count > 1 ? { levels.remove(at: index) } : nil
                        )
                    }

                    Button {
                        levels.append(nextLevel())
                    } label: {
                        Label("Добавить уровень", systemImage: "plus")
                    }
                }
            }
            .navigationTitle("Таймер")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Сбросить") {
                        showResetConfirmation = true
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Готово") {
                        var next = store.settings
                        next.timerLevels = levels.map(normalizedLevel)
                        store.updateSettings(next)
                        dismiss()
                    }
                }
            }
        }
        .alert(isPresented: $showResetConfirmation) {
            Alert(
                title: Text("Сбросить настройки таймера?"),
                message: Text("Все уровни, длительности, анте и color up будут возвращены к стандартным значениям."),
                primaryButton: .destructive(Text("Сбросить")) {
                    levels = NativeSettings.defaultTimerLevels
                    bulkDurationMinutes = 15
                },
                secondaryButton: .cancel(Text("Отмена"))
            )
        }
        .background(NativeTheme.dialogBackground.ignoresSafeArea())
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

        let smallBlind = max(1, last.smallBlind + max(50, last.smallBlind / 4))
        let bigBlind = max(smallBlind + 1, smallBlind * 2)
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

struct NativeTimerLevelEditor: View {
    let index: Int
    @Binding var level: NativeTimerLevel
    let onDelete: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Уровень \(index + 1)")
                    .font(.headline.weight(.black))
                Spacer()
                Button {
                    cycleColorUp()
                } label: {
                    Text(colorUpTitle)
                        .font(.caption.weight(.black))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(colorUpColor.opacity(0.18), in: Capsule())
                        .foregroundStyle(colorUpColor)
                }
                .buttonStyle(.plain)
                if let onDelete {
                    Button(action: onDelete) {
                        Image(systemName: "trash")
                            .font(.subheadline.weight(.black))
                            .foregroundStyle(NativeTheme.red)
                            .frame(width: 34, height: 34)
                            .background(NativeTheme.red.opacity(0.14), in: Circle())
                    }
                    .buttonStyle(.plain)
                    .contentShape(Circle())
                }
            }

            NativeNumberField(title: "SB", value: $level.smallBlind, placeholder: "100", minimum: 1)
            NativeNumberField(title: "BB", value: $level.bigBlind, placeholder: "200", minimum: 1)
            NativeNumberField(title: "Ante", value: $level.ante, placeholder: "200", minimum: 0)
            NativeNumberField(title: "Минуты", value: durationMinutesBinding, placeholder: "15", minimum: 1)
        }
        .padding(.vertical, 6)
    }

    private var durationMinutesBinding: Binding<Int> {
        Binding {
            max(1, level.durationSeconds / 60)
        } set: { value in
            level.durationSeconds = max(1, value) * 60
        }
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

    private func cycleColorUp() {
        let values: [Int?] = [nil, 50, 100, 500, 1000]
        let currentIndex = values.firstIndex { $0 == level.colorUpChip } ?? 0
        level.colorUpChip = values[(currentIndex + 1) % values.count]
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
    @ObservedObject var store: NativeTournamentStore
    @Environment(\.dismiss) private var dismiss
    @State private var settings: NativeSettings

    init(store: NativeTournamentStore) {
        self.store = store
        _settings = State(initialValue: store.settings)
    }

    var body: some View {
        NavigationView {
            Form {
                Section("Смена уровня") {
                    Toggle("Звук", isOn: $settings.timerSoundEnabled)
                        .toggleStyle(SwitchToggleStyle(tint: NativeTheme.accent))
                    Toggle("Вибрация", isOn: $settings.timerVibrationEnabled)
                        .toggleStyle(SwitchToggleStyle(tint: NativeTheme.accent))
                    Toggle("Уведомление", isOn: notificationBinding)
                        .toggleStyle(SwitchToggleStyle(tint: NativeTheme.accent))
                }

                Section {
                    Button {
                        NativeTimerAlertManager.shared.trigger(
                            settings: settings,
                            levelIndex: store.timer.currentLevelIndex,
                            level: store.currentLevel
                        )
                    } label: {
                        Label("Проверить сигнал", systemImage: "bell.and.waves.left.and.right.fill")
                    }
                } footer: {
                    Text("В фоне iOS может ограничивать выполнение приложения. Live Activity остается основным способом видеть таймер после сворачивания.")
                }
            }
            .navigationTitle("Уведомления")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Готово") {
                        store.updateSettings(settings)
                        dismiss()
                    }
                }
            }
        }
        .background(NativeTheme.dialogBackground.ignoresSafeArea())
    }

    private var notificationBinding: Binding<Bool> {
        Binding {
            settings.timerNotificationEnabled
        } set: { value in
            settings.timerNotificationEnabled = value
            if value {
                NativeTimerAlertManager.shared.requestNotificationPermission()
            }
        }
    }
}

struct NativeReferenceSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var expandedSectionIDs: Set<String> = []

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    ForEach(NativeReferenceContent.sections) { section in
                        VStack(alignment: .leading, spacing: 12) {
                            Button {
                                toggle(section.id)
                            } label: {
                                HStack(spacing: 10) {
                                    Text(section.title)
                                        .font(.headline.weight(.black))
                                        .foregroundStyle(.white)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Image(systemName: isExpanded(section.id) ? "chevron.up" : "chevron.down")
                                        .font(.caption.weight(.black))
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .buttonStyle(.plain)

                            if isExpanded(section.id) {
                                VStack(alignment: .leading, spacing: 14) {
                                    ForEach(section.items) { item in
                                        VStack(alignment: .leading, spacing: 8) {
                                            if let title = item.title {
                                                Text(title)
                                                    .font(.subheadline.weight(.black))
                                                    .foregroundStyle(.white)
                                            }

                                            ForEach(item.bullets, id: \.self) { bullet in
                                                HStack(alignment: .top, spacing: 8) {
                                                    Circle()
                                                        .fill(Color.white.opacity(0.72))
                                                        .frame(width: 5, height: 5)
                                                        .padding(.top, 7)
                                                    Text(bullet)
                                                        .font(.subheadline)
                                                        .foregroundStyle(.white.opacity(0.86))
                                                        .fixedSize(horizontal: false, vertical: true)
                                                }
                                            }
                                        }
                                    }
                                }
                                .padding(.top, 2)
                            }
                        }
                        .padding(16)
                        .background(NativeTheme.surface, in: RoundedRectangle(cornerRadius: 20))
                        .overlay(RoundedRectangle(cornerRadius: 20).stroke(NativeTheme.border))
                    }
                }
                .padding(20)
            }
            .navigationTitle("Справочник")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Закрыть") { dismiss() }
                }
            }
            .background(NativeTheme.dialogBackground.ignoresSafeArea())
        }
    }

    private func isExpanded(_ id: String) -> Bool {
        expandedSectionIDs.contains(id)
    }

    private func toggle(_ id: String) {
        if expandedSectionIDs.contains(id) {
            expandedSectionIDs.remove(id)
        } else {
            expandedSectionIDs.insert(id)
        }
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
            message: "Все игроки, бай-ины и оплаты будут удалены. Параметры игры и история имен сохранятся.",
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
            message: "Игрок «\(name)» будет удален вместе со всеми его бай-инами и оплатами.",
            confirmTitle: "Удалить",
            action: action
        )
    }

    static func decrementBuyIn(_ name: String, action: @escaping () -> Void) -> NativeConfirmation {
        NativeConfirmation(
            title: "Убрать бай-ин?",
            message: "У игрока «\(name)» будет убран один бай-ин. Если оплат станет больше, они тоже будут скорректированы.",
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
    case timerSettings
    case timerAlerts
    case reference
    case info

    var id: String {
        switch self {
        case .addPlayer: return "add-player"
        case .settings: return "settings"
        case .timerSettings: return "timer-settings"
        case .timerAlerts: return "timer-alerts"
        case .reference: return "reference"
        case .info: return "info"
        }
    }
}
