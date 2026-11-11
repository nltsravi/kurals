export function createWidget(name: string, layout?: any, initialProps?: any) {
  return {
    name,
    updateSnapshot: jest.fn().mockResolvedValue(undefined),
    updateTimeline: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn(),
    getTimeline: jest.fn().mockResolvedValue([]),
  };
}

