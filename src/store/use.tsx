import { useSyncExternalStore } from "react";

export type SetFn<TState> = (setter: Partial<TState> | ((current: Readonly<TState>) => Partial<TState>)) => void;
export type GetFn<TState> = () => TState;
export type SubscribeFn<TState> = (onChange: ListenerFn<TState>) => () => void;

export type UseStore<TState extends object> = {
    <TSelected extends unknown = TState>(selector?: (state: TState) => TSelected): Readonly<TSelected>;
    set: SetFn<TState>;
    get: GetFn<TState>;
    subscribe: SubscribeFn<TState>;
};

export type ListenerFn<TState> = (current: Readonly<TState>, previous: Readonly<TState>) => void;

/** Creates a store hook */
export function createStore<TState extends object>(initial: (set: SetFn<TState>, get: GetFn<TState>) => TState) {
    const listeners = new Set<ListenerFn<TState>>();

    const set: SetFn<TState> = (setter) => {
        const changed = setter instanceof Function ? setter(state) : setter;
        if (Object.is(changed, state)) return;
        const previous = state;
        state = Object.assign({}, state, changed);
        listeners.forEach((l) => l(state, previous));
    };

    const get: GetFn<TState> = () => {
        return state;
    };

    const initialState = initial(set, get);
    let state = initialState;

    function subscribe(onChange: ListenerFn<TState>) {
        listeners.add(onChange);
        return () => {
            listeners.delete(onChange);
        };
    }

    function getInitial() {
        return initialState;
    }

    function defaultSelector(state: TState) {
        return state;
    }

    function useStore<TSelected extends unknown = TState>(
        selector?: (state: TState) => TSelected,
    ): Readonly<TSelected> {
        const store = useSyncExternalStore(subscribe, get, getInitial);
        return (selector ?? defaultSelector)(store) as TSelected;
    }

    useStore.set = set;
    useStore.get = get;
    useStore.subscribe = subscribe;

    return useStore satisfies UseStore<TState>;
}
