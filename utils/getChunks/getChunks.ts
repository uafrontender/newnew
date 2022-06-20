import { Chunk } from './Chunk';

function getChunks(text: string, ignoreStart: boolean): Chunk[] {
  if (text.length < 1) {
    return [];
  }

  const regexp = ignoreStart
    ? /(\s)(#[a-zA-Z0-9_]+)/
    : /(^|\s)(#[a-zA-Z0-9_]+)/;
  const match = text.match(regexp);

  const chunks: Chunk[] = [];

  if (match) {
    if (match.index && match.index > 0) {
      const textBeforeMatch = text.slice(0, match.index) + match[1];
      chunks.push({ type: 'text', text: textBeforeMatch });
    } else if (match[1].length > 0) {
      chunks.push({ type: 'text', text: match[1] });
    }

    chunks.push({ type: 'hashtag', text: match[2] });

    const remainder = text.slice((match.index || 0) + match[0].length);
    chunks.push(...getChunks(remainder, true));
  } else {
    chunks.push({ type: 'text', text: text });
  }

  return chunks;
}

export default (text: string) => getChunks(text, false);
