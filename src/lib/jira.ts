const BASE = 'https://xuntos.atlassian.net/browse';

export function jiraUrl(key: string): string {
  return `${BASE}/${key}`;
}

export function isValidJiraKey(key: string): boolean {
  return /^GMP-\d+$/.test(key);
}
