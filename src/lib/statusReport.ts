import type { Phase } from '@/types/phase';
import type { Risk } from '@/types/risk';
import type { UseCase } from '@/types/useCase';

export type StatusReportInput = {
  useCases: UseCase[];
  phases: Phase[];
  risks: Risk[];
  author: string;
  periodLabel?: string;
};

export async function generateStatusReportPdf(input: StatusReportInput): Promise<void> {
  const [{ pdf }, { default: StatusReportPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/exports/StatusReportPDF'),
  ]);
  const blob = await pdf(
    StatusReportPDF({
      useCases: input.useCases,
      phases: input.phases,
      risks: input.risks,
      author: input.author,
      periodLabel: input.periodLabel,
    }),
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gmp-dq-status-${new Date().toISOString().slice(0, 10)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
