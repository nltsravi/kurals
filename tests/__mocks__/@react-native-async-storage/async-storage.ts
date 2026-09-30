const store: Record<string, string> = {};

export default {
  getItem: jest.fn(async (key: string) => {
    return store[key] || null;
  }),
  setItem: jest.fn(async (key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete store[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(store).forEach((key) => delete store[key]);
  }),
  getAllKeys: jest.fn(async () => {
    return Object.keys(store);
  }),
};
