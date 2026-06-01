/** Export an SVG element as a PNG file. */
export function downloadSvgAsPng(svgElement: SVGElement, fileName: string, scale = 4): void {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(objectUrl);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      const pngUrl = URL.createObjectURL(blob);
      link.href = pngUrl;
      link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
      link.click();
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };

  image.onerror = () => URL.revokeObjectURL(objectUrl);
  image.src = objectUrl;
}

export type QrPrintPosterOptions = {
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  attendanceUrl: string;
  qrPngDataUrl: string;
};

/** Open a print-friendly page with the QR code and event details. */
export function printQrPoster(options: QrPrintPosterOptions): void {
  const { eventTitle, eventDate, eventTime, location, attendanceUrl, qrPngDataUrl } = options;

  const metaLines = [
    eventDate ? `<div class="meta-row"><strong>Date:</strong> ${escapeHtml(eventDate)}</div>` : '',
    eventTime ? `<div class="meta-row"><strong>Time:</strong> ${escapeHtml(eventTime)}</div>` : '',
    location ? `<div class="meta-row"><strong>Location:</strong> ${escapeHtml(location)}</div>` : '',
  ]
    .filter(Boolean)
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(eventTitle)} — Check-in QR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #0f172a;
      padding: 48px 32px;
      display: flex;
      justify-content: center;
    }
    .poster {
      max-width: 480px;
      text-align: center;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px 32px;
    }
    .brand {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #b45309;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 22px;
      line-height: 1.3;
      margin-bottom: 16px;
    }
    .meta {
      font-size: 13px;
      color: #475569;
      margin-bottom: 24px;
      text-align: left;
    }
    .meta-row { margin-bottom: 6px; }
    .qr-wrap {
      display: inline-block;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #fff;
    }
    .qr-wrap img {
      width: 280px;
      height: 280px;
      display: block;
    }
    .instruction {
      margin-top: 24px;
      font-size: 15px;
      font-weight: 600;
      color: #0f1e38;
    }
    .url {
      margin-top: 12px;
      font-size: 10px;
      word-break: break-all;
      color: #64748b;
    }
    @media print {
      body { padding: 0; }
      .poster { border: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="poster">
    <p class="brand">Rwanda ICT Chamber</p>
    <h1>${escapeHtml(eventTitle)}</h1>
    ${metaLines ? `<div class="meta">${metaLines}</div>` : ''}
    <div class="qr-wrap">
      <img src="${qrPngDataUrl}" alt="Check-in QR code" />
    </div>
    <p class="instruction">Scan to sign in</p>
    <p class="url">${escapeHtml(attendanceUrl)}</p>
  </div>
  <script>
    window.onload = function() {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    throw new Error('Pop-up blocked. Allow pop-ups to print the QR code.');
  }
  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Render SVG to a PNG data URL (for print poster). */
export function svgToPngDataUrl(svgElement: SVGElement, scale = 4): Promise<string> {
  return new Promise((resolve, reject) => {
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not create canvas'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load QR image'));
    };
    image.src = objectUrl;
  });
}
