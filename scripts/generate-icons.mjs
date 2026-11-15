// One-off utility: renders the PWA icon set from a single vector source.
// Run with: node scripts/generate-icons.mjs   (requires sharp installed)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

const mark = (scale) => `
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <circle cx="256" cy="256" r="118" fill="none" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="26" />
    <circle cx="256" cy="256" r="56" fill="#E85D4A" />
    <circle cx="256" cy="136" r="25" fill="#FFFFFF" fill-opacity="0.92" />
    <circle cx="374" cy="256" r="25" fill="#FFFFFF" fill-opacity="0.5" />
    <circle cx="256" cy="374" r="25" fill="#FFFFFF" fill-opacity="0.5" />
  </g>
`;

const roundedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0F294A" />
  ${mark(1)}
</svg>`;

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0F294A" />
  ${mark(0.72)}
</svg>`;

await mkdir(OUT_DIR, { recursive: true });

await writeFile(path.join(OUT_DIR, "icon.svg"), roundedSvg, "utf8");

const jobs = [
  { file: "icon-192.png", size: 192, svg: roundedSvg },
  { file: "icon-512.png", size: 512, svg: roundedSvg },
  { file: "icon-maskable-512.png", size: 512, svg: maskableSvg },
  { file: "apple-touch-icon.png", size: 180, svg: maskableSvg },
];

for (const job of jobs) {
  await sharp(Buffer.from(job.svg))
    .resize(job.size, job.size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, job.file));
  console.log(`generated ${job.file}`);
}
