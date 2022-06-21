import getChunks from './getChunks';

describe('text', () => {
  it('empty', () => {
    const input = '';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(0);
  });

  it('normal', () => {
    const input = 'Random text.';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type).toBe('text');
    expect(chunks[0].text).toBe(input);
  });
});

describe('parses hashtags', () => {
  it('ignores hash only', () => {
    const input = '#';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type).toBe('text');
    expect(chunks[0].text).toBe(input);
  });

  it('single', () => {
    const input = '#hashtag';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type).toBe('hashtag');
    expect(chunks[0].text).toBe(input);
  });

  it('with undescore', () => {
    const input = '#another_hashtag';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type).toBe('hashtag');
    expect(chunks[0].text).toBe(input);
  });

  it('with capital letter', () => {
    const input = '#HaShTaG';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type).toBe('hashtag');
    expect(chunks[0].text).toBe(input);
  });

  it('with number', () => {
    const input = '#1812';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type).toBe('hashtag');
    expect(chunks[0].text).toBe(input);
  });

  it('multiple', () => {
    const input = '#hashtag #another_hashtag';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(3);

    expect(chunks[0].type).toBe('hashtag');
    expect(chunks[0].text).toBe('#hashtag');

    expect(chunks[1].type).toBe('text');
    expect(chunks[1].text).toBe(' ');

    expect(chunks[2].type).toBe('hashtag');
    expect(chunks[2].text).toBe('#another_hashtag');
  });

  it('merged', () => {
    const input = '#hashtag#anotherhashtag';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(2);

    expect(chunks[0].type).toBe('hashtag');
    expect(chunks[0].text).toBe('#hashtag');

    expect(chunks[1].type).toBe('text');
    expect(chunks[1].text).toBe('#anotherhashtag');
  });

  it('keeps spaces', () => {
    const input = '  #hashtag  ';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(3);

    expect(chunks[0].type).toBe('text');
    expect(chunks[0].text).toBe('  ');

    expect(chunks[1].type).toBe('hashtag');
    expect(chunks[1].text).toBe('#hashtag');

    expect(chunks[2].type).toBe('text');
    expect(chunks[2].text).toBe('  ');
  });
});

export {};
