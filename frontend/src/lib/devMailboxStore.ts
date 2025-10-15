export type DevMail = {
  to: string;
  subject: string;
  body?: string;
  createdAt: string;
};

const _box: DevMail[] = [];

export function pushMail(m: Omit<DevMail, 'createdAt'>) {
  _box.unshift({ ...m, createdAt: new Date().toISOString() });
  if (_box.length > 200) _box.pop();
}

export function listMail(to?: string) {
  return to ? _box.filter(m => m.to === to) : _box;
}
