/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
// prevent inheriting parent element's onClick
const preventParentClick = (fn?: any, defaultOnly?: any) => {
  return (e: any, ...params: any) => {
    e && e.preventDefault();
    !defaultOnly && e && e.stopPropagation();
    fn && fn(e, ...params);
  };
};
export default preventParentClick;
