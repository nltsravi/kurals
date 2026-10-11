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
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
};

export const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
  set: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

export const Image = 'Image';


