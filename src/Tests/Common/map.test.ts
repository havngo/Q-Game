import { Board } from "../../Common/map";
import { Coordinate } from "../../Common/coordinate";
import { Color, RegularTile, Shape } from "../../Common/tile";
import { ALL_TILES } from "../../Tasks/task-utils";
import { Optional } from "../../Common/Types/optional";

describe("board", () => {
    test("get adjacent tiles", () => {
        const redStar = new RegularTile(Color.RED, Shape.STAR);
        const blueStar = new RegularTile(Color.BLUE, Shape.STAR);
        const greenStar = new RegularTile(Color.GREEN, Shape.STAR);
        const purpleStar = new RegularTile(Color.PURPLE, Shape.STAR);

        const board = new Board()
            .addTile(new Coordinate(0, 1), redStar)
            .addTile(new Coordinate(1, 0), blueStar)
            .addTile(new Coordinate(0, -1), greenStar)
            .addTile(new Coordinate(-1, 0), purpleStar);

        let adjacentTiles = board.getAdjacentCells(new Coordinate(0, 0));
        expect(adjacentTiles.top).toEqual(Optional.with(redStar));
        expect(adjacentTiles.right).toEqual(Optional.with(blueStar));
        expect(adjacentTiles.bottom).toEqual(Optional.with(greenStar));
        expect(adjacentTiles.left).toEqual(Optional.with(purpleStar));

        adjacentTiles = board.getAdjacentCells(new Coordinate(1, 1));
        expect(adjacentTiles.top).toEqual(Optional.withNoData());
        expect(adjacentTiles.right).toEqual(Optional.withNoData());
        expect(adjacentTiles.bottom).toEqual(Optional.with(blueStar));
        expect(adjacentTiles.left).toEqual(Optional.with(redStar));
    });

    test("toJson behaves as expected", () => {
        const { redStar, redCircle, purpleStar, orange8star, blueDiamond, blueStar, blue8star } =
            ALL_TILES;
        const board = new Board()
            .addTile(new Coordinate(-8, 8), redStar)
            .addTile(new Coordinate(0, 0), redCircle)
            .addTile(new Coordinate(0, 2), purpleStar)
            .addTile(new Coordinate(1, 0), orange8star)
            .addTile(new Coordinate(1, 1), blueDiamond)
            .addTile(new Coordinate(1, 2), blueStar)
            .addTile(new Coordinate(2, 2), blue8star);
        const actualResult = board.toJson();
        const expectedResult = [
            [-8, [-8, { color: "red", shape: "star" }]],
            [
                -2,
                [0, { color: "purple", shape: "star" }],
                [1, { color: "blue", shape: "star" }],
                [2, { color: "blue", shape: "8star" }],
            ],
            [-1, [1, { color: "blue", shape: "diamond" }]],
            [0, [0, { color: "red", shape: "circle" }], [1, { color: "orange", shape: "8star" }]],
        ];
        expect(actualResult).toEqual(expectedResult);
    });
});
