import Combine
import Foundation

@MainActor
final class ViewerModel: ObservableObject {
    @Published var url = ViewerURL.home
    @Published var revision = UUID()
    @Published var loading = true
    @Published var error: String?

    func open(_ incoming: URL) {
        guard let safeURL = ViewerURL.invocation(incoming) else {
            error = "Эта ссылка не относится к публичным фотографиям Хан Зама."
            return
        }
        url = safeURL
        retry()
    }

    func retry() {
        error = nil
        loading = true
        revision = UUID()
    }
}
