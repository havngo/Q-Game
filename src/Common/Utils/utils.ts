import { Bag } from "typescript-collections";

/**
 * Creates a copy of the given bag so that the original bag is not mutated
 *
 * @param originalBag the bag to copy
 * @returns a copy of the bag
 */
export function copyBag<T>(originalBag: Bag<T>): Bag<T> {
    const handCopy = new Bag<T>();
    originalBag.forEach(handCopy.add.bind(handCopy));
    return handCopy;
}

/**
 * Creates a bag from a given array without mutating the original array
 *
 * @param arr the array to construct a bag from
 * @returns a bag with all the items from the array
 */
export function arrayToBag<T>(arr: ReadonlyArray<T>): Bag<T> {
    const bag = new Bag<T>();
    arr.forEach((item) => bag.add(item));
    return bag;
}

/**
 * Waits for the given number of ms before resolving
 *
 * @param ms the number of ms to delay for
 */
export async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
