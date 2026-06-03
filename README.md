# School AR Photo

Web-based MVP for live school photos: upload a portrait and video, generate a QR viewer link, export ZIP assets, and open a camera-first AR viewer.

## Stack

- React + Vite + TypeScript
- TailwindCSS
- IndexedDB for local metadata and Blob media
- qrcode.react + qrcode for QR display and PNG export
- JSZip for ZIP export/import
- PWA manifest + service worker

## Commands

```bash
npm install
npm run dev
npm run build
npm run generate:test-mind
```

## MVP note

The app is frontend-only and stores media locally in IndexedDB. A QR opened on another device will need the same imported data/media on that device, or media must be published as static assets. True MindAR image tracking requires a compiled `.mind` image target. For the public test viewer, place `test.jpg` and `test.mp4` in `public/test-assets/`, then run `npm run generate:test-mind`.
