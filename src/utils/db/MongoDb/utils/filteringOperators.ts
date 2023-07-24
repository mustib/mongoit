type FilteringOperatorsTypes = {
  asValue: 'lt' | 'gt' | 'lte' | 'gte' | 'ne' | 'eq';
  asArray: 'or';
  asNotValue: `n${FilteringOperatorsTypes['asValue']}`;
};

type Operators<
  WithDollarSign extends
    | 'WithDollarSign'
    | 'WithoutDollarSign' = 'WithDollarSign'
> = `${WithDollarSign extends 'WithDollarSign'
  ? '$'
  : ''}${FilteringOperatorsTypes[keyof FilteringOperatorsTypes]}`;

type FilterOperatorHandler<
  Type extends keyof FilteringOperatorsTypes | undefined = undefined
> = <
  Operator extends `$${FilteringOperatorsTypes[Type extends undefined
    ? keyof FilteringOperatorsTypes
    : Type]}`,
  Key extends string,
  Value
>(
  operator: Operator,
  key: Key,
  value: Value
) => object;

type FilteringOperatorsHandlers = {
  [key in keyof FilteringOperatorsTypes]: FilterOperatorHandler<key>;
};

const filteringOperatorsAsKeysWithTypesAsValues: {
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

const allOperators = Object.keys(
  filteringOperatorsAsKeysWithTypesAsValues
) as Operators<'WithoutDollarSign'>[];

const filteringOperatorsTypesHandlersObject: FilteringOperatorsHandlers = {
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

const getFilteringOperatorsByTypes = (() => {
  const filteredTypes: UntypedObject = {};

  return <Type extends keyof FilteringOperatorsTypes>(filteringType: Type) => {
    if (typeof filteredTypes[filteringType] === 'undefined') {
      const operators = allOperators.filter(
        (operator) =>
          filteringOperatorsAsKeysWithTypesAsValues[
            operator as FilteringOperatorsTypes[keyof FilteringOperatorsTypes]
          ] === filteringType
      ) as Operators<'WithoutDollarSign'>[];

      filteredTypes[filteringType] = operators;
    }

    return filteredTypes[filteringType] as FilteringOperatorsTypes[Type][];
  };
})();

export type { Operators, FilteringOperatorsTypes, FilterOperatorHandler };

export {
  allOperators,
  filteringOperatorsAsKeysWithTypesAsValues,
  filteringOperatorsTypesHandlersObject,
  getFilteringOperatorsByTypes,
};
