import SwiftUI
import WebKit

/// Both the full app and the App Clip use the published viewer, its signed URLs,
/// permission handling, QR checks and existing image-tracking implementation.
struct ViewerWebView: UIViewRepresentable {
    @ObservedObject var model: ViewerModel
    let active: Bool

    func makeCoordinator() -> Coordinator { Coordinator(model: model) }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = .audio
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.isOpaque = false
        view.backgroundColor = .black
        view.scrollView.backgroundColor = .black
        view.scrollView.contentInsetAdjustmentBehavior = .never
        view.navigationDelegate = context.coordinator
        view.uiDelegate = context.coordinator
        return view
    }

    func updateUIView(_ view: WKWebView, context: Context) {
        let coordinator = context.coordinator
        if !active {
            if coordinator.active {
                view.setCameraCaptureState(.none, completionHandler: nil)
                view.setAllMediaPlaybackSuspended(true, completionHandler: nil)
                coordinator.active = false
            }
            return
        }
        let resumed = !coordinator.active
        coordinator.active = true
        view.setAllMediaPlaybackSuspended(false, completionHandler: nil)
        if coordinator.revision != model.revision || resumed {
            coordinator.revision = model.revision
            let resumeURL = resumed ? webViewURL(view) : nil
            view.load(URLRequest(url: resumeURL ?? model.url, cachePolicy: .reloadIgnoringLocalCacheData))
        }
    }

    private func webViewURL(_ view: WKWebView) -> URL? {
        guard let url = view.url, ViewerURL.canNavigate(url) else { return nil }
        return url
    }

    static func dismantleUIView(_ view: WKWebView, coordinator: Coordinator) {
        view.stopLoading()
        view.setCameraCaptureState(.none, completionHandler: nil)
        view.setAllMediaPlaybackSuspended(true, completionHandler: nil)
        view.navigationDelegate = nil
        view.uiDelegate = nil
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let model: ViewerModel
        var revision: UUID?
        var active = true
        init(model: ViewerModel) { self.model = model }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            model.loading = false
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            show(error)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            show(error)
        }

        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            model.error = "Просмотр был остановлен. Откройте камеру ещё раз."
            model.loading = false
        }

        private func show(_ error: Error) {
            if (error as NSError).code == NSURLErrorCancelled { return }
            model.loading = false
            model.error = "Не удалось загрузить просмотр. Проверьте интернет и повторите попытку."
        }

        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url, ViewerURL.canNavigate(url),
                  action.targetFrame?.isMainFrame == true else {
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                     initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType,
                     decisionHandler: @escaping (WKPermissionDecision) -> Void) {
            // Preserve the real camera permission prompt. Never grant microphone access.
            guard origin.protocol == "https", origin.host == "khanzama.ru",
                  origin.port == 0 || origin.port == 443,
                  frame.isMainFrame, type == .camera else {
                decisionHandler(.deny)
                return
            }
            decisionHandler(.prompt)
        }
    }
}
