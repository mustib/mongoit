import { getTypeof } from "@mustib/utils";

export function isObject<T = UntypedObject>(v: unknown): v is T {
  return getTypeof(v) === 'object';
}