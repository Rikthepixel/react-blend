import React, { useCallback, useEffect, useReducer, useRef } from "react";
import {
  named,
  shallow,
  Except,
  Simplify,
  SetRequired,
  fluxReducer,
  FluxReducer,
} from "./helpers";

export type MaybePromise<T> = Promise<T> | T;
export type PromiseFactory<TProps, TData> = (
  props: TProps,
  signal: AbortSignal,
  // refetch: () => Promise<void>,
) => MaybePromise<TData>;

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
        hasError: boolean;
        error: null;
      }
    | {
        hasError: boolean;
        error: null;
      }
  );

export type PendingProps = {};

export type CatchProps = {
  retries: number;
  error: unknown;
};

export type WithAsyncOptions<TProps> = {
  /** @default `true` */
  showLoadingOnRefetch: boolean;

  /**
   * Default behaviour is to refetch when the props have shallowly changed
   */
  refetchOnPropsChange:
    | boolean
    | ((previous: TProps, current: TProps) => boolean);

  /** @default `null` */
  refetchOnInterval: number | null;

  /** @default `true` */
  refetchOnReconnect: boolean;

  /** @default `3` */
  retries: number;

  /** @default `1000` */
  retryTimeout: number;

  PendingComponent: React.ComponentType<PendingProps>;
  CatchComponent: React.ComponentType<CatchProps>;
};

function shouldRefetch<T extends object>(
  prev: T,
  curr: T,
  checkProps: boolean | ((previous: T, current: T) => boolean),
) {
  if (typeof checkProps === "boolean") return checkProps;
  return checkProps(prev, curr);
}

export function makeWithAsync(
  defaultOptions: SetRequired<
    Partial<WithAsyncOptions<object>>,
    "CatchComponent" | "PendingComponent"
  >,
) {
  return function <
    TProps extends object,
    const TResources extends keyof TProps,
  >(
    Component: React.ComponentType<TProps>,
    makePromise: PromiseFactory<
      Simplify<Except<TProps, TResources>>,
      Pick<TProps, TResources>
    >,
    partialOptions: Partial<
      WithAsyncOptions<Simplify<Except<TProps, TResources>>>
    > = {},
  ) {
    type Props = Simplify<Except<TProps, TResources>>;
    type Data = Pick<TProps, TResources>;

    const options: WithAsyncOptions<Props> = Object.assign(
      {
        retries: 3,
        retryTimeout: 1000,
        refetchOnPropsChange: shallow,
        refetchOnInterval: null,
        refetchOnReconnect: true,
        showLoadingOnRefetch: false,
      },
      defaultOptions,
      partialOptions,
    );
    const { PendingComponent, CatchComponent } = options;

    return named(`${Component.displayName}-withAsync`, function (props: Props) {
      const prevPropsRef = useRef<Props>(props);
      const currPropsRef = useRef<Props>(props);

      const [state, dispatch] = useReducer<FluxReducer<AsyncState<Data>>>(
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
        const promise = makePromise(currPropsRef.current, controller.signal);
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

      // Initial fetch & Refetch on change
      useEffect(() => {
        currPropsRef.current = props;
        if (
          state.hasData &&
          !shouldRefetch<Props>(
            prevPropsRef.current,
            props,
            options.refetchOnPropsChange,
          )
        ) {
          return () => {
            prevPropsRef.current = props;
          };
        }

        fetch();

        return () => {
          prevPropsRef.current = props;
        };
      }, [fetch, props]);

      // Refetch on interval
      useEffect(() => {
        if (!options.refetchOnInterval) return;
        const interval = setInterval(fetch, options.refetchOnInterval);
        return () => clearInterval(interval);
      }, [fetch, options.refetchOnInterval]);

      // Refetch on reconnect
      useEffect(() => {
        if (typeof window === "undefined") return;
        window.addEventListener("online", fetch);
        return () => window.removeEventListener("online", fetch);
      }, [fetch]);

      if (!state.isPending && state.hasError) {
        return <CatchComponent retries={state.retries} error={state.error} />;
      }

      if (state.isPending || !state.hasData) {
        return <PendingComponent />;
      }

      const newProps = {
        ...props,
        ...state.data,
      } as TProps;

      return <Component {...newProps} />;
    });
  };
}

const withAsync = makeWithAsync({
  PendingComponent() {
    return <></>;
  },
  CatchComponent() {
    return <></>;
  },
});

type User = {
  id: number;
  name: string;
};

type BaseFooProps = {
  user: User;
  baz: boolean;
};

function BaseFoo(props: BaseFooProps) {
  return <></>;
}

const Foo = withAsync<BaseFooProps, "user">(BaseFoo, async (props, signal) => {
  return {
    user: { id: 1, name: "RikThePixel" },
  };
});

<Foo baz />;
