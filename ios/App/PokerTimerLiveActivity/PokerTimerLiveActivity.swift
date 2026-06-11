import ActivityKit
import WidgetKit
import SwiftUI

private struct ResolvedTimerLevel {
    let index: Int
    let smallBlind: Int
    let bigBlind: Int
    let ante: Int
    let colorUpChip: Int?
    let remainingSeconds: Int
    let endsAt: Date
}

private func formatCompactNumber(_ value: Int) -> String {
    guard abs(value) >= 1000 else {
        return "\(value)"
    }

    let compactValue = Double(value) / 1000
    if compactValue.rounded() == compactValue {
        return "\(Int(compactValue))k"
    }

    return String(format: "%.1fk", compactValue)
}

private func formatTime(_ seconds: Int) -> String {
    let minutes = max(0, seconds) / 60
    let remainingSeconds = max(0, seconds) % 60
    return String(format: "%02d:%02d", minutes, remainingSeconds)
}

private func formatBlinds(_ level: ResolvedTimerLevel, includesAnte: Bool = true) -> String {
    let blinds = "\(formatCompactNumber(level.smallBlind))/\(formatCompactNumber(level.bigBlind))"
    guard includesAnte, level.ante > 0 else { return blinds }
    return "\(blinds)/\(formatCompactNumber(level.ante))"
}

private func formatTinyBlind(_ value: Int) -> String {
    if value >= 1000 {
        return formatCompactNumber(value)
    }
    if value % 100 == 0 {
        return "\(value / 100)"
    }
    return "\(value)"
}

private func formatTinyBlinds(_ level: ResolvedTimerLevel) -> String {
    let regularBlinds = formatBlinds(level, includesAnte: false)
    guard regularBlinds.count > 7 else { return regularBlinds }
    return "\(formatTinyBlind(level.smallBlind))/\(formatTinyBlind(level.bigBlind))"
}

private func chipTint(_ value: Int) -> Color {
    switch value {
    case 50:
        return .blue
    case 100:
        return Color(red: 0.9, green: 0.9, blue: 0.96)
    case 500:
        return .purple
    case 1000:
        return .yellow
    default:
        return .orange
    }
}

private func resolveLevel(state: PokerTimerActivityAttributes.ContentState, now: Date) -> ResolvedTimerLevel {
    let fallback = ResolvedTimerLevel(
        index: state.levelIndex,
        smallBlind: state.smallBlind,
        bigBlind: state.bigBlind,
        ante: state.ante,
        colorUpChip: state.colorUpChip,
        remainingSeconds: state.remainingSeconds,
        endsAt: state.endsAt
    )

    guard state.isRunning, let levelStartedAt = state.levelStartedAt, !state.levels.isEmpty else {
        return fallback
    }

    let firstIndex = max(0, min(state.levelIndex, state.levels.count - 1))
    var elapsedSeconds = max(0, Int(now.timeIntervalSince(levelStartedAt)))
    var levelStart = levelStartedAt

    for index in firstIndex..<state.levels.count {
        let level = state.levels[index]
        let duration = max(1, level.durationSeconds)
        let isLastLevel = index == state.levels.count - 1

        if elapsedSeconds < duration || isLastLevel {
            let remaining = isLastLevel ? max(0, duration - elapsedSeconds) : duration - elapsedSeconds
            return ResolvedTimerLevel(
                index: index,
                smallBlind: level.smallBlind,
                bigBlind: level.bigBlind,
                ante: level.ante,
                colorUpChip: level.colorUpChip,
                remainingSeconds: remaining,
                endsAt: levelStart.addingTimeInterval(TimeInterval(duration))
            )
        }

        elapsedSeconds -= duration
        levelStart = levelStart.addingTimeInterval(TimeInterval(duration))
    }

    return fallback
}

private struct SuitStrip: View {
    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: "suit.spade.fill")
            Image(systemName: "suit.heart.fill")
            Image(systemName: "suit.club.fill")
            Image(systemName: "suit.diamond.fill")
        }
        .font(.caption2.weight(.black))
        .foregroundStyle(.white.opacity(0.72))
    }
}

private struct ColorUpChip: View {
    let value: Int

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(chipTint(value))
                .frame(width: 9, height: 9)
            Text("CU \(formatCompactNumber(value))")
                .font(.caption2.weight(.black))
                .monospacedDigit()
        }
        .padding(.horizontal, 7)
        .padding(.vertical, 4)
        .background(chipTint(value).opacity(0.22))
        .foregroundStyle(chipTint(value))
        .clipShape(Capsule())
    }
}

private struct TimerText: View {
    let level: ResolvedTimerLevel
    let isRunning: Bool
    let size: CGFloat
    var usesSystemCountdown = false

    var body: some View {
        Group {
            if usesSystemCountdown && isRunning {
                Text(timerInterval: Date()...level.endsAt, countsDown: true)
            } else {
                Text(formatTime(level.remainingSeconds))
            }
        }
        .font(.system(size: size, weight: .black, design: .rounded))
        .monospacedDigit()
        .lineLimit(1)
        .minimumScaleFactor(0.75)
        .foregroundStyle(isRunning ? .white : .yellow)
    }
}

private struct BlindsLine: View {
    let level: ResolvedTimerLevel
    var font: Font = .headline.weight(.black)
    var showsIcon = true

    var body: some View {
        HStack(spacing: 5) {
            if showsIcon {
                Image(systemName: "suit.spade.fill")
                    .font(.caption.weight(.black))
                    .foregroundStyle(.red)
            }
            Text(blindsText)
                .font(font)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.78)
        }
    }

    private var blindsText: String {
        formatBlinds(level)
    }
}

private struct PokerTimerLiveActivityView: View {
    let context: ActivityViewContext<PokerTimerActivityAttributes>

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { timeline in
            let level = resolveLevel(state: context.state, now: timeline.date)

            HStack(alignment: .center, spacing: 14) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        SuitStrip()
                        Text("L\(level.index + 1)")
                            .font(.caption.weight(.black))
                            .monospacedDigit()
                            .foregroundStyle(.secondary)
                    }

                    BlindsLine(level: level, font: .title3.weight(.black))

                    if let colorUpChip = level.colorUpChip {
                        ColorUpChip(value: colorUpChip)
                    }
                }

                Spacer(minLength: 8)

                TimerText(level: level, isRunning: context.state.isRunning, size: 34)
                    .frame(width: 116, alignment: .trailing)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .activityBackgroundTint(Color(red: 0.07, green: 0.07, blue: 0.09))
        .activitySystemActionForegroundColor(.white)
    }
}

struct PokerTimerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PokerTimerActivityAttributes.self) { context in
            PokerTimerLiveActivityView(context: context)
        } dynamicIsland: { context in
            makeDynamicIsland(context: context)
        }
    }

    private func makeDynamicIsland(context: ActivityViewContext<PokerTimerActivityAttributes>) -> DynamicIsland {
        DynamicIsland {
            DynamicIslandExpandedRegion(.leading) {
                TimelineView(.periodic(from: .now, by: 1)) { timeline in
                    let level = resolveLevel(state: context.state, now: timeline.date)

                    Text(formatBlinds(level, includesAnte: false))
                        .font(.system(size: 16, weight: .black, design: .rounded))
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.78)
                        .frame(width: 92, alignment: .leading)
                }
            }

            DynamicIslandExpandedRegion(.trailing) {
                TimelineView(.periodic(from: .now, by: 1)) { timeline in
                    let level = resolveLevel(state: context.state, now: timeline.date)
                    TimerText(level: level, isRunning: context.state.isRunning, size: 19, usesSystemCountdown: true)
                        .frame(width: 70, alignment: .trailing)
                }
            }

            DynamicIslandExpandedRegion(.bottom) {
                TimelineView(.periodic(from: .now, by: 1)) { timeline in
                    let level = resolveLevel(state: context.state, now: timeline.date)

                    if let colorUpChip = level.colorUpChip {
                        ColorUpChip(value: colorUpChip)
                    }
                }
            }
        } compactLeading: {
            TimelineView(.periodic(from: .now, by: 1)) { timeline in
                let level = resolveLevel(state: context.state, now: timeline.date)

                Text(formatTinyBlinds(level))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                    .font(.system(size: 11, weight: .black, design: .rounded))
                    .frame(width: 46, alignment: .leading)
            }
        } compactTrailing: {
            TimelineView(.periodic(from: .now, by: 1)) { timeline in
                let level = resolveLevel(state: context.state, now: timeline.date)

                TimerText(level: level, isRunning: context.state.isRunning, size: 11, usesSystemCountdown: true)
                    .frame(width: 44, alignment: .trailing)
            }
        } minimal: {
            Image(systemName: "suit.spade.fill")
                .font(.caption.weight(.black))
                .foregroundStyle(.red)
        }
    }
}
