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

    expect(chunks[0].type === 'text');
    expect(chunks[0].text === input);
  });
});

describe('parses hashtags', () => {
  it('ignores hash only', () => {
    const input = '#';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type === 'text');
    expect(chunks[0].text === input);
  });

  it('single', () => {
    const input = '#hashtag';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type === 'hashtag');
    expect(chunks[0].text === input);
  });

  it('with undescore', () => {
    const input = '#another_hashtag';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type === 'hashtag');
    expect(chunks[0].text === input);
  });

  it('with capital letter', () => {
    const input = '#HaShTaG';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type === 'hashtag');
    expect(chunks[0].text === input);
  });

  it('with number', () => {
    const input = '#1812';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(1);

    expect(chunks[0].type === 'hashtag');
    expect(chunks[0].text === input);
  });

  it('multiple', () => {
    const input = '#hashtag #another_hashtag';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(3);

    expect(chunks[0].type === 'hashtag');
    expect(chunks[0].text === '#hashtag');

    expect(chunks[1].type === 'text');
    expect(chunks[1].text === ' ');

    expect(chunks[2].type === 'hashtag');
    expect(chunks[2].text === '#another-hashtag');
  });

  it('merged', () => {
    const input = '#hashtag#anotherhashtag';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(2);

    expect(chunks[0].type === 'hashtag');
    expect(chunks[0].text === '#hashtag');

    expect(chunks[1].type === 'text');
    expect(chunks[1].text === '#anotherhashtag');
  });

  it('keeps spaces', () => {
    const input = '  #hashtag  ';
    const chunks = getChunks(input);

    expect(chunks.length).toBe(3);

    expect(chunks[0].type === 'text');
    expect(chunks[0].text === '  ');

    expect(chunks[1].type === 'hashtag');
    expect(chunks[1].text === '#hashtag');

    expect(chunks[1].type === 'text');
    expect(chunks[1].text === '  ');
  });
});

export {};
