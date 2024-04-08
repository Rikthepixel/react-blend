import React from "react";
import { named } from "../helpers";
import { useFlag } from "./use";

/**
 * Prevents the `Component` from being rendered if the `expectedFlags` are not contained in the enabled flags.
 *
 * If there is no `FlagProvider` higher up in the component hierarchy this component will *not* render.
 *
 * @param Component - The component to guard
 * @param expectedFlags - A list of flags that all need to be enabled for this component to be able to render
 */
export function withFlag<TProps extends object>(
    Component: React.ComponentType<TProps>,
    expectedFlags: string[],
): React.FC<TProps> {
    const expected = new Set(expectedFlags);

    return named(`${Component.displayName}-withFlag`, function (props) {
        const enabled = useFlag(expected);
        if (!enabled) return <></>;
        return <Component {...props} />;
    });
}
