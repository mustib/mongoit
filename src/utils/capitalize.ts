const capitalizeFirst = (str: string) =>
  str[0].toUpperCase().concat(str.slice(1).toLowerCase());

/**
 * @param str the string to capitalize
 * @param onlyFirst a boolean whether to capitalize only the first word
 * @param splitter defaults to one space
 * @param joiner defaults to splitter
 * @returns capitalized string
 */
function capitalize(
  str: string,
  onlyFirst = false,
  splitter = ' ',
  joiner = splitter
) {
  if (typeof str !== 'string' || str === '') return str;
  if (onlyFirst) return capitalizeFirst(str);

  return str.split(splitter).map(capitalizeFirst).join(joiner);
}

export default capitalize;
