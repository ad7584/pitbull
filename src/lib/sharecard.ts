// Share-card PNG generator — 1200x630 (X summary_large_image), drawn on a
// canvas so every card is downloadable and looks identical everywhere.
// Research-informed rules baked in: center-safe layout (>=80px margins),
// headline >=48px, QR on a WHITE rounded tile (never inverted — native
// camera apps fail on light-on-dark), ECC 'M', https link in the QR (a
// solana: URI dead-ends without a wallet installed), full address printed
// in 4-char groups with emphasized ends (what humans actually verify).

import QRCode from "qrcode";
import { APP_HOST, VAULT_KINDS } from "./protocol";
import { fmtSol } from "./format";
import type { Pen } from "./types";

export interface ShareCardInput {
  pen: Pen;
  worth: number;
  progress: number;
  /** the pen PDA — where donations land. */
  address: string;
}

const W = 1200;
const H = 630;
const M = 80; // safe margin

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** chunk a base58 address into 4-char groups. */
export function chunkAddress(addr: string): string[] {
  return addr.match(/.{1,4}/g) ?? [addr];
}

export async function generateShareCard({ pen, worth, progress, address }: ShareCardInput): Promise<string> {
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  // ---- background: near-black + aurora orbs ----
  ctx.fillStyle = "#0B0A0F";
  ctx.fillRect(0, 0, W, H);

  const orb = (x: number, y: number, r: number, color: string, alpha: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(11,10,15,0)");
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  };
  orb(180, 80, 460, "#FF4D8D", 0.22);
  orb(1050, 560, 480, "#8E67FF", 0.18);
  orb(760, -60, 380, "#B6FF3C", 0.1);

  // hairline border
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  roundRect(ctx, 24, 24, W - 48, H - 48, 36);
  ctx.stroke();

  // ---- header: wordmark + kind ----
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F5F3FF";
  ctx.font = "700 34px 'Clash Display', sans-serif";
  ctx.fillText("PIT·BULL", M, M + 26);
  ctx.fillStyle = "#FF4D8D";
  ctx.font = "600 24px 'JetBrains Mono', monospace";
  const kindLabel = VAULT_KINDS[pen.kind].codename.toUpperCase();
  ctx.fillText(`🐷 ${kindLabel}${pen.isCharity ? " · CHARITY" : ""}`, M + 210, M + 24);

  // ---- pen name + handle ----
  ctx.fillStyle = "#F5F3FF";
  ctx.font = "700 62px 'Clash Display', sans-serif";
  const name = pen.name.length > 22 ? pen.name.slice(0, 21) + "…" : pen.name;
  ctx.fillText(`“${name}”`, M, 216);
  ctx.fillStyle = "#9A93B0";
  ctx.font = "500 30px 'Inter', sans-serif";
  ctx.fillText(`@${pen.handle} is stacking a floor — fill it, don't dump it.`, M, 262);

  // ---- dual balance ----
  const statY = 316;
  ctx.fillStyle = "#9A93B0";
  ctx.font = "600 22px 'Inter', sans-serif";
  ctx.fillText("SAVED", M, statY);
  ctx.fillText("WORTH NOW", M + 300, statY);

  const numFont = "700 52px 'JetBrains Mono', monospace";
  const solFont = "500 24px 'Inter', sans-serif";
  const drawStat = (value: string, xPos: number, color: string) => {
    ctx.font = numFont;
    ctx.fillStyle = color;
    ctx.fillText(value, xPos, statY + 56);
    const w = ctx.measureText(value).width;
    ctx.font = solFont;
    ctx.fillStyle = "#6B6480";
    ctx.fillText("SOL", xPos + w + 12, statY + 56);
  };
  drawStat(fmtSol(pen.principal), M, "#F5F3FF");
  drawStat(fmtSol(worth), M + 300, "#B6FF3C");

  // ---- progress bar ----
  const barY = 420;
  const barW = 560;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, M, barY, barW, 18, 9);
  ctx.fill();
  const p = Math.max(0.02, Math.min(1, progress));
  const grad = ctx.createLinearGradient(M, 0, M + barW * p, 0);
  grad.addColorStop(0, "#FF4D8D");
  grad.addColorStop(1, "#B6FF3C");
  ctx.fillStyle = grad;
  roundRect(ctx, M, barY, barW * p, 18, 9);
  ctx.fill();
  ctx.fillStyle = "#9A93B0";
  ctx.font = "600 24px 'JetBrains Mono', monospace";
  ctx.fillText(`${Math.round(p * 100)}% to unlock`, M + barW + 20, barY + 18);

  // ---- donate address (full, chunked, ends emphasized) ----
  const addrY = 500;
  ctx.fillStyle = "#9A93B0";
  ctx.font = "600 20px 'Inter', sans-serif";
  ctx.fillText("DONATE TO THIS PEN (SOL or $ANSEM)", M, addrY);
  // one line, 4-char groups, first/last group emphasized (verification cue)
  const chunks = chunkAddress(address);
  ctx.font = "600 24px 'JetBrains Mono', monospace";
  let x = M;
  const addrLineY = addrY + 34;
  chunks.forEach((chunk, i) => {
    const isEdge = i === 0 || i === chunks.length - 1;
    ctx.fillStyle = isEdge ? "#B6FF3C" : "#C9C3DD";
    ctx.fillText(chunk, x, addrLineY);
    x += ctx.measureText(chunk).width + 8;
  });

  // ---- CTA ----
  ctx.fillStyle = "#FF4D8D";
  ctx.font = "700 26px 'Inter', sans-serif";
  ctx.fillText(`Fill it → ${APP_HOST}/pen/${pen.handle}`, M, 578);

  // ---- QR on a white tile (right side) ----
  const qrSize = 220;
  const tile = qrSize + 36;
  const tileX = W - M - tile + 20;
  const tileY = 300;
  ctx.save();
  ctx.shadowColor = "rgba(255,77,141,0.45)";
  ctx.shadowBlur = 44;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, tileX, tileY, tile, tile, 28);
  ctx.fill();
  ctx.restore();

  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, `https://${APP_HOST}/pen/${pen.handle}`, {
    errorCorrectionLevel: "M",
    margin: 2, // quiet zone
    width: qrSize,
    color: { dark: "#0B0A0F", light: "#FFFFFF" },
  });
  ctx.drawImage(qrCanvas, tileX + 18, tileY + 18, qrSize, qrSize);
  ctx.fillStyle = "#6B6480";
  ctx.font = "600 18px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("scan to fill", tileX + tile / 2, tileY + tile + 30);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
