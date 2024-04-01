import React from "react";
import { ExceptRequired, named } from "../helpers";
import { createStore, GetFn, SetFn, UseStore } from "./use";

/**
 * Zustand-like (flux) state management in a HOC format.
 */
export function makeWithStore<TState extends object>(
  initial: (set: SetFn<TState>, get: GetFn<TState>) => TState,
) {
  const useStore = createStore(initial);
  return makeWithExistingStore(useStore);
}

/**
 * Zustand-like (flux) state management in a HOC format.
 */
export function makeWithExistingStore<TState extends object>(
  useStore: UseStore<TState>,
) {
  return function <
    TProps extends object,
    // @ts-ignore
    const TSelected extends Partial<TProps> & object = TState,
  >(
    Component: React.ComponentType<TProps>,
    // @ts-ignore
    selector: (state: TState) => TSelected = (state) => state,
  ): React.FC<ExceptRequired<TProps, TSelected>> {
    return named(`${Component.displayName}-withStore`, function (props) {
      const newProps = {
        ...useStore(selector),
        ...props,
      } as unknown as TProps;
      return <Component {...newProps} />;
    });
  };
}
