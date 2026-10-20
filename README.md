# Content Factory V3

Dashboard React + Vite + Tailwind CSS untuk katalog produk, semakan output TikTok, dan peraturan V3. Data dibaca dan dikemas kini melalui Google Apps Script REST API.

## Keperluan

- Node.js 20.19+ (disyorkan Node.js 22 LTS atau lebih baru) dan npm.
- Git untuk laluan deploy GitHub.

## Setup tempatan

```bash
cd /Volumes/Samsung980Pro/ContentFactoryV3
npm install
npm run dev
```

Vite biasanya memaparkan URL `http://localhost:5173`. Fail `.env` tempatan menetapkan `VITE_API_URL`; jangan commit fail itu. Untuk mesin lain, salin `.env.example` sebagai `.env` dan tetapkan URL Apps Script.

Build dan preview production secara tempatan:

```bash
npm run build
npm run preview
```

## Deploy ke Cloudflare Pages melalui GitHub (disyorkan)

1. Cipta repository GitHub kosong, contohnya `contentfactoryv3`.
2. Dari folder projek, commit dan push kod.
3. Di Cloudflare Dashboard, buka **Workers & Pages → Create application → Pages → Connect to Git**. Beri akses kepada repository dan pilih branch `main`.
4. Tetapkan build:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
5. Di **Settings → Environment variables**, tambah `VITE_API_URL` dengan URL Apps Script yang sama untuk Production (dan Preview jika preview deploy perlu guna API).
6. Simpan dan deploy. Commit baharu ke `main` akan mencetuskan deploy production.

## Custom domain dan DNS

Daftarkan `contentfactoryv3.senangje.my` di **Workers & Pages → contentfactoryv3 → Custom domains → Set up a custom domain**. Kemudian di DNS Management Exabytes, tambah rekod CNAME:

- Host/Name: `contentfactoryv3`
- Target/Value: `contentfactoryv3.pages.dev`
- TTL: Default

Jika nama projek Pages lain, gunakan hostname `*.pages.dev` yang dipaparkan dalam dashboard. Jangan ubah nameserver domain induk jika hanya mahu sambungkan subdomain ini.

## Integrasi Apps Script

- Bootstrap: `GET ?action=bootstrap`
- Kemas kini library/status: `POST { action: "updateScript", record: {...} }`
- Simpan batch draft: `POST { action: "saveBatchDrafts", items: [...] }`
- POST menggunakan `Content-Type: text/plain;charset=utf-8`.
