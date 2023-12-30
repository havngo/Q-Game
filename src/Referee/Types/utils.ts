/**
 * Creates a callback which rejects promises which take longer than the given number of milliseconds.
 * Otherwise, the promise is resolved when the resulting callback is called.
 *
 * @param ms the number of milliseconds to wait for responses
 * @returns a callback which resolves the given promise within the given number of milliseconds
 *          or rejects it if it takes longer.
 */
export function resolveWithinMs(ms: number) {
    return async <T>(promise: Promise<T>) => {
        let rejectionTimeout: NodeJS.Timeout;
        const timeoutPromise: Promise<T> = new Promise((_, reject) => {
            rejectionTimeout = setTimeout(reject, ms, `Unable to resolve within ${ms}ms`);
        });
        promise.finally(() => clearTimeout(rejectionTimeout));
        return await Promise.race([promise, timeoutPromise]);
    };
}
