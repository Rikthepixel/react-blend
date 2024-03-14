import React, { useSyncExternalStore } from "react";
import {
  Except,
  ExceptRequired,
  RequiredKeysOf,
  Simplify,
  named,
} from "./helpers";

export type SetFn<TState> = (
  setter: Partial<TState> | ((current: Readonly<TState>) => Partial<TState>),
) => void;
export type GetFn<TState> = () => TState;

function createStore<TState extends object>(
  initial: (set: SetFn<TState>, get: GetFn<TState>) => TState,
) {
  let state: TState;
  const listeners = new Set<() => void>();

  const set: SetFn<TState> = (setter) => {
    const changed = setter instanceof Function ? setter(state) : setter;
    if (Object.is(changed, state)) return;
    state = Object.assign({}, state, changed);
    listeners.forEach((l) => l());
  };

  const get: GetFn<TState> = () => {
    return state;
  };

  const initialState = initial(set, get);
  state = initialState;

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  }

  function getInitial() {
    return initialState;
  }

  function useStore<TSelected>(
    selector: (state: TState) => TSelected,
  ): TSelected {
    const store = useSyncExternalStore(subscribe, get, getInitial);
    return selector(store);
  }

  return useStore;
}

/**
 * Zustand-like (flux) state management in a HOC format.
 */
export function makeWithStore<TState extends object>(
  initial: (set: SetFn<TState>, get: GetFn<TState>) => TState,
) {
  const useStore = createStore(initial);

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
