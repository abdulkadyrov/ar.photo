import Foundation

/// Accept only public viewer routes. Never forward credentials or a cabinet URL to the clip.
enum ViewerURL {
    static let home = URL(string: "https://khanzama.ru/ar.photo/camera")!

    static func invocation(_ url: URL) -> URL? {
        guard let parts = URLComponents(url: url, resolvingAgainstBaseURL: false),
              parts.scheme == "https", parts.host?.lowercased() == "khanzama.ru",
              parts.user == nil, parts.password == nil,
              parts.port == nil || parts.port == 443 else { return nil }
        let path = parts.percentEncodedPath
        if path == "/ar.photo/camera" || path == "/ar.photo/camera/" {
            return home
        }
        let prefix = "/ar.photo/ar/"
        guard path.hasPrefix(prefix) else { return nil }
        let slug = String(path.dropFirst(prefix.count))
        guard !slug.isEmpty, slug.count <= 256,
              slug.range(of: "^[A-Za-z0-9_-]+$", options: .regularExpression) != nil else { return nil }
        var result = URLComponents(url: home, resolvingAgainstBaseURL: false)!
        result.path = prefix + slug
        // Only the existing explicit fallback option may cross the invocation boundary.
        if parts.queryItems?.contains(URLQueryItem(name: "view", value: "video")) == true {
            result.queryItems = [URLQueryItem(name: "view", value: "video")]
        }
        return result.url
    }

    static func canNavigate(_ url: URL) -> Bool {
        invocation(url) != nil || url.absoluteString == "https://khanzama.ru/ar.photo/privacy"
    }
}
