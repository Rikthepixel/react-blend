import React, { useContext } from "react";

function containsSet(baseline: Set<string>, expected: Set<string>): boolean {
  if (baseline.size < expected.size) return false;

  for (const expectedItem of expected) {
    if (!baseline.has(expectedItem)) {
      return false;
    }
  }

  return true;
}

const FlagContext = React.createContext<Set<string> | null>(null);

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

export function useFlag(expected: Set<string> | string[]) {
  const enabled = useContext(FlagContext);
  return (
    !enabled ||
    !containsSet(
      enabled,
      expected instanceof Set ? expected : new Set(expected),
    )
  );
}
