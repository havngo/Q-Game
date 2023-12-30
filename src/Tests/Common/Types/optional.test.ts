import { Optional } from "../../../Common/Types/optional";

describe("tests for optional", () => {
    test("correctly creates an optional with data and an empty optional", () => {
        const data = { complex: "structure", several: "fields" };
        const optional = Optional.with(data);
        expect(optional.hasValue()).toBeTruthy();
        expect(optional.value).toEqual(data);
        const empty = Optional.withNoData();
        expect(empty.hasValue()).toBeFalsy();
        expect(() => empty.value).toThrow(Error);
    });
});
