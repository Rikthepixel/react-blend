import React from "react";

export type ComposeChain<TComponent extends React.ComponentType<object>> = {
    /**
     * Apply a transformation to the given component and map it into a new one
     */
    map<TNewComponent extends React.ComponentType<object>>(
        fn: (component: TComponent) => TNewComponent,
    ): ComposeChain<TNewComponent>;

    /**
     * Apply all the map functions to the component
     */
    build(): TComponent;
};

/** @inner */
type MapFn = (comp: React.ComponentType<object>) => React.ComponentType<object>;

/** @inner */
function composeWithTransforms<TTargetComponent extends React.ComponentType<object>>(
    component: React.ComponentType<object>,
    transforms: readonly MapFn[],
): ComposeChain<TTargetComponent> {
    return {
        map(fn) {
            return composeWithTransforms(component, [...transforms, fn]);
        },

        build() {
            return transforms.reduce((current, mapFn) => mapFn(current), component) as TTargetComponent;
        },
    };
}

/**
 * Utility function that allows for more readable chaining of HOC wrappings.
 *
 * @example Usage
 * ```ts
 * const SomeComponentWithDefault = compose(SomeComponent)
 *    .map((c) => withDefault(c, { foo: true }))
 *    .unwrap
 * ```
 */
export function compose<TComponent extends React.ComponentType<object>>(
    component: TComponent,
): ComposeChain<TComponent> {
    return composeWithTransforms(component, []);
}
