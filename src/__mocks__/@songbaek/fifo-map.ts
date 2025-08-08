/**
 * Normally we don't need to mock libraries this simple. But because of how it was bundled and published, we need mock it so it plays nicely with how we configure jest.
 */
export class FifoMap<K, V> {
  private map = new Map<K, V>();
  constructor(public options: { maxSize: number }) {}
  get(key: K) {
    return this.map.get(key);
  }
  put(key: K, value: V) {
    this.map.set(key, value);
  }
} 