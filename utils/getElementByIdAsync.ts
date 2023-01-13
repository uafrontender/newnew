export default function getElementByIdAsync<T> (id: string) : Promise<T> {
  let frameCounter = 0
  return new Promise((resolve, reject) => {
    const getElement = () => {
      const element = document.getElementById(id);
      if (element) {
        resolve(element as T);
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
