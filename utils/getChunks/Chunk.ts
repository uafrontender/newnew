export interface TextChunk {
  type: 'text';
  text: string;
}

export interface HashtagChunk {
  type: 'hashtag';
  text: string;
}

export type Chunk = TextChunk | HashtagChunk;
