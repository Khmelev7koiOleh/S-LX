export function safeFileName(filename: string) {
  return filename
    .normalize('NFKD') // decompose accents
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\s+/g, '-') // replace spaces with dashes
    .replace(/[^a-zA-Z0-9_.-]/g, '') // remove all non-ASCII characters
    .toLowerCase()
}
