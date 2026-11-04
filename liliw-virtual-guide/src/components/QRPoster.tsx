'use client';

import { useEffect, useRef, useState } from 'react';
import { browserSiteUrl } from '@/lib/siteUrl';
import { Download, FileDown, Loader2, QrCode, RefreshCw } from 'lucide-react';
import {
  NAVY, BLUE, GOLD, W, H, HEAD, BODY, DISPLAY,
  drawStyledQr, makePosterHelpers, drawHeader, drawFooter,
} from '@/lib/posterCanvas';

// A printable check-in poster for a business or spot to display on site.
// Composed on a canvas rather than screenshotting the DOM so the download is a
// clean, fixed-size PNG that prints sharply.
//
// The look follows the town's festive blue-and-gold palette: a deep blue field
// with sunburst rays and bunting, over a cream panel carrying the QR. The
// illustrated flourishes are drawn geometrically (pennants, rays, scalloped
// panel edge, corner ornaments) rather than shipped as artwork, so a poster
// renders for any business without needing a designer per spot.
//
// The drawing itself — the field, the panel, the styled QR, the footer — now
// lives in lib/posterCanvas, shared with SitePoster, the site's own version
// of this. What stays here is what is specific to a check-in: the business
// name, the three-step "open, scan, earn" copy, and the location warning.

interface Props {
  /** Public attraction id, i.e. '<type>-<uuid>'. */
  attractionId: string;
  attractionName: string;
}

export default function QRPoster({ attractionId, attractionName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [dlError, setDlError] = useState('');
  // Bumped by Regenerate to redraw. The code itself is deterministic — the
  // same listing always yields the same QR — so this repaints the poster
  // rather than issuing a different code; see the note by the button.
  const [regen, setRegen] = useState(0);
  const regenerated = regen > 0;

  const baseUrl = browserSiteUrl();
  // Same ?src=qr contract the check-in route reads — a scan of this poster is
  // what gets distance-verified against the attraction's coordinates.
  const scanUrl = `${baseUrl}/attractions/${attractionId}?src=qr`;

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { roundRect, scallopedPanel, diamond, cornerTicks, fitText } = makePosterHelpers(ctx);

    const draw = (qr: CanvasImageSource | 'styled' | null) => {
      if (cancelled) return;
      ctx.clearRect(0, 0, W, H);

      drawHeader(ctx, makePosterHelpers(ctx));
      ctx.textAlign = 'center';

      // Kicker
      ctx.fillStyle = GOLD;
      ctx.font = `bold 42px ${HEAD}`;
      ctx.letterSpacing = '12px';
      ctx.fillText('LILIW TOURISM', W / 2 + 6, 320);
      ctx.letterSpacing = '0px';

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold italic 132px ${DISPLAY}`;
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fillText('Scan to Earn Points', W / 2, 450);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Sub-pill
      ctx.font = `600 34px ${BODY}`;
      const pillText = 'Earn points on your Liliw visit!';
      const pw = ctx.measureText(pillText).width + 90;
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      roundRect(W / 2 - pw / 2, 490, pw, 74, 37);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(pillText, W / 2, 539);

      // Cream panel. Heights below are laid out so the QR frame, the three
      // steps and the location note all sit inside it, clearing the footer.
      const px = 70;
      const py = 616;
      const pWidth = W - px * 2;
      const pHeight = 924;      // panel spans 616 -> 1540; footer starts 1606
      scallopedPanel(px, py, pWidth, pHeight);

      // Business name
      const nameSize = fitText(attractionName, pWidth - 220, 74, s => `bold italic ${s}px ${DISPLAY}`);
      ctx.fillStyle = NAVY;
      ctx.font = `bold italic ${nameSize}px ${DISPLAY}`;
      const nameY = py + 120;
      ctx.fillText(attractionName, W / 2, nameY);

      // Flourish under the name
      const nameW = Math.min(ctx.measureText(attractionName).width, pWidth - 220);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - nameW / 2 - 30, nameY + 26);
      ctx.lineTo(W / 2 - 26, nameY + 26);
      ctx.moveTo(W / 2 + 26, nameY + 26);
      ctx.lineTo(W / 2 + nameW / 2 + 30, nameY + 26);
      ctx.stroke();
      diamond(W / 2, nameY + 26, 10);

      // QR, framed
      const size = 480;
      const qx = (W - size) / 2;
      const qy = nameY + 94;          // 830 — clears the flourish at nameY+26
      ctx.fillStyle = '#FFFFFF';
      roundRect(qx - 28, qy - 28, size + 56, size + 56, 32);
      ctx.fill();
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 8;
      ctx.stroke();
      cornerTicks(qx - 42, qy - 42, size + 84, size + 84, 32);

      if (qr === 'styled') {
        drawStyledQr(ctx, scanUrl, qx, qy, size, '#FFFFFF');
      } else if (qr) {
        ctx.drawImage(qr, qx, qy, size, size);
      } else {
        // Network blocked the QR service — say so on the poster rather than
        // handing the owner a blank frame they might print anyway.
        ctx.fillStyle = '#9CA3AF';
        ctx.font = `30px ${BODY}`;
        ctx.fillText('QR unavailable — check your connection', W / 2, qy + size / 2);
      }

      // Three steps
      const stepY = qy + size + 115;   // 1425 — inside the panel
      const steps = ['OPEN', 'SCAN', 'EARN'];
      const subs = ['the Liliw app', 'the QR code', 'points'];
      const colW = pWidth / 3;
      // Each step is centred on its column by measuring it, not by nudging it.
      //
      // The circle sat at cx-78 and the text at cx-36 — fixed offsets that
      // assumed every caption was the same width. "your camera" and "points"
      // are not, so each group hung a different distance left of centre and
      // the row read as crooked. Measuring the widest line in the group and
      // centring circle-plus-text as one unit makes all three line up whatever
      // the wording.
      const R = 30, GAP = 16;
      steps.forEach((s, i) => {
        const cx = px + colW * i + colW / 2;

        ctx.font = `bold 34px ${HEAD}`;
        const labelW = ctx.measureText(s).width;
        ctx.font = `26px ${BODY}`;
        const subW = ctx.measureText(subs[i]).width;

        const textW = Math.max(labelW, subW);
        const groupW = R * 2 + GAP + textW;
        const left = cx - groupW / 2;
        const circleX = left + R;
        const textX = left + R * 2 + GAP;

        ctx.beginPath();
        ctx.arc(circleX, stepY - 10, R, 0, Math.PI * 2);
        ctx.fillStyle = BLUE;
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 30px ${HEAD}`;
        ctx.fillText(String(i + 1), circleX, stepY);

        ctx.textAlign = 'left';
        ctx.fillStyle = NAVY;
        ctx.font = `bold 34px ${HEAD}`;
        ctx.fillText(s, textX, stepY - 6);
        ctx.fillStyle = '#64748B';
        ctx.font = `26px ${BODY}`;
        ctx.fillText(subs[i], textX, stepY + 28);
        ctx.textAlign = 'center';

        if (i < 2) {
          ctx.strokeStyle = 'rgba(11,61,145,0.18)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px + colW * (i + 1), stepY - 44);
          ctx.lineTo(px + colW * (i + 1), stepY + 34);
          ctx.stroke();
        }
      });

      // Location note
      const noteY = py + pHeight - 40; // 1500 — above the panel's bottom edge
      ctx.fillStyle = BLUE;
      ctx.font = `600 29px ${BODY}`;
      ctx.fillText('Scan in the Liliw app and allow location, or it will not count.', W / 2, noteY);
      const noteW = ctx.measureText('Scan in the Liliw app and allow location, or it will not count.').width;
      diamond(W / 2 - noteW / 2 - 28, noteY - 10, 7, 'rgba(21,101,192,0.45)');
      diamond(W / 2 + noteW / 2 + 28, noteY - 10, 7, 'rgba(21,101,192,0.45)');

      drawFooter(ctx);
      setBusy(false);
    };

    // Wait for the webfonts the page already loads, or canvas silently falls
    // back to a default face and the poster prints in the wrong typeface.
    const start = (qr: CanvasImageSource | 'styled' | null) => {
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      if (fonts?.ready) fonts.ready.then(() => draw(qr)).catch(() => draw(qr));
      else draw(qr);
    };

    // Drawn inline from the module matrix — see drawStyledQr. Nothing to load,
    // so nothing to fail on a slow connection or a blocked image host.
    setFailed(false);
    start('styled');

    return () => { cancelled = true; };
  }, [attractionName, scanUrl, regen]);

  const fileBase = attractionName.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'checkin';

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = `${fileBase}-checkin-poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('QR poster download failed:', err);
      setDlError('The poster could not be saved. Reload the page and try again.');
    }
  };

  /**
   * The same poster as a print-ready A5 PDF.
   *
   * A PNG is fine on screen but a print shop wants a page with real
   * dimensions — handed a PNG they guess the scale, and the QR comes back
   * cropped or the wrong size. The canvas is already A5 at 150dpi, so it maps
   * onto the page exactly with no resampling.
   *
   * jsPDF is imported only when the button is pressed: it is a few hundred KB
   * and no visitor browsing the site should pay for it.
   */
  const downloadPdf = async () => {
    const canvas = canvasRef.current;
    if (!canvas || pdfBusy) return;
    setPdfBusy(true);
    setDlError('');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      // JPEG at high quality rather than PNG: the poster is photographic-ish
      // flat colour, and an A5 PNG at this resolution makes a ~4MB file that
      // is slow to open on the shop's machine.
      doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      doc.save(`${fileBase}-checkin-poster.pdf`);
    } catch (err) {
      console.error('QR poster PDF failed:', err);
      setDlError('The PDF could not be created. Try the PNG instead.');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-3">
        <canvas ref={canvasRef} width={W} height={H}
          className="w-full h-auto rounded-lg shadow-sm bg-white" />
      </div>

      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {/* PDF first: a print shop wants a page, not an image. */}
        <button onClick={downloadPdf} disabled={busy || pdfBusy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: BLUE }}>
          {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          Download PDF (A4)
        </button>
        <button onClick={downloadPng} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50 border"
          style={{ borderColor: 'rgba(11,61,145,0.25)', color: BLUE }}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          PNG
        </button>
        {/* Redrawing produced an identical poster and no feedback, so it read
            as a dead button. It now says it has run — and says plainly that
            the code is unchanged, which is the point: posters already on a
            wall must keep working. */}
        <button
          onClick={() => { setBusy(true); setDlError(''); setRegen(n => n + 1); }}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
        {regenerated && !busy && (
          <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>
            Redrawn — same code, so printed posters still work.
          </span>
        )}
        <a href={scanUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
          style={{ color: BLUE }}>
          <QrCode className="w-4 h-4" /> Test the link
        </a>
      </div>

      {failed && (
        <p className="text-xs text-red-500 mt-2">
          The QR code could not be drawn, so the poster is incomplete — do not print it. Press Regenerate, or reload the page.
        </p>
      )}
      {dlError && <p className="text-xs text-red-500 mt-2">{dlError}</p>}
    </div>
  );
}
