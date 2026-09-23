import { mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('../apps/web/node_modules/sharp');

async function generateKtpSvg(): Promise<string> {
  return `<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EBF4F6"/>
        <stop offset="50%" stop-color="#D7E8ED"/>
        <stop offset="100%" stop-color="#C5DCE3"/>
      </linearGradient>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#24527a"/>
        <stop offset="100%" stop-color="#1b3b5a"/>
      </linearGradient>
    </defs>
    <!-- Card Frame -->
    <rect width="800" height="500" rx="24" fill="url(#bg)" stroke="#88B0C0" stroke-width="3"/>
    
    <!-- Guilloche Pattern Mock -->
    <rect x="16" y="16" width="768" height="468" rx="16" fill="none" stroke="#B8D3DD" stroke-width="1.5" stroke-dasharray="4 4"/>
    
    <!-- Header -->
    <rect x="30" y="30" width="740" height="60" rx="8" fill="url(#headerGrad)"/>
    <text x="400" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">PROVINSI SUMATERA SELATAN</text>
    <text x="400" y="76" font-family="'Helvetica Neue', Arial, sans-serif" font-size="15" font-weight="bold" fill="#E0F0F8" text-anchor="middle" letter-spacing="1.5">KABUPATEN PENUKAL ABAB LEMATANG ILIR</text>
    
    <!-- NIK -->
    <text x="50" y="130" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="bold" fill="#1b3b5a" letter-spacing="2">NIK</text>
    <text x="210" y="130" font-family="'Courier New', monospace" font-size="24" font-weight="bold" fill="#112233" letter-spacing="3">: 1607012345678901</text>
    
    <!-- Fields -->
    <g font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" fill="#223344" font-weight="600">
      <text x="50" y="175">Nama</text>
      <text x="210" y="175">: KUKERTA DESA BETUNG</text>
      
      <text x="50" y="210">Tempat/Tgl Lahir</text>
      <text x="210" y="210">: PALI, 15-01-2000</text>
      
      <text x="50" y="245">Jenis Kelamin</text>
      <text x="210" y="245">: PEREMPUAN</text>
      <text x="360" y="245">Gol. Darah : O</text>
      
      <text x="50" y="280">Alamat</text>
      <text x="210" y="280">: DESA BETUNG</text>
      
      <text x="80" y="310">RT/RW</text>
      <text x="210" y="310">: 003 / 001</text>
      
      <text x="80" y="340">Kel/Desa</text>
      <text x="210" y="340">: BETUNG</text>
      
      <text x="80" y="370">Kecamatan</text>
      <text x="210" y="370">: ABAB</text>
      
      <text x="50" y="405">Agama</text>
      <text x="210" y="405">: ISLAM</text>
      
      <text x="50" y="440">Status Perkawinan</text>
      <text x="210" y="440">: BELUM KAWIN</text>
      
      <text x="50" y="470">Kewarganegaraan</text>
      <text x="210" y="470">: WNI</text>
    </g>
    
    <!-- Photo Box -->
    <rect x="580" y="120" width="180" height="230" rx="10" fill="#2D5F8B" stroke="#1b3b5a" stroke-width="2"/>
    <!-- Photo silhouette -->
    <circle cx="670" cy="190" r="42" fill="#E8EDF2"/>
    <path d="M 615 290 Q 670 235 725 290 Z" fill="#E8EDF2"/>
    <text x="670" y="330" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">PAS FOTO</text>
    
    <!-- Signature Box -->
    <rect x="580" y="365" width="180" height="60" rx="6" fill="#F8FAFC" stroke="#C5DCE3" stroke-width="1.5"/>
    <path d="M 600 405 Q 630 380 650 400 T 700 390 T 740 405" fill="none" stroke="#1b3b5a" stroke-width="2"/>
    <text x="670" y="445" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" fill="#64748B" text-anchor="middle">Tanda Tangan</text>
    
    <!-- Watermark Stamp UAT -->
    <g transform="rotate(-18 400 260)">
      <rect x="200" y="220" width="400" height="55" rx="8" fill="#DC2626" fill-opacity="0.18" stroke="#DC2626" stroke-width="3" stroke-dasharray="8 4"/>
      <text x="400" y="255" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="900" fill="#B91C1C" text-anchor="middle" letter-spacing="3">SPESIMEN UAT DAILY DOSE</text>
    </g>
  </svg>`;
}

async function generateSelfieSvg(): Promise<string> {
  return `<svg width="600" height="800" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="studioBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF8F5"/>
        <stop offset="60%" stop-color="#EFE9E0"/>
        <stop offset="100%" stop-color="#DCD4C7"/>
      </linearGradient>
    </defs>
    <!-- Background Frame -->
    <rect width="600" height="800" fill="url(#studioBg)"/>
    
    <!-- Studio Ambient Circles -->
    <circle cx="300" cy="240" r="180" fill="#E8DFD1" opacity="0.6"/>
    
    <!-- Person Head & Shoulders -->
    <!-- Head -->
    <ellipse cx="300" cy="220" rx="75" ry="95" fill="#CBB69D"/>
    <!-- Hair / Hijab shape -->
    <path d="M 210 220 C 210 110, 390 110, 390 220 C 390 270, 360 330, 300 330 C 240 330, 210 270, 210 220 Z" fill="#3D4B3E"/>
    <!-- Face Inner -->
    <ellipse cx="300" cy="235" rx="55" ry="65" fill="#E5CDB3"/>
    <ellipse cx="280" cy="225" rx="5" ry="3" fill="#2E2319"/>
    <ellipse cx="320" cy="225" rx="5" ry="3" fill="#2E2319"/>
    <path d="M 290 255 Q 300 265 310 255" fill="none" stroke="#8A5A44" stroke-width="2.5" stroke-linecap="round"/>
    
    <!-- Torso / Body -->
    <path d="M 160 520 C 170 370, 430 370, 440 520 L 480 800 L 120 800 Z" fill="#2D3B2E"/>
    
    <!-- Hand holding KTP card in front of chest -->
    <g transform="translate(180, 460)">
      <!-- Mini KTP Card in Hand -->
      <rect x="0" y="0" width="240" height="150" rx="10" fill="#D7E8ED" stroke="#24527A" stroke-width="2" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.15))"/>
      <rect x="10" y="10" width="220" height="22" rx="4" fill="#24527A"/>
      <text x="120" y="25" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8" font-weight="bold" fill="#FFFFFF" text-anchor="middle">KARTU TANDA PENDUDUK</text>
      
      <!-- Mini photo on card -->
      <rect x="165" y="42" width="60" height="75" rx="4" fill="#2D5F8B"/>
      <circle cx="195" cy="65" r="14" fill="#E8EDF2"/>
      <path d="M 175 105 Q 195 85 215 105 Z" fill="#E8EDF2"/>
      
      <!-- Mini lines on card -->
      <line x1="15" y1="50" x2="140" y2="50" stroke="#1B3B5A" stroke-width="3"/>
      <line x1="15" y1="65" x2="120" y2="65" stroke="#475569" stroke-width="2"/>
      <line x1="15" y1="80" x2="130" y2="80" stroke="#475569" stroke-width="2"/>
      <line x1="15" y1="95" x2="100" y2="95" stroke="#475569" stroke-width="2"/>
      <line x1="15" y1="110" x2="110" y2="110" stroke="#475569" stroke-width="2"/>
      
      <!-- Fingers holding the card -->
      <ellipse cx="0" cy="60" rx="14" ry="8" fill="#E5CDB3" transform="rotate(-15 0 60)"/>
      <ellipse cx="0" cy="80" rx="14" ry="8" fill="#E5CDB3" transform="rotate(-15 0 80)"/>
      <ellipse cx="240" cy="60" rx="14" ry="8" fill="#E5CDB3" transform="rotate(15 240 60)"/>
    </g>
    
    <!-- Top & Bottom Header Badges -->
    <rect x="40" y="40" width="520" height="44" rx="22" fill="#2D3B2E" opacity="0.9"/>
    <text x="300" y="68" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">SELFIE MEMEGANG KTP · VERIFIKASI IDENTITAS</text>
    
    <!-- Watermark Stamp UAT -->
    <g transform="rotate(-15 300 400)">
      <rect x="100" y="365" width="400" height="55" rx="8" fill="#DC2626" fill-opacity="0.22" stroke="#DC2626" stroke-width="3" stroke-dasharray="8 4"/>
      <text x="300" y="400" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="900" fill="#B91C1C" text-anchor="middle" letter-spacing="3">SPESIMEN UAT DAILY DOSE</text>
    </g>
  </svg>`;
}

async function main() {
  const userId = 'df55f16c-374c-4b1c-a621-317c2e560fd6';
  const targetDir = resolve(process.cwd(), 'apps/api/.local-data/private/identity-documents', userId);
  
  await mkdir(targetDir, { recursive: true });
  console.log(`Directory ensured: ${targetDir}`);
  
  // 1. Generate KTP JPEG
  const ktpSvg = await generateKtpSvg();
  const ktpJpegBuffer = await sharp(Buffer.from(ktpSvg))
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();
  const ktpPath = resolve(targetDir, 'ktp-front.jpg');
  await writeFile(ktpPath, ktpJpegBuffer);
  const ktpStat = await stat(ktpPath);
  console.log(`KTP specimen written to: ${ktpPath} (${ktpStat.size} bytes)`);
  
  // 2. Generate Selfie JPEG
  const selfieSvg = await generateSelfieSvg();
  const selfieJpegBuffer = await sharp(Buffer.from(selfieSvg))
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();
  const selfiePath = resolve(targetDir, 'selfie.jpg');
  await writeFile(selfiePath, selfieJpegBuffer);
  const selfieStat = await stat(selfiePath);
  console.log(`Selfie specimen written to: ${selfiePath} (${selfieStat.size} bytes)`);
  
  console.log('SUCCESS: Both realistic KYC specimens generated successfully.');
}

main().catch((err) => {
  console.error('FAILED to generate specimens:', err);
  process.exit(1);
});
