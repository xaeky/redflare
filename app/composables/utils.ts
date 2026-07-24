import _ from 'lodash';

export function deepOmitBy(value: unknown, predicate: (val: unknown) => boolean): unknown {
  if (_.isArray(value)) {
    return value.map((item) => deepOmitBy(item, predicate)).filter((item) => !predicate(item));
  }
  if (_.isPlainObject(value)) {
    return _.omitBy(
      _.mapValues(value as Record<string, unknown>, (v) => deepOmitBy(v, predicate)),
      predicate
    );
  }
  return value;
}