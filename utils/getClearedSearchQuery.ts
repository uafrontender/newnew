function getClearedSearchQuery(rawQuery: string): string {
  if (rawQuery.length === 0) {
    return '';
  }

  // Remove leading @ for search to work, if raw was just '@', then it is empty
  // If @ is in the middle, search fails (no results)
  if (rawQuery[0] === '@') {
    return rawQuery.slice(1);
  }

  return rawQuery;
}

export default getClearedSearchQuery;
