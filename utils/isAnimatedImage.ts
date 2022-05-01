/* eslint-disable no-plusplus */
const imgExtenstions = ['.webp', '.WEBP'];

const isAnimatedImage = (name: string) => {
  let result = false;
  if (!name) return result;
  for (let i = 0; i < imgExtenstions.length; i++) {
    if (name.includes(imgExtenstions[i])) {
      result = true;
      break;
    }
  }

  return result;
};

export default isAnimatedImage;
