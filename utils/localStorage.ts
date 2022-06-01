import isBrowser from './isBrowser';

export const loadStateLS = <Type>(stateKey: string): Type | null => {
  try {
    if (!isBrowser()) {
      return null;
    }

    const serializedState = localStorage.getItem(stateKey);

    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState) as Type;
  } catch (err) {
    return null;
  }
};

export const saveStateLS = (stateKey: string, stateValue: any): boolean => {
  try {
    if (!isBrowser()) {
      return false;
    }

    const serializedState = JSON.stringify(stateValue);
    localStorage.setItem(stateKey, serializedState);
    return true;
  } catch (err) {
    return false;
  }
};

export const removeStateLS = (stateKey: string): boolean => {
  try {
    if (!isBrowser()) {
      return false;
    }
    localStorage.removeItem(stateKey);
    return true;
  } catch (err) {
    return false;
  }
};
