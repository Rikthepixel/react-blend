import React from "react";

export type ComposeChain<TComponent extends React.ComponentType<object>> = {
  map<TNewComponent extends React.ComponentType<object>>(
    fn: (component: TComponent) => TNewComponent,
  ): ComposeChain<TNewComponent>;
  unwrap(): TComponent;
};

/** @inner */
type MapFn = (comp: React.ComponentType<object>) => React.ComponentType<object>;

/** @inner */
function composeWithTransforms<
  TTargetComponent extends React.ComponentType<object>,
>(
  component: React.ComponentType<object>,
  transforms: readonly MapFn[],
): ComposeChain<TTargetComponent> {
  return {
    map(fn) {
      return composeWithTransforms(component, [...transforms, fn]);
    },
    unwrap() {
      return transforms.reduce(
        (current, mapFn) => mapFn(current),
        component,
      ) as TTargetComponent;
    },
  };
}

export function compose<TComponent extends React.ComponentType<object>>(
  component: TComponent,
): ComposeChain<TComponent> {
  return composeWithTransforms(component, []);
}
