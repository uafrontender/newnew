function createStorage(defaultState?: {}): {
  save: () => void;
  restore: () => void;
  restart: () => void;
} {
  const LOCAL_STORAGE_MEMORY = Object.assign({}, defaultState);

  function save() {
    Object.keys(localStorage).forEach((key) => {
      LOCAL_STORAGE_MEMORY[key] = localStorage[key];
    });
  }

  function restore() {
    console.log(LOCAL_STORAGE_MEMORY);
    Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
      localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
  }

  function restart() {
    Object.keys(defaultState).forEach((key) => {
      LOCAL_STORAGE_MEMORY[key] = defaultState[key];
      localStorage.setItem(key, defaultState[key]);
    });
  }

  return { save, restore, restart };
}

export default createStorage;
