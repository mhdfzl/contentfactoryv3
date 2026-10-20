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
2. Dari folder projek, commit dan push kod:

   ```bash
   git init
   git add .
   git commit -m "Initial Content Factory V3 app"
   git branch -M main
   git remote add origin https://github.com/USERNAME/contentfactoryv3.git
   git push -u origin main
   ```

   Gantikan `USERNAME` dengan nama akaun GitHub. Pastikan `.env` tidak dimasukkan; `.gitignore` sudah mengecualikannya.
3. Di Cloudflare Dashboard, buka **Workers & Pages → Create application → Pages → Connect to Git**. Beri akses kepada repository dan pilih branch `main`.
4. Tetapkan build:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (folder root repo ini)
5. Di **Settings → Environment variables**, tambah `VITE_API_URL` dengan URL Apps Script yang sama untuk Production (dan Preview jika preview deploy perlu guna API).
6. Simpan dan deploy. Commit baharu ke `main` akan mencetuskan deploy production; branch/PR lain menghasilkan preview deploy.

## Deploy terus dengan Wrangler (tanpa sambungan GitHub)

Deploy terus memerlukan akaun Cloudflare dan pengesahan Wrangler pada mesin tersebut. Selepas `npm install` dan menetapkan `.env`:

```bash
npx wrangler login
npm run build
npx wrangler pages project create contentfactoryv3 --production-branch main
npx wrangler pages deploy dist --project-name contentfactoryv3
```

Ikut arahan Wrangler jika ia meminta production branch. Deploy seterusnya:

```bash
npm run build
npx wrangler pages deploy dist --project-name contentfactoryv3
```

Cloudflare Pages memberi subdomain `contentfactoryv3.pages.dev`. Jika projek Pages anda menggunakan nama lain, gunakan hostname `*.pages.dev` yang dipaparkan dalam dashboard sebagai sasaran CNAME.

## Custom domain dan DNS

Mula-mula, buka **Workers & Pages → contentfactoryv3 → Custom domains → Set up a custom domain** dan masukkan `contentfactoryv3.senangje.my`. Lengkapkan pendaftaran domain itu dalam Pages sebelum membuat CNAME; Cloudflare menyatakan rekod CNAME manual tanpa domain dipautkan kepada projek boleh gagal dan memberi ralat 522.

### Pilihan A — nameserver/DNS kekal di Exabytes

Cloudflare Pages membenarkan subdomain dengan DNS luaran. Dalam DNS Management Exabytes, tambah:

| Type | Host/Name | Target/Value | TTL |
|---|---|---|---|
| CNAME | `contentfactoryv3` | `contentfactoryv3.pages.dev` | Default |

Jika nama projek Pages anda bukan `contentfactoryv3`, ganti target dengan hostname Pages yang sebenar. Buang rekod A/AAAA/CNAME lama yang menggunakan host `contentfactoryv3` jika bercanggah. Jangan ubah nameserver domain induk jika hanya mahu mengarahkan subdomain ini. Tunggu DNS tersebar dan status custom domain di Cloudflare menjadi aktif.

### Pilihan B — urus DNS domain melalui Cloudflare

Tambahkan `senangje.my` sebagai zone pada Cloudflare dan pindahkan nameserver domain di Exabytes kepada nameserver yang Cloudflare berikan. Pastikan semua rekod DNS domain sedia ada disalin/disahkan dahulu kerana pertukaran nameserver mengalihkan pengurusan seluruh domain induk. Selepas zone aktif, tambah/semak rekod `CNAME` `contentfactoryv3` → `contentfactoryv3.pages.dev` dalam **DNS → Records**; proses Custom Domains Pages lazimnya mencipta rekod itu secara automatik. Tunggu DNS dan sijil SSL aktif.

## Integrasi Apps Script

- Bootstrap: `GET ?action=bootstrap`
- Kemas kini library/status: `POST { action: "updateScript", record: {...} }`
- Simpan batch draft: helper API tersedia untuk `POST { action: "saveBatchDrafts", items: [...] }`.
- POST menggunakan `Content-Type: text/plain;charset=utf-8` bagi mengelakkan preflight JSON lazim.

Pastikan deployment Web App Apps Script boleh diakses oleh pengguna dashboard. Jika browser melaporkan ralat rangkaian/CORS, semak tetapan akses dan respons deployment Apps Script; CNAME Pages tidak membetulkan CORS API itu sendiri.
