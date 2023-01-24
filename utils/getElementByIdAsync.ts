// Tries to find an element asynchrously, limited to 200 frames, i.e. 200 attempts
export default function getElementByIdAsync (id: string) : Promise<HTMLElement> {
  let frameCounter = 0
  return new Promise((resolve, reject) => {
    const getElement = () => {
      const element = document.getElementById(id);
      if (element) {
        resolve(element);
      } else if (frameCounter < 200) {
        frameCounter += 1;
        // console.log(`Frame count: ${frameCounter}`);
        requestAnimationFrame(getElement);
      }
      if (frameCounter >= 200) {
        reject(new Error('Element not found'));
      }
    };
    getElement();
  });
}
