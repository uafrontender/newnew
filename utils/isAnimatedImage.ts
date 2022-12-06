/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-labels */
function getImageMeta(buffer: Uint8Array) {

  if (check(buffer, [0xFF, 0xD8, 0xFF])) {
    return {
      ext: 'jpg',
      mime: 'image/jpeg',
      animated: false,
    };
  }
  if (check(buffer, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    // apng has `61 63 54 4C` before first `00 00 00 08`
    if (findIndex(buffer, [0x61, 0x63, 0x54, 0x4C]) === -1) {
      return {
        ext: 'png',
        mime: 'image/png',
        animated: false,
      };
    }
    return {
      ext: 'png',
      mime: 'image/png',
      animated: true,
    };
  }
  if (check(buffer, [0x47, 0x49, 0x46])) {
    return {
      ext: 'gif',
      mime: 'image/gif',
      animated: true,
    };
  }
  if (check(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    if (findIndex(buffer, [0x41, 0x4E, 0x49, 0x4D]) === -1) {
      return {
        ext: 'webp',
        mime: 'image/webp',
        animated: false,
      };
    }
    return {
      ext: 'webp',
      mime: 'image/webp',
      animated: true,
    };
  }
  return null;
}

const check = (buffer: Uint8Array, codes: number[], offset: number = 0) => {
  // eslint-disable-next-line no-param-reassign
  offset = offset || 0;
  for (let i = 0; i < codes.length; i++) {
    if (buffer[i + offset] !== codes[i]) {
      return false;
    }
  }
  return true;
}

const findIndex = (buffer: Uint8Array, codes: number[]) => {
  const from = 0;
  const to = buffer.length;

  outerLoop: for (let i = from; i < to; i++) {
    for (let j = 0; j < codes.length; j++) {
      if (buffer[i + j] !== codes[j]) {
        continue outerLoop;
      }
    }
    return i;
  }
  return -1;
}

const isAnimatedImage = async (file: File) => {
  let isAnimated = false;

  const buff = await file.arrayBuffer();

  const meta = getImageMeta(new Uint8Array(buff));
  console.log(meta)

  isAnimated = !!meta?.animated

  return isAnimated;
};

export default isAnimatedImage;
