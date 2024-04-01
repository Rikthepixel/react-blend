export type IsEqual<A, B> =
  (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
    ? true
    : false;

type Filter<TKey, TExclude> =
  IsEqual<TKey, TExclude> extends true ? never : TKey;

/** Like `Omit`, but it resolves */
export type Except<TObj, TExceptKey extends keyof TObj> =
  IsEqual<keyof TObj, TExceptKey> extends true
    ? {}
    : {
        [TKey in keyof TObj as Filter<TKey, TExceptKey>]: TObj[TKey];
      };

/** Picks the keys that are required on an object */
export type RequiredKeysOf<TObj extends object> = Exclude<
  {
    [TKey in keyof TObj]: TObj extends Record<TKey, TObj[TKey]> ? TKey : never;
  }[keyof TObj],
  undefined
>;

/** Forcefully opens up the type */
export type Simplify<T> = { [TKey in keyof T]: T[TKey] } & {};

/** Make the keys that were given optional */
export type SetOptional<TObj, TKeys extends keyof TObj> = Simplify<
  IsEqual<keyof TObj, TKeys> extends true
    ? Partial<TObj>
    : Except<TObj, TKeys> & Partial<Pick<TObj, TKeys>>
>;

/** Make the keys that were given optional */
export type SetRequired<TObj, TKeys extends keyof TObj> = Simplify<
  IsEqual<keyof TObj, TKeys> extends true
    ? Required<TObj>
    : Except<TObj, TKeys> & Required<Pick<TObj, TKeys>>
>;

export type ExceptRequired<
  TBase extends object,
  TReference extends object,
> = Simplify<Except<TBase, Extract<RequiredKeysOf<TReference>, keyof TBase>>>;

export type MaybePromise<T> = Promise<T> | T;

export function named<T extends React.ComponentType>(
  displayName: string,
  component: T,
) {
  component.displayName = displayName;
  return component;
}

export function shallow<T extends object>(prev: T, curr: T) {
  if (Object.is(prev, curr)) return true;

  const prevKeys = Object.keys(prev);
  const currKeys = Object.keys(curr);
  if (prevKeys.length !== currKeys.length) return true;

  const keys = new Set([...currKeys, ...prevKeys]);

  for (const key of keys) {
    if (curr[key] !== prev[key]) {
      return true;
    }
  }

  return false;
}

export type FluxReducer<T> = (
  state: T,
  partial: Partial<T> | ((state: T) => Partial<T>),
) => T;

export function fluxReducer<T>(
  state: T,
  partial: Partial<T> | ((state: T) => Partial<T>),
) {
  const resolvedPartial =
    partial instanceof Function ? partial(state) : partial;
  if (Object.is(state, resolvedPartial)) return state;
  return Object.assign({}, state, resolvedPartial);
}
