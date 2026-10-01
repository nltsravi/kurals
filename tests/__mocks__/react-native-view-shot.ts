import React from 'react';
import { View } from 'react-native';

export const captureRef = jest.fn(async () => 'file:///tmp/mock-kural-share-image.png');

export const releaseCapture = jest.fn();

const ViewShot = React.forwardRef<any, any>((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    capture: jest.fn(async () => 'file:///tmp/mock-kural-share-image.png'),
  }));
  return React.createElement(View, props);
});

export default ViewShot;
