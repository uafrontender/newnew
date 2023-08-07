function assertNever(x: never): never {
  throw new Error(`Unexpected data encountered`, x);
}

export default assertNever;
