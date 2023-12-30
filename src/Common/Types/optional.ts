/**
 * Represents data which may or may not be present.
 */
export abstract class Optional<T> {
    protected constructor(private readonly hasData: boolean) {}

    /**
     * Creates an optional with the given data.
     *
     * @param data the data to store
     * @returns an optional with the data
     */
    static with<T>(data: T): Optional<T> {
        return new ValueOptional(data);
    }

    /**
     * Creates an optional that contains no data.
     *
     * @param errorMessage an optional error message to throw if the optional is accessed
     * @returns an empty optional
     */
    static withNoData<T>(errorMessage?: string): Optional<T> {
        return new EmptyOptional(errorMessage);
    }

    /**
     * Determines whether this optional has data to return.
     *
     * @returns true if the optional has data, false otherwise
     */
    hasValue(): boolean {
        return this.hasData;
    }

    /**
     * Gets the data stored in this optional.
     * @throws if the optional has no data
     */
    abstract get value(): T;

    /**
     * Returns the first optional that has data.
     *
     * @param otherCallback a callback to compute the other optional to consider
     * @returns either this optional or the other optional which is computed by the callback
     */
    abstract or(otherCallback: () => Optional<T>): Optional<T>;
}

/**
 * An instance of optional with a value.
 */
class ValueOptional<T> extends Optional<T> {
    constructor(private readonly data: T) {
        super(true);
    }

    get value(): T {
        return this.data;
    }

    or(_: () => Optional<T>): Optional<T> {
        return this;
    }
}

/**
 * An instance of option that is empty
 */
class EmptyOptional<T> extends Optional<T> {
    private readonly errorMessage: string;

    constructor(errorMessage?: string) {
        super(false);
        this.errorMessage = errorMessage ?? "Accessing value from empty optional";
    }

    get value(): T {
        throw new Error(this.errorMessage);
    }

    or(otherCallback: () => Optional<T>): Optional<T> {
        return otherCallback();
    }
}
