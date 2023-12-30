/**
 * Represents an array of at least one element
 */
export type AtLeastOne<T> = [T, ...T[]] | [...T[], T];

/**
 * Checks if the given array has at least one element
 *
 * @param array the array to check
 * @returns wether or not the array has at least one element
 */
export function hasAtLeastOneElem<T>(array: T[]): array is AtLeastOne<T> {
    return array.length > 0;
}

/**
 * Represents a string which corresponds to a method of the given type
 */
export type MethodsOf<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];

/**
 * Represents a string which corresponds to a method of the given type
 * which returns a promise.
 */
export type AsyncMethodsOf<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => Promise<any> ? K : never;
}[keyof T];
