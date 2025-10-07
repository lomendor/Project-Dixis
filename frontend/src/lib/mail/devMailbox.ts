import { mkdir, writeFile, readdir, readFile } from 'fs/promises';
import { join } from 'path';

const DIR = 'frontend/.tmp/dev-mailbox';

export type DevMail = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  at: number;
  meta?: any;
};

export async function put(msg: DevMail) {
  // Handle both frontend/ and root directory contexts
  const baseDir = process.cwd().includes('frontend')
    ? join(process.cwd(), '.tmp', 'dev-mailbox')
    : join(process.cwd(), 'frontend', '.tmp', 'dev-mailbox');

  await mkdir(baseDir, { recursive: true });

  const key = `${Date.now()}-${(msg.to || 'unknown').replace(/[^a-z0-9@._-]/gi, '_')}.json`;
  await writeFile(join(baseDir, key), JSON.stringify(msg, null, 2), 'utf8');
}

export async function list(limit = 20) {
  const baseDir = process.cwd().includes('frontend')
    ? join(process.cwd(), '.tmp', 'dev-mailbox')
    : join(process.cwd(), 'frontend', '.tmp', 'dev-mailbox');

  await mkdir(baseDir, { recursive: true });

  const files = (await readdir(baseDir))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, limit);

  const out: DevMail[] = [];
  for (const f of files) {
    try {
      const content = await readFile(join(baseDir, f), 'utf8');
      out.push(JSON.parse(content));
    } catch {}
  }
  return out;
}

export async function latestFor(to: string) {
  const items = await list(50);
  return items.find((m) => (m.to || '').toLowerCase() === (to || '').toLowerCase()) || null;
}
