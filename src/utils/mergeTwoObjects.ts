type MergedObjects<Target, Source> = Target extends Array<any>
  ? Source
  : Source extends Array<any>
  ? Source
  : Target & Source extends UntypedObject
  ? Target & Source
  : never;

function _mergeTwoObjects<
  Target extends UntypedObject,
  Source extends UntypedObject
>(target: Target, source: Source) {
  const sourceEntries = Object.entries(source) as [keyof Target, any][];

  const merged = target;

  sourceEntries.forEach(([key, value]) => {
    if (
      !(key in target) ||
      Array.isArray(value) ||
      Array.isArray(target[key]) ||
      typeof value !== 'object' ||
      value === null
    ) {
      merged[key] = value;
      return;
    }

    _mergeTwoObjects(merged[key] as UntypedObject, value);
  });
  return merged;
}

/**
 * @param target target object to merge to
 * @param source source object to merge from
 * @param shouldMutateTarget a boolean whether to create a new object or mutate target
 * @returns target and source merged together if both is objects otherwise source is returned
 */
function mergeTwoObjects<
  Target extends UntypedObject,
  Source extends UntypedObject
>(target: Target, source: Source, shouldMutateTarget = false) {
  if (
    typeof target !== 'object' ||
    typeof source !== 'object' ||
    Array.isArray(target) ||
    Array.isArray(source) ||
    target === null ||
    source === null
  ) {
    return source as MergedObjects<Target, Source>;
  }

  return _mergeTwoObjects(
    shouldMutateTarget ? target : structuredClone(target),
    source
  ) as MergedObjects<Target, Source>;
}

export default mergeTwoObjects;
