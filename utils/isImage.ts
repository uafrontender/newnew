/* eslint-disable no-plusplus */
const imgExtenstions = [
  '.jpg',
  '.JPG',
  '.png',
  '.PNG',
  '.jpeg',
  '.JPEG',
];

const isImage = (name: string) => {
  let result = false;
  for (let i = 0; i < imgExtenstions.length; i++) {
    if (name.includes(imgExtenstions[i])) {
      result = true;
      break;
    }
  }

  return result;
};

export default isImage;
