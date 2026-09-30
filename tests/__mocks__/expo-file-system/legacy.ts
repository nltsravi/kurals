export const cacheDirectory = 'file:///mock/cache/';
export const documentDirectory = 'file:///mock/documents/';

export const EncodingType = {
  Base64: 'base64',
  UTF8: 'utf8',
};

export const writeAsStringAsync = jest.fn(async () => {});
export const moveAsync = jest.fn(async () => {});
export const deleteAsync = jest.fn(async () => {});
export const getInfoAsync = jest.fn(async () => ({ exists: true, size: 100 }));
