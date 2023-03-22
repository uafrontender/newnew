import { Chunk } from './Chunk';

function getChunks(text: string, ignoreStart: boolean): Chunk[] {
  if (text.length < 1) {
    return [];
  }

  const regexp = ignoreStart
    ? /(\s)(#[^\s.,?!:;—\-\[\]{}\(\)"…\/\\|*^+~=%#$@]+)(\s|$)/
    : /(^|\s)(#[^\s.,?!:;—\-\[\]{}\(\)"…\/\\|*^+~=%#$@]+)(\s|$)/;
  const match = text.match(regexp);

  const chunks: Chunk[] = [];

  if (match) {
    const hashtag = match[2];
    if (match.index && match.index > 0) {
      const textBeforeMatch = text.slice(0, match.index) + match[1];
      chunks.push({ type: 'text', text: textBeforeMatch });
    } else if (match[1].length > 0) {
      chunks.push({ type: 'text', text: match[1] });
    }
    const hashtagText = hashtag.replace('#', '');
    chunks.push({ type: 'hashtag', text: hashtagText });

    const textAfterMatch = match[3] || '';
    const remainder = textAfterMatch.concat(
      text.slice((match.index || 0) + match[0].length)
    );
    chunks.push(...getChunks(remainder, true));
  } else {
    chunks.push({ type: 'text', text: text });
  }

  return chunks;
}

export default (text: string) => getChunks(text, false);
