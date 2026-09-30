export const Platform = {
  OS: 'ios',
  select: (obj: any) => obj.ios || obj.default,
};

export const Share = {
  share: jest.fn(async () => ({ action: 'sharedAction' })),
  sharedAction: 'sharedAction',
  dismissedAction: 'dismissedAction',
};

export const StyleSheet = {
  create: (styles: any) => styles,
  hairlineWidth: 1,
};
