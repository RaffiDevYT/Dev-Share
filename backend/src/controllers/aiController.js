// AI Assistant Controller for Dev-Share
// Supports optional Gemini API integration + Built-in Smart Code Analysis Engine

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Helper to call Gemini if API Key is available
async function callGeminiIfAvailable(prompt) {
  if (!GEMINI_API_KEY) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini API call failed, falling back to local engine:', err.message);
    return null;
  }
}

// 1. AI Code Explainer
export const explainCode = async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Konten kode wajib disertakan' });
  }

  const prompt = `Anda adalah asisten programmer senior. Jelaskan kode ${language || 'pemrograman'} berikut secara singkat, padat, dan terstruktur dalam Bahasa Indonesia:
1. Ringkasan Tujuan Kode
2. Cara Kerja / Alur Eksekusi
3. Kompleksitas Waktu & Memori (jika relevan)
4. Potensi Peningkatan / Edge Cases

Kode:
\`\`\`${language || ''}
${code}
\`\`\``;

  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    return res.status(200).json({ explanation: geminiResult, source: 'ai-model' });
  }

  // Local Smart Heuristic Fallback
  const lines = code.trim().split('\n');
  const lineCount = lines.length;
  const hasLoops = /\b(for|while|forEach|map|filter|reduce)\b/i.test(code);
  const hasAsync = /\b(async|await|Promise|fetch|axios|setTimeout)\b/i.test(code);
  const hasConditional = /\b(if|else|switch|case|\?)\b/i.test(code);
  const hasFunctions = /\b(function|def|fn|const\s+\w+\s*=|class|public\s+static)\b/i.test(code);

  const keyElements = [];
  if (hasFunctions) keyElements.push('Definisi fungsi/metode modular');
  if (hasAsync) keyElements.push('Operasi Asynchronous / Event-driven');
  if (hasLoops) keyElements.push('Iterasi / Perulangan koleksi data');
  if (hasConditional) keyElements.push('Logika percabangan kondisional');

  const fallbackExplanation = `### 📋 Analisis & Penjelasan Kode (${(language || 'Kode').toUpperCase()})

#### 1. Ringkasan Singkat
Potongan kode ini terdiri dari **${lineCount} baris** kode dan dirancang untuk mengeksekusi operasi pemrograman yang terstruktur.

#### 2. Komponen Utama yang Ditemukan:
${keyElements.length > 0 ? keyElements.map(e => `- **${e}**`).join('\n') : '- Blok eksekusi instruksi sekuensial'}

#### 3. Alur Kerja:
1. Menginisialisasi variabel dan dependensi yang diperlukan.
2. Memproses input data melalui transformasi logika utama.
3. Menghasilkan output nilai atau efek samping (side effects) yang diharapkan.

#### 4. Estimasi Kompleksitas:
- **Time Complexity:** ${hasLoops ? 'O(N) hingga O(N log N) tergantung ukuran input iterasi' : 'O(1) - Konstanta sekuensial'}
- **Space Complexity:** O(1) atau O(N) sesuai struktur data internal yang dialokasikan.

> 💡 *Tips:* Pastikan untuk selalu menambahkan penanganan kesalahan (*error handling/try-catch*) dan validasi nilai null/undefined pada input pengguna.`;

  return res.status(200).json({ explanation: fallbackExplanation, source: 'smart-engine' });
};

// 2. AI Code Optimizer & Bug Fixer
export const optimizeCode = async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Konten kode wajib disertakan' });
  }

  const prompt = `Anda adalah ahli code refactoring dan optimasi. Analisis kode ${language || ''} berikut. Berikan saran optimasi performa/readability dan berikan versi kode yang sudah di-refactor/diperbaiki dalam Bahasa Indonesia:

Kode Asli:
\`\`\`${language || ''}
${code}
\`\`\``;

  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    return res.status(200).json({ result: geminiResult, source: 'ai-model' });
  }

  // Local Heuristic Optimizer
  let optimizedCode = code.trim();
  const suggestions = [
    'Menstandarisasi deklarasi variabel ke bentuk modern (const/let).',
    'Menghindari alokasi variabel ganda yang tidak diperlukan.',
    'Meningkatkan konsistensi penamaan dan format indentasi.'
  ];

  // Simple JS/TS transforms if applicable
  if (/(var\s+)/.test(optimizedCode)) {
    optimizedCode = optimizedCode.replace(/\bvar\b/g, 'const');
    suggestions.push('Mengganti penggunaan `var` lama menjadi `const` untuk scope safety.');
  }

  const output = `### ⚡ Hasil Analisis Optimasi & Refactor

#### 🔍 Rekomendasi Peningkatan:
${suggestions.map(s => `- ${s}`).join('\n')}

#### 🛠️ Kode Versi Refactor:
\`\`\`${language || 'javascript'}
${optimizedCode}
\`\`\`

> 🚀 *Performa:* Kode yang lebih bersih membantu compiler/engine JavaScript melakukan optimasi JIT secara lebih efisien.`;

  return res.status(200).json({ result: output, optimizedCode, source: 'smart-engine' });
};

// 3. AI Code Translator
export const translateCode = async (req, res) => {
  const { code, fromLanguage, toLanguage } = req.body;

  if (!code || !toLanguage) {
    return res.status(400).json({ message: 'Konten kode dan bahasa tujuan wajib diisi' });
  }

  const prompt = `Terjemahkan kode dari bahasa ${fromLanguage || 'auto'} ke bahasa ${toLanguage}. Hanya berikan blok kode hasil terjemahan lengkap yang siap dijalankan beserta catatan singkat jika ada perbedaan library.

Kode:
\`\`\`${fromLanguage || ''}
${code}
\`\`\``;

  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    return res.status(200).json({ translatedCode: geminiResult, source: 'ai-model' });
  }

  // Fallback Translator templates
  const lang = toLanguage.toLowerCase();
  let translated = '';

  if (lang === 'python') {
    translated = `# Dikonversi ke Python
import json

# Implementasi logika
${code.replace(/const |let |var /g, '').replace(/;/g, '').replace(/console\.log/g, 'print')}
`;
  } else if (lang === 'typescript' || lang === 'javascript') {
    translated = `// Dikonversi ke ${toLanguage.toUpperCase()}
${code}
`;
  } else {
    translated = `// Hasil Konversi ke ${toLanguage.toUpperCase()}
// Silakan sesuaikan tipe data dan standar sintaksis ${toLanguage}

${code}
`;
  }

  return res.status(200).json({ translatedCode: translated, source: 'smart-engine' });
};

// 4. AI Auto-Generate Title, Tags & Description for Form
export const autoGenerateMetadata = async (req, res) => {
  const { code } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ message: 'Konten kode tidak boleh kosong' });
  }

  const prompt = `Analisis potongan kode berikut dan kembalikan JSON murni TANPA markdown formatting dengan format:
{
  "title": "Judul deskriptif singkat dalam Bahasa Indonesia (maksimal 7 kata)",
  "language": "javascript|typescript|python|php|html|css|sql|bash|c|cpp|csharp|java|go|rust|json",
  "description": "Deskripsi 1-2 kalimat fungsi kode",
  "tags": "tag1, tag2, tag3"
}

Kode:
${code.slice(0, 2000)}`;

  const geminiResult = await callGeminiIfAvailable(prompt);
  if (geminiResult) {
    try {
      const cleanJson = geminiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.status(200).json(parsed);
    } catch {
      // ignore json parse error and continue to fallback
    }
  }

  // Local Heuristic Detection
  let detectedLang = 'javascript';
  let title = 'Fungsi Helper Utility';
  let description = 'Potongan kode utility untuk pemrosesan logika data.';
  let tags = 'utility, helper, logic';

  const lower = code.toLowerCase();

  if (lower.includes('def ') || lower.includes('import ') && lower.includes(':')) {
    detectedLang = 'python';
    title = 'Python Script Data Processing';
    tags = 'python, backend, script';
  } else if (lower.includes('select ') && lower.includes('from ') || lower.includes('create table')) {
    detectedLang = 'sql';
    title = 'Query Database SQL';
    tags = 'sql, database, query';
  } else if (lower.includes('<?php')) {
    detectedLang = 'php';
    title = 'PHP Handler & Controller';
    tags = 'php, backend, web';
  } else if (lower.includes('interface ') || lower.includes(': string') || lower.includes(': number')) {
    detectedLang = 'typescript';
    title = 'TypeScript Module & Type Handler';
    tags = 'typescript, frontend, typed';
  } else if (lower.includes('<div') || lower.includes('<!doctype') || lower.includes('<html>')) {
    detectedLang = 'html';
    title = 'Komponen UI Web Markup';
    tags = 'html, frontend, ui';
  } else if (lower.includes('{') && lower.includes('margin:') || lower.includes('display:')) {
    detectedLang = 'css';
    title = 'CSS Style & Responsive Layout';
    tags = 'css, design, styling';
  } else if (lower.includes('fetch(') || lower.includes('async') || lower.includes('axios')) {
    detectedLang = 'javascript';
    title = 'API Fetch & Async Request Handler';
    tags = 'javascript, api, async, network';
  }

  // Derive first line or function name for title if possible
  const funcMatch = code.match(/(?:function|def|class|const|let)\s+([a-zA-Z0-9_$]+)/);
  if (funcMatch && funcMatch[1]) {
    const name = funcMatch[1];
    title = `${name.charAt(0).toUpperCase() + name.slice(1)} Function`;
    description = `Implementasi fungsi ${name} untuk penanganan logika komputasi.`;
  }

  return res.status(200).json({
    title,
    language: detectedLang,
    description,
    tags
  });
};
