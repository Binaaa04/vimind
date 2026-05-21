import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

// Daftar path default untuk browser di Linux
const possiblePaths = [
  '/usr/bin/brave-browser',
  '/usr/bin/brave',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/firefox'
];

let executablePath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    executablePath = p;
    console.log(`Using browser found at: ${p}`);
    break;
  }
}

if (!executablePath) {
  console.error("❌ Tidak menemukan browser Google Chrome, Brave, Chromium, atau Firefox di path standard Linux.");
  console.error("Silakan edit file ini dan masukkan path browser-mu secara manual pada variabel 'executablePath'.");
  process.exit(1);
}

const url = process.argv[2] || 'http://localhost:5173';
const outputName = process.argv[3] || 'mobile_screenshot.png';

async function run() {
  console.log(`🚀 Membuka browser untuk mengambil screenshot dari: ${url}`);
  
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport ke ukuran HP standard (iPhone X/12/13/14)
    await page.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    console.log("Navigasi ke halaman...");
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Tunggu tambahan waktu agar render/animasi selesai
    await new Promise(resolve => setTimeout(resolve, 2000));

    const outputPath = path.resolve(outputName);
    await page.screenshot({ path: outputPath, fullPage: false });
    
    console.log(`✅ Screenshot berhasil disimpan di: ${outputPath}`);
  } catch (error) {
    console.error("❌ Gagal mengambil screenshot:", error);
  } finally {
    await browser.close();
  }
}

run();
