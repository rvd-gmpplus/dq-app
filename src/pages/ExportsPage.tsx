import { useRef, useState } from 'react';
import { Download, FileJson, FileText, FileSpreadsheet, Upload, AlertTriangle } from 'lucide-react';
import { exportBackupJson, exportUseCasesCsv } from '@/lib/exporters';
import { applyBackup, parseBackup } from '@/lib/importers';
import { generateStatusReportPdf } from '@/lib/statusReport';
import { useUseCaseStore } from '@/stores/useCaseStore';
import { usePhaseStore } from '@/stores/phaseStore';
import { useRiskStore } from '@/stores/riskStore';
import { useSettingsStore } from '@/stores/settingsStore';

type Message = { tone: 'info' | 'error' | 'success'; text: string } | null;

export default function ExportsPage() {
  const useCases = useUseCaseStore((s) => Object.values(s.items));
  const phases = usePhaseStore((s) => s.items);
  const risks = useRiskStore((s) => Object.values(s.items));
  const author = useSettingsStore((s) => s.currentUser);
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onJson = () => {
    exportBackupJson();
    setMessage({ tone: 'success', text: 'JSON backup downloaded.' });
  };
  const onCsv = () => {
    exportUseCasesCsv(useCases);
    setMessage({ tone: 'success', text: 'CSV exported for Excel.' });
  };
  const onStatus = async () => {
    setBusy(true);
    setMessage({ tone: 'info', text: 'Rendering status report...' });
    try {
      await generateStatusReportPdf({ useCases, phases, risks, author });
      setMessage({ tone: 'success', text: 'Status report PDF downloaded.' });
    } catch (err) {
      console.error(err);
      setMessage({ tone: 'error', text: 'Failed to render PDF. See console.' });
    } finally {
      setBusy(false);
    }
  };
  const onImportClick = () => {
    fileInputRef.current?.click();
  };
  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const text = await file.text();
    const result = parseBackup(text);
    if (!result.ok) {
      setMessage({ tone: 'error', text: result.error });
      if (result.issues) console.error(result.issues);
      return;
    }
    const confirm = window.prompt(
      `Restoring will replace every store with the contents of "${file.name}". Type YES to continue.`,
    );
    if (confirm !== 'YES') {
      setMessage({ tone: 'info', text: 'Import cancelled.' });
      return;
    }
    applyBackup(result.payload);
    setMessage({ tone: 'success', text: `Restored ${result.payload.useCases.length} use cases from backup.` });
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Exports and backup</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your Data Quality Project lives in the browser. Export it here for MT updates, Excel
          work, or as a full backup you can restore.
        </p>
      </header>

      {message && (
        <div
          className={
            message.tone === 'error'
              ? 'rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'
              : message.tone === 'success'
                ? 'rounded-lg border border-gmp-green-50 bg-gmp-green-50 px-4 py-2 text-sm text-gmp-green-700'
                : 'rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700'
          }
        >
          {message.text}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <ExportCard
          icon={FileJson}
          title="Full JSON backup"
          description="Every store, every use case, every scoring weight, every comment. Use this as your canonical snapshot before a reset or a hand-over."
          action={{ label: 'Download JSON', onClick: onJson }}
        />
        <ExportCard
          icon={FileSpreadsheet}
          title="Use cases as CSV"
          description="A flat table for Excel with code, title, status, pillars, owner, scores, and linkages. UTF-8 with BOM so en-GB Excel reads it cleanly."
          action={{ label: 'Download CSV', onClick: onCsv }}
        />
        <ExportCard
          icon={FileText}
          title="Status report (A4 landscape, 5 pages)"
          description="Executive summary, quadrant, top five use cases, risk heatmap, phase status. Branded header on every page. On demand."
          action={{ label: busy ? 'Rendering...' : 'Generate PDF', onClick: onStatus }}
          disabled={busy}
        />
        <ExportCard
          icon={Upload}
          title="Restore from JSON backup"
          description="Replace every store with the contents of a previously exported JSON file. The app will ask you to type YES to confirm."
          action={{ label: 'Choose file...', onClick: onImportClick }}
        />
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={onFileChosen}
      />

      <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <div className="inline-flex items-center gap-1.5 font-semibold">
          <AlertTriangle size={12} aria-hidden="true" />
          Data lives in your browser
        </div>
        <p className="mt-1">
          This app has no server. Clearing the site data or resetting from Settings removes every
          use case. Download a JSON backup regularly and keep it somewhere safe (SharePoint, OneDrive,
          or the project repo).
        </p>
      </section>
    </div>
  );
}

function ExportCard({
  icon: Icon,
  title,
  description,
  action,
  disabled,
}: {
  icon: typeof Download;
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
  disabled?: boolean;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-gmp-purple-50 p-2 text-gmp-purple-700">
          <Icon size={16} aria-hidden="true" />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
      <button
        type="button"
        onClick={action.onClick}
        disabled={disabled}
        className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-md bg-gmp-purple px-3 py-1.5 text-sm font-medium text-white hover:bg-gmp-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Download size={13} aria-hidden="true" />
        {action.label}
      </button>
    </article>
  );
}
