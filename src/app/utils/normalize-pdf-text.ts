export function normalizePdfText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .replace(/[\u00AD]/g, '')
    .trim();
}