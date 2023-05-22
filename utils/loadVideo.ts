export const loadVideo = (file: any) =>
  new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';

      // eslint-disable-next-line func-names
      video.onloadedmetadata = function () {
        resolve(this);
      };

      // eslint-disable-next-line func-names
      video.onerror = function () {
        reject(new Error('Invalid video. Please select a video file.'));
      };

      video.src = window.URL.createObjectURL(file);
    } catch (e) {
      reject(e);
    }
  });

export default loadVideo;
