import { useCallback, useEffect, useReducer, useRef } from "react";
import { FluxReducer, MaybePromise, fluxReducer, shallow } from "../helpers";

type AsyncState<T> = {
  retries: number;
  isPending: boolean;
  controller?: AbortController;
} & (
  | {
      hasData: true;
      data: T;
    }
  | {
      hasData: false;
      data: null;
    }
) &
  (
    | {
        hasError: true;
        error: unknown;
      }
    | {
        hasError: false;
        error: null;
      }
  );

export type PromiseFactory<TVars, TData> = (
  vars: TVars,
  signal: AbortSignal,
  // refetch: () => Promise<void>,
) => MaybePromise<TData>;

export type UseAsyncOptions<TVars> = {
  /** @default `true` */
  showLoadingOnRefetch?: boolean;

  /**
   * Default behaviour is to refetch when the vars have shallowly changed
   */
  refetchOnVarsChange?:
    | boolean
    | ((previous: TVars, current: TVars) => boolean);

  /** @default `null` */
  refetchOnInterval?: number | null;

  /** @default `true` */
  refetchOnReconnect?: boolean;

  /** @default `3` */
  retries?: number;

  /** @default `1000` */
  retryTimeout?: number;
};

export function useAsync<TVars extends object, TData>(
  makePromise: PromiseFactory<TVars, TData>,
  variables: TVars,
  options?: UseAsyncOptions<TVars>,
): Readonly<AsyncState<TData>> {
  const prevVarsRef = useRef<TVars>(variables);
  const currVarsRef = useRef<TVars>(variables);

  const [state, dispatch] = useReducer<FluxReducer<AsyncState<TData>>>(
    fluxReducer,
    {
      hasError: false,
      error: null,
      retries: 0,
      hasData: false,
      data: null,
      isPending: true,
    },
  );

  const fetch = useCallback(() => {
    state.controller?.abort();
    const controller = new AbortController();
    const promise = makePromise(currVarsRef.current, controller.signal);
    dispatch({ isPending: true, controller });

    Promise.resolve(promise)
      .then((data) => {
        dispatch({ isPending: false, hasData: true, data });
      })
      .catch((error) => {
        dispatch({ isPending: false, hasError: true, error });
        // TODO retry logic
      });
  }, [dispatch]);

  useEffect(() => {
    currVarsRef.current = variables;
    return () => {
      prevVarsRef.current = variables;
    };
  });

  // Initial fetch & Refetch on change
  useEffect(() => {
    const shouldRefetch = options?.refetchOnVarsChange ?? shallow;

    if (
      state.hasData &&
      !(shouldRefetch instanceof Function
        ? shouldRefetch(prevVarsRef.current, currVarsRef.current)
        : shouldRefetch)
    ) {
      return;
    }

    fetch();
  }, [fetch, variables]);

  // Refetch on interval
  useEffect(() => {
    if (!options?.refetchOnInterval) return;
    const interval = setInterval(fetch, options?.refetchOnInterval);
    return () => clearInterval(interval);
  }, [fetch, options?.refetchOnInterval]);

  // Refetch on reconnect
  useEffect(() => {
    const refetchOnReconnect = options?.refetchOnReconnect ?? true;
    if (!refetchOnReconnect || typeof window === "undefined") return;
    window.addEventListener("online", fetch);
    return () => window.removeEventListener("online", fetch);
  }, [fetch, options?.refetchOnReconnect]);

  return state;
}
