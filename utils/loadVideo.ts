export const loadVideo = (file: any) =>
  new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function () {
        resolve(this);
      };

      video.onerror = function () {
        reject(new Error('Invalid video. Please select a video file.'));
      };

      video.src = window.URL.createObjectURL(file);
    } catch (e) {
      reject(e);
    }
  });

export default loadVideo;
