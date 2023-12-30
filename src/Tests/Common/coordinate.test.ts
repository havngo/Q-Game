import { Coordinate } from "../../Common/coordinate";

describe("coordinate", () => {
    const coordinateOneTwo = new Coordinate(1, 2);
    const coordinateOneTwo_2 = new Coordinate(1, 2);
    const coordinateOneTwo_3 = new Coordinate(1, 2);
    const coordinateOneThree = new Coordinate(1, 3);
    const coordinateTwoTwo = new Coordinate(1, 3);
    const coordinateTwoThree = new Coordinate(2, 3);
    const coordinateNegativeOneThree = new Coordinate(-1, 3);

    test("compare coordinates", () => {
        expect(coordinateOneTwo.compare(coordinateOneTwo_2)).toBe(0);
        expect(coordinateOneTwo.compare(coordinateOneTwo_3)).toBe(0);
        expect(coordinateOneTwo.compare(coordinateOneThree)).toBeGreaterThan(0);
        expect(coordinateOneTwo.compare(coordinateTwoTwo)).toBeGreaterThan(0);
        expect(coordinateTwoThree.compare(coordinateOneTwo)).toBeLessThan(0);
        expect(coordinateNegativeOneThree.compare(coordinateOneTwo)).toBeLessThan(0);
        expect(coordinateNegativeOneThree.compare(coordinateTwoThree)).toBeLessThan(0);
    });

    describe("coordinate equality", () => {
        test("reflexive", () => {
            expect(coordinateOneTwo.equals(coordinateOneTwo)).toBe(true);
        });

        test("symmetric", () => {
            expect(coordinateOneTwo.equals(coordinateOneTwo_2)).toBe(true);
            expect(coordinateOneTwo_2.equals(coordinateOneTwo)).toBe(true);
        });

        test("transitive", () => {
            expect(coordinateOneTwo.equals(coordinateOneTwo_2)).toBe(true);
            expect(coordinateOneTwo_2.equals(coordinateOneTwo_3)).toBe(true);
            expect(coordinateOneTwo.equals(coordinateOneTwo_3)).toBe(true);
        });

        test("unequal coordinates", () => {
            expect(coordinateOneTwo.equals(coordinateTwoThree)).toBe(false);
            expect(coordinateOneTwo.equals(coordinateOneThree)).toBe(false);
            expect(coordinateOneTwo.equals(coordinateTwoTwo)).toBe(false);
        });
    });

    test("get string from coordinate", () => {
        expect(coordinateOneTwo.toString()).toBe("Coordinate(x: 1, y: 2)");
        expect(coordinateNegativeOneThree.toString()).toBe("Coordinate(x: -1, y: 3)");
    });

    test("toJson works as expected", () => {
        expect(new Coordinate(8, 6).toJson()).toEqual({ row: -6, column: 8 });
        expect(new Coordinate(3, 2).toJson()).toEqual({ row: -2, column: 3 });
        expect(new Coordinate(4, 8).toJson()).toEqual({ row: -8, column: 4 });
        expect(new Coordinate(-100, -56).toJson()).toEqual({ row: 56, column: -100 });
        expect(new Coordinate(98, -1000).toJson()).toEqual({ row: 1000, column: 98 });
    });
});
