import type { UntypedObject } from "@mustib/utils";

import type { FilterOperatorHandler, FilterOperators, FilteringOperatorsTypes } from "./types.js";


type FilteringOperatorsHandlers = {
  [key in keyof FilteringOperatorsTypes]: FilterOperatorHandler<key>;
};

export const filteringOperatorsAsKeysWithTypesAsValues: {
  readonly [key in keyof FilteringOperatorsTypes as FilteringOperatorsTypes[key]]: key;
} = {
  gt: 'asValue',
  gte: 'asValue',
  lt: 'asValue',
  lte: 'asValue',
  ne: 'asValue',
  eq: 'asValue',
  or: 'asArray',
  neq: 'asNotValue',
  ngt: 'asNotValue',
  ngte: 'asNotValue',
  nlt: 'asNotValue',
  nlte: 'asNotValue',
  nne: 'asNotValue',
};

export const allFilterOperators = Object.keys(
  filteringOperatorsAsKeysWithTypesAsValues
) as FilterOperators<'WithoutDollarSign'>[];

export const filteringOperatorsTypesHandlersObject: FilteringOperatorsHandlers = {
  asValue(operator, key, value) {
    return {
      [key]: {
        [operator]: value,
      },
    };
  },

  asArray(operator, key, value) {
    return {
      [operator]: Array.isArray(value)
        ? value.map((v) =>
          filteringOperatorsTypesHandlersObject.asValue('$eq', key, v)
        )
        : [filteringOperatorsTypesHandlersObject.asValue('$eq', key, value)],
    };
  },

  asNotValue(operator, key, value) {
    const _operator = `$${operator.slice(2)}`; // extract the operator since it will start with $n for example $ngt => $not $gt
    return {
      [key]: {
        $not: {
          [_operator]: value,
        },
      },
    };
  },
};

export const getFilteringOperatorsByTypes = (() => {
  const filteredTypes: UntypedObject = {};

  return <Type extends keyof FilteringOperatorsTypes>(filteringType: Type) => {
    if (typeof filteredTypes[filteringType] === 'undefined') {
      const operators = allFilterOperators.filter(
        (operator) =>
          filteringOperatorsAsKeysWithTypesAsValues[
          operator as FilteringOperatorsTypes[keyof FilteringOperatorsTypes]
          ] === filteringType
      ) as FilterOperators<'WithoutDollarSign'>[];

      filteredTypes[filteringType] = operators;
    }

    return filteredTypes[filteringType] as FilteringOperatorsTypes[Type][];
  };
})();