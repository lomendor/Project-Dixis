import { mkdir, writeFile, readdir, readFile } from 'fs/promises';

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
  await mkdir(DIR, { recursive: true });
  const key = `${Date.now()}-${(msg.to || 'unknown').replace(/[^a-z0-9@._-]/gi, '_')}.json`;
  await writeFile(`${DIR}/${key}`, JSON.stringify(msg, null, 2), 'utf8');
}

export async function list(limit = 20) {
  await mkdir(DIR, { recursive: true });
  const files = (await readdir(DIR))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, limit);
  const out: DevMail[] = [];
  for (const f of files) {
    try {
      out.push(JSON.parse(await readFile(`${DIR}/${f}`, 'utf8')));
    } catch {}
  }
  return out;
}

export async function latestFor(to: string) {
  const items = await list(50);
  return items.find((m) => (m.to || '').toLowerCase() === (to || '').toLowerCase()) || null;
}
