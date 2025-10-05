export function slugify(input: string): string {
  return input
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'') // remove diacritics
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
    .slice(0,60);
}
