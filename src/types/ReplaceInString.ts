/**
 * @param Str the source string
 * @param Replace the string to remove from the source
 * @param ReplaceWith the string to replace with the removed string from source -Defaults to- ""
 * @param OnlyFirst a boolean wether to only remove the first matching string or to remove all
 */
export type ReplaceInString<
  Str extends string,
  Replace extends string,
  ReplaceWith extends string = '',
  OnlyFirst = false
> = Str extends `${infer L}${Replace}${infer R}`
  ? OnlyFirst extends true
    ? `${L}${ReplaceWith}${R}`
    : `${L}${ReplaceWith}${ReplaceInString<R, Replace, ReplaceWith>}`
  : Str;
