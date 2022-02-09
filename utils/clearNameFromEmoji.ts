const clearNameFromEmoji = (name: string) => {
  return name.replace(/[^a-zA-Z0-9 ]/g, '');
};

export default clearNameFromEmoji;
