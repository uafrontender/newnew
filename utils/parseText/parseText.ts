interface TextChunk {
  type: 'text';
  text: string;
}

interface HashtagChunk {
  type: 'hashtag';
  text: string;
}

type Chunk = TextChunk | HashtagChunk;

function getChunks(text: string): Chunk[] {
  if (text.length < 1) {
    return [];
  }

  const regexp = /(?:^|\s)(#[a-zA-Z0-9_]+)/;
  const match = text.match(regexp);

  const chunks: Chunk[] = [];

  if (match) {
    if (match.index && match.index > 0) {
      const textBeforeMatch = text.slice(0, match.index + 1);
      chunks.push({ type: 'text', text: textBeforeMatch });
    }

    chunks.push({ type: 'hashtag', text: match[1] });

    const remainder = text.slice((match.index || 0) + match[0].length);
    chunks.push(...getChunks(remainder));
  } else {
    chunks.push({ type: 'text', text: text });
  }

  return chunks;
}

function parseText(text: string): Chunk[] {
  const result = getChunks(text);
  return result;
}

export default parseText;
