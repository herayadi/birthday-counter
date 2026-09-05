import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

const outputDir = 'render';
const rawDir = `${outputDir}/raw`;
mkdirSync(rawDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 720, height: 1280 },
  recordVideo: {
    dir: rawDir,
    size: { width: 720, height: 1280 }
  }
});

const page = await context.newPage();
await page.goto('http://127.0.0.1:4173', { waitUntil: 'load' });

// The target date is already reached when this one-off renderer runs.
// The page intentionally shows its 5-second fallback countdown first.
await page.waitForSelector('.giftbox', { state: 'visible', timeout: 15000 });
await page.waitForTimeout(750);
await page.click('.giftbox');

// Capture the full birthday greeting sequence through all message scenes.
await page.waitForTimeout(67000);

const video = page.video();
await page.close();
const webmPath = await video.path();
await context.close();
await browser.close();

execFileSync('ffmpeg', [
  '-y',
  '-i', webmPath,
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '28',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  `${outputDir}/birthday-counter.mp4`
], { stdio: 'inherit' });

rmSync(rawDir, { recursive: true, force: true });
