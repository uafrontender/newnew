function createStorage(): { save: () => void; restore: () => void } {
  const LOCAL_STORAGE_MEMORY = {};

  function save() {
    Object.keys(localStorage).forEach((key) => {
      LOCAL_STORAGE_MEMORY[key] = localStorage[key];
    });
  }

  function restore() {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
      localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
  }

  return { save, restore };
}

export default createStorage;
