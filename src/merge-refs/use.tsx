import { ForwardedRef } from "react";

export function useMergeRefs<T extends unknown>(...refs: ForwardedRef<T>[]): (instance: T | null) => void {
    return function (instance) {
        for (const ref of refs) {
            if (!ref) continue;

            if (ref instanceof Function) {
                ref(instance);
                continue;
            }

            ref.current = instance;
        }
    };
}
