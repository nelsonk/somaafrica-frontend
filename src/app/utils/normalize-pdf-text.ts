export function normalizePdfText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00AD/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 🔥 important
    .replace(/\s+/g, ' ')
    .trim();
}

export function isReadableText(str: string): boolean {
  // keep mostly ASCII + extended latin
  const badRatio =
    (str.match(/[^\x20-\x7E\u00A0-\u00FF]/g) || []).length /
    Math.max(str.length, 1);

  return badRatio < 0.3;
}