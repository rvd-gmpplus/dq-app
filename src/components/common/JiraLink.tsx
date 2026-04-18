import { ExternalLink } from 'lucide-react';
import { jiraUrl } from '@/lib/jira';

export default function JiraLink({ keyStr }: { keyStr: string }) {
  return (
    <a
      href={jiraUrl(keyStr)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono text-slate-600 hover:border-gmp-purple-200 hover:text-gmp-purple-700"
    >
      {keyStr}
      <ExternalLink size={11} aria-hidden="true" />
    </a>
  );
}
