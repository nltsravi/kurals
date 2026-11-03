export function requireOptionalNativeModule(moduleName: string) {
  return null;
}

export function requireNativeModule(moduleName: string) {
  throw new Error(`Cannot find native module '${moduleName}'`);
}
