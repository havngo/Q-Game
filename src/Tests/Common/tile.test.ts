import { Color, RegularTile, Shape, Tile } from "../../Common/tile";

describe("tile", () => {
    test("convert tiles to Json using toJson", () => {
        expect(new RegularTile(Color.RED, Shape.STAR).toJson()).toEqual({
            color: "red",
            shape: "star",
        });
        expect(new RegularTile(Color.RED, Shape.EIGHT_STAR).toJson()).toEqual({
            color: "red",
            shape: "8star",
        });
        expect(new RegularTile(Color.RED, Shape.SQUARE).toJson()).toEqual({
            color: "red",
            shape: "square",
        });
        expect(new RegularTile(Color.RED, Shape.CIRCLE).toJson()).toEqual({
            color: "red",
            shape: "circle",
        });
        expect(new RegularTile(Color.RED, Shape.CLOVER).toJson()).toEqual({
            color: "red",
            shape: "clover",
        });
        expect(new RegularTile(Color.RED, Shape.DIAMOND).toJson()).toEqual({
            color: "red",
            shape: "diamond",
        });
        expect(new RegularTile(Color.GREEN, Shape.STAR).toJson()).toEqual({
            color: "green",
            shape: "star",
        });
        expect(new RegularTile(Color.GREEN, Shape.EIGHT_STAR).toJson()).toEqual({
            color: "green",
            shape: "8star",
        });
        expect(new RegularTile(Color.GREEN, Shape.SQUARE).toJson()).toEqual({
            color: "green",
            shape: "square",
        });
        expect(new RegularTile(Color.GREEN, Shape.CIRCLE).toJson()).toEqual({
            color: "green",
            shape: "circle",
        });
        expect(new RegularTile(Color.GREEN, Shape.CLOVER).toJson()).toEqual({
            color: "green",
            shape: "clover",
        });
        expect(new RegularTile(Color.GREEN, Shape.DIAMOND).toJson()).toEqual({
            color: "green",
            shape: "diamond",
        });
        expect(new RegularTile(Color.BLUE, Shape.STAR).toJson()).toEqual({
            color: "blue",
            shape: "star",
        });
        expect(new RegularTile(Color.BLUE, Shape.EIGHT_STAR).toJson()).toEqual({
            color: "blue",
            shape: "8star",
        });
        expect(new RegularTile(Color.BLUE, Shape.SQUARE).toJson()).toEqual({
            color: "blue",
            shape: "square",
        });
        expect(new RegularTile(Color.BLUE, Shape.CIRCLE).toJson()).toEqual({
            color: "blue",
            shape: "circle",
        });
        expect(new RegularTile(Color.BLUE, Shape.CLOVER).toJson()).toEqual({
            color: "blue",
            shape: "clover",
        });
        expect(new RegularTile(Color.BLUE, Shape.DIAMOND).toJson()).toEqual({
            color: "blue",
            shape: "diamond",
        });
        expect(new RegularTile(Color.YELLOW, Shape.STAR).toJson()).toEqual({
            color: "yellow",
            shape: "star",
        });
        expect(new RegularTile(Color.YELLOW, Shape.EIGHT_STAR).toJson()).toEqual({
            color: "yellow",
            shape: "8star",
        });
        expect(new RegularTile(Color.YELLOW, Shape.SQUARE).toJson()).toEqual({
            color: "yellow",
            shape: "square",
        });
        expect(new RegularTile(Color.YELLOW, Shape.CIRCLE).toJson()).toEqual({
            color: "yellow",
            shape: "circle",
        });
        expect(new RegularTile(Color.YELLOW, Shape.CLOVER).toJson()).toEqual({
            color: "yellow",
            shape: "clover",
        });
        expect(new RegularTile(Color.YELLOW, Shape.DIAMOND).toJson()).toEqual({
            color: "yellow",
            shape: "diamond",
        });
        expect(new RegularTile(Color.ORANGE, Shape.STAR).toJson()).toEqual({
            color: "orange",
            shape: "star",
        });
        expect(new RegularTile(Color.ORANGE, Shape.EIGHT_STAR).toJson()).toEqual({
            color: "orange",
            shape: "8star",
        });
        expect(new RegularTile(Color.ORANGE, Shape.SQUARE).toJson()).toEqual({
            color: "orange",
            shape: "square",
        });
        expect(new RegularTile(Color.ORANGE, Shape.CIRCLE).toJson()).toEqual({
            color: "orange",
            shape: "circle",
        });
        expect(new RegularTile(Color.ORANGE, Shape.CLOVER).toJson()).toEqual({
            color: "orange",
            shape: "clover",
        });
        expect(new RegularTile(Color.ORANGE, Shape.DIAMOND).toJson()).toEqual({
            color: "orange",
            shape: "diamond",
        });
        expect(new RegularTile(Color.PURPLE, Shape.STAR).toJson()).toEqual({
            color: "purple",
            shape: "star",
        });
        expect(new RegularTile(Color.PURPLE, Shape.EIGHT_STAR).toJson()).toEqual({
            color: "purple",
            shape: "8star",
        });
        expect(new RegularTile(Color.PURPLE, Shape.SQUARE).toJson()).toEqual({
            color: "purple",
            shape: "square",
        });
        expect(new RegularTile(Color.PURPLE, Shape.CIRCLE).toJson()).toEqual({
            color: "purple",
            shape: "circle",
        });
        expect(new RegularTile(Color.PURPLE, Shape.CLOVER).toJson()).toEqual({
            color: "purple",
            shape: "clover",
        });
        expect(new RegularTile(Color.PURPLE, Shape.DIAMOND).toJson()).toEqual({
            color: "purple",
            shape: "diamond",
        });
    });

    test("compare tiles using compare", () => {
        const redStar = new RegularTile(Color.RED, Shape.STAR);
        expect(redStar.compare(redStar)).toEqual(0);

        const redEightStar = new RegularTile(Color.RED, Shape.EIGHT_STAR);
        expect(redStar.compare(redEightStar)).toBeLessThan(0);

        const redSquare = new RegularTile(Color.RED, Shape.SQUARE);
        expect(redStar.compare(redSquare)).toBeLessThan(0);
        expect(redEightStar.compare(redSquare)).toBeLessThan(0);

        const redCircle = new RegularTile(Color.RED, Shape.CIRCLE);
        expect(redStar.compare(redCircle)).toBeLessThan(0);
        expect(redEightStar.compare(redCircle)).toBeLessThan(0);
        expect(redSquare.compare(redCircle)).toBeLessThan(0);

        const redClover = new RegularTile(Color.RED, Shape.CLOVER);
        expect(redStar.compare(redClover)).toBeLessThan(0);
        expect(redEightStar.compare(redClover)).toBeLessThan(0);
        expect(redSquare.compare(redClover)).toBeLessThan(0);
        expect(redCircle.compare(redClover)).toBeLessThan(0);

        const redDiamond = new RegularTile(Color.RED, Shape.DIAMOND);
        expect(redStar.compare(redDiamond)).toBeLessThan(0);
        expect(redEightStar.compare(redDiamond)).toBeLessThan(0);
        expect(redSquare.compare(redDiamond)).toBeLessThan(0);
        expect(redCircle.compare(redDiamond)).toBeLessThan(0);
        expect(redClover.compare(redDiamond)).toBeLessThan(0);

        const greenStar = new RegularTile(Color.GREEN, Shape.STAR);
        expect(redStar.compare(greenStar)).toBeLessThan(0);
        expect(redEightStar.compare(greenStar)).toBeGreaterThan(0);
        expect(redSquare.compare(greenStar)).toBeGreaterThan(0);
        expect(redCircle.compare(greenStar)).toBeGreaterThan(0);
        expect(redClover.compare(greenStar)).toBeGreaterThan(0);
        expect(redDiamond.compare(greenStar)).toBeGreaterThan(0);

        const blueEightStar = new RegularTile(Color.BLUE, Shape.EIGHT_STAR);
        expect(redStar.compare(blueEightStar)).toBeLessThan(0);
        expect(redEightStar.compare(blueEightStar)).toBeLessThan(0);
        expect(redSquare.compare(blueEightStar)).toBeGreaterThan(0);
        expect(redCircle.compare(blueEightStar)).toBeGreaterThan(0);
        expect(redClover.compare(blueEightStar)).toBeGreaterThan(0);
        expect(redDiamond.compare(blueEightStar)).toBeGreaterThan(0);

        const yellowSquare = new RegularTile(Color.YELLOW, Shape.SQUARE);
        expect(redStar.compare(yellowSquare)).toBeLessThan(0);
        expect(redEightStar.compare(yellowSquare)).toBeLessThan(0);
        expect(redSquare.compare(yellowSquare)).toBeLessThan(0);
        expect(redCircle.compare(yellowSquare)).toBeGreaterThan(0);
        expect(redClover.compare(yellowSquare)).toBeGreaterThan(0);
        expect(redDiamond.compare(yellowSquare)).toBeGreaterThan(0);

        const orangeCircle = new RegularTile(Color.ORANGE, Shape.CIRCLE);
        expect(redStar.compare(orangeCircle)).toBeLessThan(0);
        expect(redEightStar.compare(orangeCircle)).toBeLessThan(0);
        expect(redSquare.compare(orangeCircle)).toBeLessThan(0);
        expect(redCircle.compare(orangeCircle)).toBeLessThan(0);
        expect(redClover.compare(orangeCircle)).toBeGreaterThan(0);
        expect(redDiamond.compare(orangeCircle)).toBeGreaterThan(0);

        const purpleClover = new RegularTile(Color.PURPLE, Shape.CLOVER);
        expect(redStar.compare(purpleClover)).toBeLessThan(0);
        expect(redEightStar.compare(purpleClover)).toBeLessThan(0);
        expect(redSquare.compare(purpleClover)).toBeLessThan(0);
        expect(redCircle.compare(purpleClover)).toBeLessThan(0);
        expect(redClover.compare(purpleClover)).toBeLessThan(0);
        expect(redDiamond.compare(purpleClover)).toBeGreaterThan(0);
    });
});
