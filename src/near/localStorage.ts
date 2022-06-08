export function get(key: string): any {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
}

export function set(key: string, state: any): void {
  const serializedState = JSON.stringify(state);
  localStorage.setItem(key, serializedState);
}
