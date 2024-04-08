import React, { ComponentProps } from "react";
import { makeWithAsync } from "./async/with";
import { compose } from ".";

const withAsync = makeWithAsync({
    PendingComponent() {
        return <></>;
    },
    CatchComponent() {
        return <></>;
    },
});

type User = {
    id: number;
    name: string;
};

type BaseFooProps = {
    user: User;
    foo: boolean;
};

function BaseFoo(props: BaseFooProps) {
    return <></>;
}

const Foo = compose(BaseFoo)
    .map((c) =>
        withAsync<ComponentProps<typeof c>, "user">(c, async (props, signal) => {
            return {
                user: { id: 1, name: "RikThePixel" },
            };
        }),
    )
    .build();

type FooProps = ComponentProps<typeof Foo>;
