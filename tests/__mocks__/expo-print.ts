export const printToFileAsync = jest.fn(async ({ html }: { html: string }) => {
  return {
    uri: 'file:///mock/path/document.pdf',
    numberOfPages: 1,
    base64: '',
  };
});
