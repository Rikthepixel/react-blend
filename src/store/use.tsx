import { useSyncExternalStore } from "react";

export type SetFn<TState> = (
  setter: Partial<TState> | ((current: Readonly<TState>) => Partial<TState>),
) => void;
export type GetFn<TState> = () => TState;

export type SelectorFn<TState, TSelected> = (state: TState) => TSelected;

export type UseStore<TState extends object> = <
  TSelectorFn extends SelectorFn<TState, unknown> = SelectorFn<TState, TState>,
>(
  selector?: TSelectorFn,
) => ReturnType<TSelectorFn>;

/** Creates a store hook */
export function createStore<TState extends object>(
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

  function defaultSelector(state: TState) {
    return state;
  }

  function useStore<
    TSelectorFn extends SelectorFn<TState, unknown> = SelectorFn<
      TState,
      TState
    >,
  >(selector?: TSelectorFn): ReturnType<TSelectorFn> {
    const store = useSyncExternalStore(subscribe, get, getInitial);
    return (selector ?? defaultSelector)(store) as ReturnType<TSelectorFn>;
  }
   
  return useStore satisfies UseStore<TState>;
}
