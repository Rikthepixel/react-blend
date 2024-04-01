import React from "react";
import { named } from "../helpers";

/**
 * Creates a `withRedirect` HOC, with the given `redirectEngine`.
 *
 * @param {() => (to: string) => void} useRedirectEngine is a hook that returns a redirect engine. The engine is dependant on your router. Wether you use react-router-dom or wouter shouldn't matter.
 */
export function makeWithRedirect(
  useRedirectEngine: () => (to: string) => void,
) {
  return function <TProps extends object>(
    Component: React.ComponentType<TProps>,
    to: string,
    useDecideRedirect: (props: TProps) => boolean,
  ): React.FC<TProps> {
    return named(`${Component.displayName}-withRedirect`, function (props) {
      const redirect = useDecideRedirect(props);
      const engine = useRedirectEngine();
      if (!redirect) {
        engine(to);
        return <></>;
      }
      return <Component {...props} />;
    });
  };
}
