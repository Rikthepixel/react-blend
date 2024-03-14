import React, { useContext } from "react";
import { named } from "./helpers";

function containsSet(baseline: Set<string>, expected: Set<string>): boolean {
  if (baseline.size < expected.size) return false;

  for (const expectedItem of expected) {
    if (!baseline.has(expectedItem)) {
      return false;
    }
  }

  return true;
}

const FlagContext = React.createContext<Set<string>>(null);

export type FlagProviderProps = {
  /**
   * Enabled feature flags
   */
  flags: string[];
  children: React.ReactNode;
};

/**
 * Provides the flags that are currently supported.
 */
export function FlagProvider(props: FlagProviderProps) {
  const flags = new Set(props.flags);
  return <FlagContext.Provider value={flags} children={props.children} />;
}

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
    const enabled = useContext(FlagContext);
    if (!enabled && !containsSet(enabled, expected)) return <></>;
    return <Component {...props} />;
  });
}
