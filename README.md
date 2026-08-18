# ⚡ Dev-Share

<div align="center">

![Dev-Share Banner](https://img.shields.io/badge/Dev--Share-Modern_Code_Snippet_Platform-10b981?style=for-the-badge&logo=code)

**Platform berbagi, kolaborasi, menjalankan cuplikan kode (code snippet), berdiskusi di forum komunitas, dan showcase portofolio developer modern.**

[![React](https://img.shields.io/badge/React-19.x-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

<br />

<img src="./docs/screenshots/hero_preview.jpg" alt="Dev-Share Main Interface" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />

<br /><br />

[Tampilan & Fitur](#-tampilan-antarmuka--preview-fitur) • [Fitur Utama](#-fitur-utama) • [Tech Stack](#-tech-stack) • [Prasyarat](#-prasyarat-sistem) • [Panduan Instalasi](#-panduan-instalasi-lengkap) • [Struktur Proyek](#-struktur-folder) • [Dokumentasi API](#-dokumentasi-endpoint-api)

</div>

---

## 📸 Tampilan Antarmuka & Preview Fitur

### 1. 💻 Code Snippet Explorer & Live In-Browser Runner
Tampilan editor kode berbasis Obsidian Dark Theme dengan PrismJS Syntax Highlighting, tag kategori, star bookmark, copy button, dan tombol *Run* untuk menjalankan kode JavaScript/TypeScript secara langsung di browser lengkap dengan console log output.

<div align="center">
  <img src="./docs/screenshots/hero_preview.jpg" alt="Code Snippet Explorer & Runner" width="90%" style="border-radius: 10px;" />
</div>

<br />

### 2. 💬 Forum Diskusi & Chat Komunitas Developer
Pusat diskusi komunitas dengan filter kategori berwarna (*Tanya Jawab & Debug*, *Tips & Best Practice*, *Showcase Project*, *Diskusi Santai*), pencarian topik, pembuatan thread baru, dan sistem balasan langsung (*nested conversation replies*).

<div align="center">
  <img src="./docs/screenshots/forum_preview.jpg" alt="Forum Diskusi & Chat Komunitas" width="90%" style="border-radius: 10px;" />
</div>

<br />

### 3. 👤 Profil & Portofolio Developer
Halaman portofolio developer yang menampilkan avatar gradien aktif, bio & sosial link (GitHub, Website, Domisili), badge keahlian *Tech Stack*, grafik distribusi persentase bahasa pemrograman, serta galeri koleksi snippet publik.

<div align="center">
  <img src="./docs/screenshots/profile_preview.jpg" alt="Profil Developer & Tech Stack Stats" width="90%" style="border-radius: 10px;" />
</div>

---

## 🌟 Fitur Utama

- 💻 **Snippet Explorer & Syntax Highlighting**: Syntax highlighting canggih berbasis PrismJS untuk lebih dari 15+ bahasa pemrograman (TypeScript, JavaScript, Python, PHP, Go, Rust, Java, C++, SQL, Bash, HTML, CSS, dll.).
- 💬 **Forum Diskusi & Chat Komunitas**: Ruang diskusi terdedikasi dengan kategori warna (*Tanya Jawab & Debug*, *Tips & Trik*, *Showcase Project*, *Diskusi Santai*) dan sistem *thread replies*.
- 🚀 **In-Browser Safe Code Runner**: Eksekusi langsung kode JavaScript & TypeScript di browser dengan terminal log & execution time calculator.
- 🤖 **AI Code Assistant**: Integrasi AI untuk menjelaskan kode baris demi baris, menemukan bug & saran optimasi performa, serta menerjemahkan kode antar bahasa pemrograman.
- 📸 **Export to Image (PNG)**: Konversi cuplikan kode menjadi kartu gambar beresolusi tinggi bergaya *Ray.so / Carbon* untuk dibagikan ke media sosial.
- 📦 **Embed & Raw URL**: Dapatkan link mentah (Raw URL), Badge Markdown untuk README GitHub, dan tag `<iframe>` untuk blog.
- 👤 **Developer Profile & Portfolio**: Halaman profil interaktif dengan skill badges, distribusi statistik bahasa coding, serta metrik stars & snippet.
- ⌨️ **Command Palette (`Ctrl + K`)**: Pencarian instan dan navigasi cepat ke seluruh fitur platform dengan keyboard shortcut.
- 🛡️ **JWT Authentication & Security**: Sistem otentikasi berbasis JWT token dengan hashing password bcrypt.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM v7
- **Styling**: Vanilla CSS (Cyber Obsidian & Emerald Theme with Glassmorphism)
- **Syntax Highlighting**: PrismJS
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Database ORM**: Prisma ORM
- **Database**: MySQL / MariaDB (XAMPP, Laragon, atau Standalone MySQL)
- **Security**: JWT (`jsonwebtoken`) & `bcryptjs`
- **CORS**: `cors` middleware

---

## 📋 Prasyarat Sistem

Sebelum memulai instalasi, pastikan software berikut telah terpasang di komputer Anda:
1. **Node.js** (Versi 18.x atau lebih baru) & **npm**  
   Unduh di: [nodejs.org](https://nodejs.org)
2. **Database MySQL / MariaDB** (Dapat menggunakan **Laragon**, **XAMPP**, atau MySQL Server standalone)
3. **Git**  
   Unduh di: [git-scm.com](https://git-scm.com)

---

## 🚀 Panduan Instalasi Lengkap

### 1. Clone Repository
```bash
git clone https://github.com/RaffiDevYT/Dev-Share.git
cd Dev-Share
```

---

### 2. Setup Database & Backend

1. **Buka terminal dan masuk ke folder `backend`**:
   ```bash
   cd backend
   ```

2. **Install dependensi backend**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (`.env`)**:
   Salin file contoh konfigurasi `.env.example` menjadi `.env`:
   - **Di Windows (PowerShell / CMD)**:
     ```bash
     copy .env.example .env
     ```
   - **Di Linux / macOS**:
     ```bash
     cp .env.example .env
     ```

   Sesuaikan isi file `backend/.env` jika konfigurasi MySQL Anda berbeda:
   ```env
   # Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
   DATABASE_URL="mysql://root:@localhost:3306/dev_share"
   JWT_SECRET="super-secret-dev-share-key-2026"
   PORT=5000

   # Opsional (Jika ingin mengaktifkan AI Assistant)
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Sinkronisasi Database dengan Prisma**:
   Pastikan MySQL sudah berjalan (misal klik *Start All* di Laragon / XAMPP), lalu jalankan:
   ```bash
   npx prisma db push
   ```
   *(Perintah ini akan membuat database `dev_share` beserta seluruh tabel yang dibutuhkan secara otomatis).*

5. **Jalankan Server Backend**:
   ```bash
   npm run dev
   ```
   Server backend akan aktif di: `http://localhost:5000`

---

### 3. Setup Frontend

1. **Buka tab terminal baru dan masuk ke folder `frontend`**:
   ```bash
   cd frontend
   ```

2. **Install dependensi frontend**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (`.env`)**:
   Salin file `.env.example` menjadi `.env`:
   - **Di Windows (PowerShell / CMD)**:
     ```bash
     copy .env.example .env
     ```
   - **Di Linux / macOS**:
     ```bash
     cp .env.example .env
     ```

   Pastikan isi file `frontend/.env`:
   ```env
   VITE_API_BASE_URL="http://localhost:5000"
   VITE_API_URL="http://localhost:5000/api"
   ```

4. **Jalankan Aplikasi Frontend**:
   ```bash
   npm run dev
   ```
   Buka browser Anda di: `http://localhost:5173`

---

## 📂 Struktur Folder

```text
dev-share/
├── docs/
│   └── screenshots/               # Screenshot & Gambar Preview Fitur
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Skema database MySQL Prisma
│   ├── src/
│   │   ├── config/                # Konfigurasi database & Prisma client
│   │   ├── controllers/           # Logika Controller (Auth, Snippet, Forum, Profile, AI)
│   │   ├── middleware/            # JWT Auth middleware
│   │   ├── routes/                # Endpoint Express Router
│   │   └── index.js               # Entry point Express API Server
│   ├── .env.example               # Template environment backend
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Komponen (CodeBlock, Footer, CommandPalette, Modals)
│   │   ├── config/                # Konfigurasi URL API
│   │   ├── pages/                 # Halaman aplikasi (PublicSnippets, Forum, Dashboard, Profile, etc.)
│   │   ├── App.tsx                # Main Routing & Layout
│   │   ├── index.css              # Design System & Styling
│   │   └── main.tsx               # React DOM root
│   ├── .env.example               # Template environment frontend
│   └── package.json
│
├── .gitignore                     # Git ignore rules (mencegah leak file .env & node_modules)
├── LICENSE                        # Lisensi Resmi MIT
└── README.md                      # Dokumentasi & Panduan Proyek
```

---

## 📡 Dokumentasi Endpoint API

| Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Mendaftarkan akun baru | ❌ |
| `POST` | `/api/auth/login` | Masuk log & mendapatkan JWT Token | ❌ |
| `GET` | `/api/snippets` | Mengambil semua snippet publik / filter pencarian | ❌ |
| `GET` | `/api/snippets/:id` | Detail satu snippet | ❌ |
| `POST` | `/api/snippets` | Membuat snippet baru | ✅ |
| `PUT` | `/api/snippets/:id` | Memperbarui snippet milik pengguna | ✅ |
| `DELETE` | `/api/snippets/:id` | Menghapus snippet milik pengguna | ✅ |
| `POST` | `/api/snippets/:id/bookmark` | Star / Unstar bookmark snippet | ✅ |
| `POST` | `/api/snippets/:id/fork` | Fork snippet orang lain ke dashboard | ✅ |
| `GET` | `/api/snippets/:id/raw` | Output text mentah kode (Raw Code) | ❌ |
| `GET` | `/api/forum` | Daftar seluruh topik forum diskusi | ❌ |
| `GET` | `/api/forum/:id` | Detail topik forum beserta semua balasan | ❌ |
| `POST` | `/api/forum` | Membuat topik diskusi baru | ✅ |
| `POST` | `/api/forum/:id/reply` | Membalas topik diskusi | ✅ |
| `DELETE` | `/api/forum/:id` | Menghapus topik diskusi | ✅ |
| `GET` | `/api/users/:username` | Profil publik developer & statistik | ❌ |
| `PUT` | `/api/users/profile/me` | Memperbarui bio, link, & skills profil | ✅ |
| `POST` | `/api/ai/explain` | Penjelasan kode dengan AI | ❌ |

---

## 👨‍💻 Developer & Attribusi

Dibuat dengan dedikasi untuk komunitas developer oleh **Rafi Athallah ([@RaffiDevYT](https://github.com/RaffiDevYT))**.

- **GitHub**: [@RaffiDevYT](https://github.com/RaffiDevYT)
- **Repository**: [https://github.com/RaffiDevYT/Dev-Share](https://github.com/RaffiDevYT/Dev-Share)

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **[MIT License](LICENSE)**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan kode ini untuk tujuan pembelajaran maupun komersial dengan tetap mencantumkan atribusi hak cipta asli.
