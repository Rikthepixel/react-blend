import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compose } from "./index";
import { withDefault } from "./withDefault";
import { withVisibility } from "./withVisibility";
import { makeWithRedirect } from "./withRedirect";
import { FlagProvider, withFlag } from "./withFlag";
import { makeWithStore } from "./withStore";

const withRedirect = makeWithRedirect(() => {
  return (to) => {};
});

const withBarStore = makeWithStore(() => ({
  user: { id: 1, name: "", job: "" },
}));

interface AppProps {
  foo: boolean;
  user: { id: number; name: string };
}

function BaseApp(props: AppProps) {
  return <></>;
}

const App = compose(BaseApp)
  .map((c) => withFlag(c, ["v2"]))
  .map((c) => withRedirect(c, "/hello-world", (props) => props.foo))
  .map((c) => withVisibility(c, (props) => props.foo))
  .map((c) => withDefault(c, { foo: true }))
  .map((c) => withBarStore(c))
  .unwrap();

renderToStaticMarkup(
  <FlagProvider flags={["v2", "translations"]}>
    <App />
  </FlagProvider>,
);
