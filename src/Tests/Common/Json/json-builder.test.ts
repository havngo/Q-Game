import { JsonMap } from "../../../Common/Types/json";
import { Coordinate } from "../../../Common/coordinate";
import { JsonBuilder } from "../../../Common/Json/json-builder";
import { Board } from "../../../Common/map";
import { Color, Shape, RegularTile } from "../../../Common/tile";
import { ALL_TILES } from "../../../Tasks/task-utils";

describe("json builder", () => {
    test("can build to coordinate", () => {
        expect(JsonBuilder.toCoordinate({ row: 1, column: 0 })).toEqual(new Coordinate(0, -1));
        expect(JsonBuilder.toCoordinate({ row: 10, column: -20 })).toEqual(
            new Coordinate(-20, -10)
        );
        expect(JsonBuilder.toCoordinate({ row: -52, column: 5 })).toEqual(new Coordinate(5, 52));
        expect(JsonBuilder.toCoordinate({ row: -32, column: -4 })).toEqual(new Coordinate(-4, 32));
    });

    test("can build to tile", () => {
        expect(JsonBuilder.toTile({ color: Color.ORANGE, shape: Shape.CLOVER })).toEqual(
            new RegularTile(Color.ORANGE, Shape.CLOVER)
        );
        expect(JsonBuilder.toTile({ color: Color.PURPLE, shape: Shape.DIAMOND })).toEqual(
            new RegularTile(Color.PURPLE, Shape.DIAMOND)
        );
        expect(JsonBuilder.toTile({ color: Color.GREEN, shape: Shape.EIGHT_STAR })).toEqual(
            new RegularTile(Color.GREEN, Shape.EIGHT_STAR)
        );
    });

    test("can build to board", () => {
        const { blueStar, blueDiamond, redStar, red8star, greenCircle, purpleCircle } = ALL_TILES;
        const expectedBoard = new Board()
            .addTile(new Coordinate(1, 2), blueStar)
            .addTile(new Coordinate(1, 3), blueDiamond)
            .addTile(new Coordinate(2, 2), redStar)
            .addTile(new Coordinate(2, 1), red8star)
            .addTile(new Coordinate(2, 4), greenCircle)
            .addTile(new Coordinate(3, 4), purpleCircle);

        const jsonMapInput = [
            [
                -4,
                [2, { color: "green", shape: "circle" }],
                [3, { color: "purple", shape: "circle" }],
            ],
            [-3, [1, { color: "blue", shape: "diamond" }]],
            [-2, [1, { color: "blue", shape: "star" }], [2, { color: "red", shape: "star" }]],
            [-1, [2, { color: "red", shape: "8star" }]],
        ];
        const actualBoard = JsonBuilder.toBoard(jsonMapInput as JsonMap);
        expect(actualBoard).toEqual(expectedBoard);
    });
});
