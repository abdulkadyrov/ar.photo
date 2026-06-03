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
```

## MVP note

The app is frontend-only and stores media locally in IndexedDB. A QR opened on another device will need the same imported data/media on that device, or media must be published as static assets. True MindAR image tracking also requires a compiled `.mind` image target; the current viewer is camera-first and ready for that integration step.
