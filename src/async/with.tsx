import React from "react";
import { named, Except, Simplify } from "../helpers";
import { PromiseFactory, UseAsyncOptions, useAsync } from "./use";

export type PendingProps = {};

export type CatchProps = {
  retries: number;
  error: unknown;
};

export type WithAsyncOptions<TVars extends object> = UseAsyncOptions<TVars> & {
  PendingComponent: React.ComponentType<PendingProps>;
  CatchComponent: React.ComponentType<CatchProps>;
};

export function makeWithAsync(defaultOptions: WithAsyncOptions<object>) {
  return function <
    TProps extends object,
    const TAsyncPropKeys extends keyof TProps,
    TPropsWithoutAsyncProps extends object = Simplify<
      Except<TProps, TAsyncPropKeys>
    >,
    TAsyncProps extends object = Pick<TProps, TAsyncPropKeys>,
  >(
    Component: React.ComponentType<TProps>,
    makePromise: PromiseFactory<TPropsWithoutAsyncProps, TAsyncProps>,
    partialOptions?: Partial<WithAsyncOptions<TPropsWithoutAsyncProps>>,
  ) {
    const options: WithAsyncOptions<TPropsWithoutAsyncProps> = Object.assign(
      {},
      defaultOptions,
      partialOptions ?? {},
    );
    const { PendingComponent, CatchComponent } = options;

    return named(
      `${Component.displayName}-withAsync`,
      function (props: TPropsWithoutAsyncProps) {
        const state = useAsync(makePromise, props, options);

        if (!state.isPending && state.hasError) {
          return <CatchComponent retries={state.retries} error={state.error} />;
        }

        if (state.isPending || !state.hasData) {
          return <PendingComponent />;
        }

        const newProps = {
          ...props,
          ...state.data,
        } as unknown as TProps;

        return <Component {...newProps} />;
      },
    );
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
