// TODO: Wherever window object is used, we can have a getWindow function instead of using isBrowser check
const isBrowser = (): boolean => typeof window !== 'undefined';

export default isBrowser;
