export function extractGyazoUrls(text: string): string[] {
  const regex = /https:\/\/gyazo\.com\/[a-f0-9]+/g;
  return text.match(regex) || [];
}
