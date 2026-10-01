export const Platform = {
  OS: 'ios',
  select: (obj: any) => obj.ios || obj.default,
};

export const Share = {
  share: jest.fn(async () => ({ action: 'sharedAction' })),
  sharedAction: 'sharedAction',
  dismissedAction: 'dismissedAction',
};

export const Linking = {
  canOpenURL: jest.fn(async () => true),
  openURL: jest.fn(async () => {}),
  openSettings: jest.fn(async () => {}),
};

export const StyleSheet = {
  create: (styles: any) => styles,
  hairlineWidth: 1,
};

