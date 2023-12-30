import { Color, RegularTile, Shape, Tile } from "../../Common/tile";
import { RandomTilePouch, TilePouch } from "../../Common/tile-pouch";

const SEED = 12345;

describe("tile pouch", () => {
    let tilePouch: TilePouch;
    beforeAll(() => {
        tilePouch = new RandomTilePouch(SEED);
    });

    test("get three random seeded tiles", () => {
        const randomTile1 = tilePouch.takeOne();
        const expectedRandomTile1 = new RegularTile(Color.GREEN, Shape.EIGHT_STAR);
        expect(randomTile1).toEqual(expectedRandomTile1);
        const randomTile2 = tilePouch.takeOne();
        const expectedRandomTile2 = new RegularTile(Color.GREEN, Shape.CLOVER);
        expect(randomTile2).toEqual(expectedRandomTile2);
        const randomTile3 = tilePouch.takeOne();
        const expectedRandomTile3 = new RegularTile(Color.PURPLE, Shape.EIGHT_STAR);
        expect(randomTile3).toEqual(expectedRandomTile3);
    });
});
