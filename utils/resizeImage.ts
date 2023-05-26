interface ResizedImage {
  url: string;
  height: number;
  width: number;
}

async function resizeImage(
  src: string,
  maxSide: number
): Promise<ResizedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // eslint-disable-next-line func-names
    img.addEventListener('load', function () {
      if (this.height < maxSide && this.width < maxSide) {
        return resolve({
          url: src,
          height: this.height,
          width: this.width,
        });
      }

      const proportion = this.height / this.width;
      const newHeight = proportion > 1 ? maxSide : maxSide * proportion;
      const newWidth = proportion > 1 ? maxSide / proportion : maxSide;

      const canvas = document.createElement('canvas');
      canvas.height = newHeight;
      canvas.width = newWidth;

      const context = canvas.getContext('2d');

      if (!context) {
        return reject();
      }

      context.drawImage(img, 0, 0, newWidth, newHeight);
      const resizedImageUrl = canvas.toDataURL('image');

      return resolve({
        url: resizedImageUrl,
        height: newHeight,
        width: newWidth,
      });
    });

    img.src = src;
  });
}

export default resizeImage;
