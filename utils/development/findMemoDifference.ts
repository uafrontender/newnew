/**
 * Find difference between two objects
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */
function findMemoDifference(origObj: any, newObj: any) {
  const result: any = {};
  Object.entries(origObj).forEach(([key, value]) => {
    if (value !== newObj[key]) {
      result[key] = newObj[key];
    }
  });

  Object.entries(newObj).forEach(([key, value]) => {
    if (!origObj[key]) {
      result[key] = value;
    }
  });

  return result;
}

export default findMemoDifference;
