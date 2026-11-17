import SwiftUI

struct ViewerRoot: View {
    @StateObject private var model = ViewerModel()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            ViewerWebView(model: model, active: scenePhase != .background)
                .opacity(model.loading || model.error != nil ? 0 : 1)
                .accessibilityHidden(model.loading || model.error != nil)
            if let error = model.error {
                VStack(spacing: 20) {
                    Image(systemName: "wifi.exclamationmark").font(.largeTitle)
                    Text("Хан Зама").font(.largeTitle.bold())
                    Text(error).font(.body).multilineTextAlignment(.center)
                    Button("Повторить", action: model.retry).buttonStyle(.borderedProminent)
                }
                .padding(24)
                .accessibilityElement(children: .contain)
            } else if model.loading {
                VStack(spacing: 20) {
                    Image(systemName: "camera.viewfinder").font(.largeTitle)
                    Text("Хан Зама").font(.largeTitle.bold())
                    Text("Живые фотографии").font(.body)
                    ProgressView().tint(.white).accessibilityLabel("Открываем камеру")
                }
                .padding(24)
            }
        }
        .foregroundStyle(.white)
        .tint(Color(red: 0.43, green: 0.32, blue: 1))
        .preferredColorScheme(.dark)
        .onOpenURL { model.open($0) }
        .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
            if let url = activity.webpageURL { model.open(url) }
        }
    }
}
