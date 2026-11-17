import Foundation

let accepted = [
    "https://khanzama.ru/ar.photo/camera",
    "https://khanzama.ru/ar.photo/ar/abc-123",
    "https://khanzama.ru/ar.photo/ar/abc_123?view=video"
]
for value in accepted {
    precondition(ViewerURL.invocation(URL(string: value)!) != nil, "Rejected public invocation")
}
let rejected = [
    "http://khanzama.ru/ar.photo/camera", "https://evil.example/ar.photo/camera",
    "https://khanzama.ru.evil.example/ar.photo/camera", "https://khanzama.ru:444/ar.photo/camera",
    "https://user:password@khanzama.ru/ar.photo/camera", "https://khanzama.ru/ar.photo/admin",
    "https://khanzama.ru/ar.photo/ar/", "https://khanzama.ru/ar.photo/ar/abc/def",
    "https://khanzama.ru/ar.photo/ar/abc%2Fdef", "https://khanzama.ru/ar.photo/ar/%2e%2e"
]
for value in rejected {
    precondition(ViewerURL.invocation(URL(string: value)!) == nil, "Accepted unsafe invocation")
}
let stripped = ViewerURL.invocation(URL(string: "https://khanzama.ru/ar.photo/ar/abc?token=secret#private")!)!
precondition(stripped.absoluteString == "https://khanzama.ru/ar.photo/ar/abc")
precondition(ViewerURL.canNavigate(URL(string: "https://khanzama.ru/ar.photo/privacy")!))
print("Viewer invocation URL checks passed")
