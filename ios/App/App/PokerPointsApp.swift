import SwiftUI

@main
struct PokerPointsApp: App {
    init() {
        NativeTimerAlertManager.shared.configure()
    }

    var body: some Scene {
        WindowGroup {
            NativePokerPointsView()
        }
    }
}
