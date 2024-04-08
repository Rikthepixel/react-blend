import React from "react";
import { RequiredKeysOf, SetOptional, named } from "../helpers";

export function withDefault<TProps extends object, const TDefaults extends Partial<TProps>>(
    Component: React.ComponentType<TProps>,
    defaultProps: TDefaults,
): React.FC<SetOptional<TProps, Extract<RequiredKeysOf<TDefaults>, keyof TProps>>> {
    return named(`${Component.displayName}-withDefault`, function (props) {
        const newProps = { ...defaultProps, ...props } as unknown as TProps;
        return <Component {...newProps} />;
    });
}
