import React from "react";
import { named } from "../helpers";

export function withVisibility<TProps extends object>(
  Component: React.ComponentType<TProps>,
  useDecideVisibility: (props: TProps) => boolean,
): React.FC<TProps> {
  return named(`${Component.displayName}-withVisibility`, function (props) {
    const visibility = useDecideVisibility(props);
    if (!visibility) return <></>;
    return <Component {...props} />;
  });
}
