export type IsEqual<A, B> =
  (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
    ? true
    : false;

type Filter<TKey, TExclude> =
  IsEqual<TKey, TExclude> extends true ? never : TKey;

/** Like `Omit`, but it resolves */
export type Except<TObj, TExceptKey extends keyof TObj> = {
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

export type ExceptRequired<
  TBase extends object,
  TReference extends object,
> = Simplify<Except<TBase, Extract<RequiredKeysOf<TReference>, keyof TBase>>>;

export function named<T extends React.ComponentType>(
  displayName: string,
  component: T,
) {
  component.displayName = displayName;
  return component;
}
