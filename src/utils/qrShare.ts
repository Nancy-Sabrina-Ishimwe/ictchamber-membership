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
