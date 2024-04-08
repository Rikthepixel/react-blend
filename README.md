# react-blend

A blend of useful higher order components (hocs) and hooks.
On top of that it provides a TypeScript flavored compose function for easier component composition with hocs.

-   [Goals](#goals)
-   [Why use higher order components?](#why-still-use-higher-order-components)
-   [Planned HOCs and hooks](#planned-hocs-and-hooks)

## Goals

-   100% type-safe
-   Easy component composition
-   ESM and CJS supported
-   Well-tested

## Why still use higher order components?

With the introduction of hooks many React developers have considered higher order components to be obsolite.
Hooks make components very composable, however a role that hooks can't fulfill is the role of a being a guard.

In many applications I've found it to be useful for encapsulating loading and error states.
Just wrap a component with `withAsync` and you don't have to worry about a variable being nullable/undefined or not being available yet.

I've found it useful to define these states as _"unwanted states"_.
What you really care about is to render the component, show the information, not to handle these undesired states.

Many components could be wrapped with a guard:

-   Don't want to render a component based on a feature flags? `withFlag` has got you covered!
-   Don't want to render a component based on a prop? No worries, `withVisibility` is your guy!
-   Don't want to render a component and redirect based on a prop? `withRedirect` will serve you well!
-   Don't want to deal with async pending- and loading- states? `withAsync` handles it for you!

**Friendly reminder that they still come with the disadvantage of being harder to debug compared to hooks.
So use higher order components when it is useful to decrease complexity in an application.**

## Planned HOCs and Hooks

-   `withReactQuery` - Not unlike `withAsync` but using React/Tanstack query for caching and fetching. Very convenient, have used it in the past. This might be contained in a separate package since it needs a peer-dependency to tanstack query.
-   `withParams` - Take-in query/route params, `UrlSearchParams`, etc. and validate them. If they aren't valid don't show the component. Prevents invalid route states.

## API reference

### Compose

#### Example

```tsx
import { compose } from "react-blend";
import { withDefault } from "react-blend/default";

// You can use compose with any higher order component
import { connect } from "react-redux";

type MessageBubbleProps = {
    side: "left" | "right";
    content: string;
};

function MessageBubble(props: MessageBubbleProps) {
    return <>{/* Display something beautiful */}</>;
}

const LeftMessageBubble = compose(MessageBubble)
    .map((component) => withDefault(component, { side: "left" }))
    // Can be used with other libraries' HOCs, like Redux (example below)
    .map(connect(mapState))
    .build();
```

**Note: Personally I discourage the usage of HOCs that simply provide stores, hooks are far better for something like that.
Anything that requires encapsulation of unwanted state has a reasonable reason for being a HOC.**

### Default

#### HOC

### Visibility

#### Hook

#### HOC

### Redirect

#### Hook

#### HOC

### Flag

#### Hook

#### HOC

### Store

#### Hook

### Async

#### Hook

#### HOC
