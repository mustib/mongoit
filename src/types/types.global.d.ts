declare global {
  declare type UntypedObject = Record<string, any>

  declare type Func = (...args: any[]) => any;
}

export { };
