const FILE_PREFIX = 'gmp-dq-quadrant';

function timestamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function snapshot(el: HTMLElement): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas(el, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
  });
}

export async function exportQuadrantPng(el: HTMLElement): Promise<void> {
  const canvas = await snapshot(el);
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${FILE_PREFIX}-${timestamp()}.png`;
  link.click();
}

export async function exportQuadrantPdf(el: HTMLElement): Promise<void> {
  const canvas = await snapshot(el);
  const { default: JsPdf } = await import('jspdf');
  const pdf = new JsPdf({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const marginX = 12;
  const marginY = 12;
  const headerH = 14;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text('GMP+ Data Quality Project: Quadrant', marginX, marginY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text(new Date().toISOString().slice(0, 10), pageW - marginX, marginY, { align: 'right' });

  const imgW = pageW - marginX * 2;
  const imgH = (canvas.height / canvas.width) * imgW;
  const finalH = Math.min(imgH, pageH - marginY * 2 - headerH);
  const finalW = (canvas.width / canvas.height) * finalH;
  const offsetX = (pageW - finalW) / 2;
  const offsetY = marginY + headerH;

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', offsetX, offsetY, finalW, finalH);
  pdf.save(`${FILE_PREFIX}-${timestamp()}.pdf`);
}
