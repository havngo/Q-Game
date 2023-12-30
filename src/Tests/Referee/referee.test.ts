import { Coordinate } from "../../Common/coordinate";
import { GameState } from "../../Referee/game-state";
import { Board } from "../../Common/map";
import { PlayerState } from "../../Common/player-state";
import { RegularTile, Color, Shape } from "../../Common/tile";
import { Dag, Ldasg } from "../../Player/strategy";
import { Player } from "../../Player/player";
import { runGame } from "../../Referee/referee";
import { RandomTilePouch, TilePouch } from "../../Common/tile-pouch";
import { TurnType } from "../../Common/turn";

describe("Tests for the runGame function", () => {
    let players1: Player[];
    let players2: Player[];
    let gameState1: GameState;
    let gameState2: GameState;
    let players3: Player[];
    let gameState3: GameState;
    let players4: Player[];
    let gameState4: GameState;
    let players5: Player[];
    let gameState5: GameState;

    const illegalPlacement = {
        coordinate: new Coordinate(360, -8265),
        tile: new RegularTile(Color.RED, Shape.CLOVER),
    };

    beforeAll(() => {
        const board = new Board();
        board.addTile(new Coordinate(0, 0), new RegularTile(Color.RED, Shape.CIRCLE));
        const player1Id = "player1";
        const player2Id = "player2";
        const player1State = new PlayerState(player1Id);
        const player2State = new PlayerState(player2Id);
        const player1 = new Player(player1Id, new Dag());
        const player2 = new Player(player2Id, new Dag());
        player1State.addTiles([new RegularTile(Color.RED, Shape.CLOVER)]);
        player2State.addTiles([new RegularTile(Color.BLUE, Shape.EIGHT_STAR)]);
        const tilePouch1 = new RandomTilePouch.Factory().setTileCount(0).create();

        players1 = [player1, player2];
        gameState1 = new GameState.Factory()
            .setBoard(board)
            .addPlayerState(player1State)
            .addPlayerState(player2State)
            .setTilePouch(tilePouch1)
            .create();

        const player3State = new PlayerState(player1Id);
        const player4State = new PlayerState(player2Id);
        player3State.addTiles([new RegularTile(Color.ORANGE, Shape.EIGHT_STAR)]);
        player4State.addTiles([new RegularTile(Color.BLUE, Shape.SQUARE)]);

        players2 = [player1, player2];
        gameState2 = new GameState.Factory()
            .setBoard(board)
            .addPlayerState(player3State)
            .addPlayerState(player4State)
            .create();

        const player5State = new PlayerState(player1Id);
        players3 = [player1];
        gameState3 = new GameState.Factory().setBoard(board).addPlayerState(player5State).create();

        players4 = [];
        gameState4 = new GameState.Factory().setBoard(board).create();

        const board2 = new Board();
        board2.addTile(new Coordinate(0, 0), new RegularTile(Color.RED, Shape.CIRCLE));
        const player3Id = "player3";
        const player4Id = "player4";
        const player3 = new Player(player3Id, new Ldasg());
        const player4 = new Player(player4Id, new Ldasg());
        const player6State = new PlayerState(player3Id);
        const player7State = new PlayerState(player4Id);
        player6State.addTiles([new RegularTile(Color.RED, Shape.EIGHT_STAR)]);
        player7State.addTiles([new RegularTile(Color.BLUE, Shape.EIGHT_STAR)]);
        const tilePouch2 = new RandomTilePouch.Factory().setTileCount(0).create();

        players5 = [player3, player4];
        gameState5 = new GameState.Factory()
            .setBoard(board2)
            .addPlayerState(player6State)
            .addPlayerState(player7State)
            .setTilePouch(tilePouch2)
            .create();
    });

    // test("runGame ends when player places all tiles, and designated winner is correct", () => {
    //     const [player1, player2] = players1;
    //     const player1ActionSpy = jest.spyOn(player1, "takeTurn");
    //     const player2ActionSpy = jest.spyOn(player2, "takeTurn");
    //     const player1WinSpy = jest.spyOn(player1, "win");
    //     const { winners, cheaters } = runGame(players1, gameState1);
    //     expect(player1ActionSpy).toHaveLastReturnedWith({
    //         turnType: "place",
    //         tilePlacements: [
    //             {
    //                 coordinate: new Coordinate(0, 1),
    //                 tile: new RegularTile(Color.RED, Shape.CLOVER),
    //             },
    //         ],
    //     });
    //     expect(player2ActionSpy).toHaveLastReturnedWith({ turnType: "pass" });
    //     expect(player1WinSpy).toHaveBeenLastCalledWith(true);
    //     expect(winners).toEqual([player1.name()]);
    //     expect(cheaters).toHaveLength(0);
    // });

    test("Cheaters never win in life", () => {
        const [player1, player2] = players1;
        const player1ActionSpy = jest.spyOn(player1, "takeTurn");
        player1ActionSpy.mockReturnValueOnce({
            turnType: TurnType.PLACE,
            tilePlacements: [illegalPlacement],
        });
        const { winners, cheaters } = runGame(players1, gameState1);
        expect(winners).toEqual([player2.name()]);
        expect(cheaters).toEqual([player1.name()]);
    });

    test("Game ends when all players pass and replace", () => {
        const [player1, player2] = players2;
        const player1ActionSpy = jest.spyOn(player1, "takeTurn");
        const player2ActionSpy = jest.spyOn(player2, "takeTurn");
        const { winners, cheaters } = runGame(players2, gameState2);
        expect(player1ActionSpy).toHaveLastReturnedWith({ turnType: "exchange" });
        expect(player2ActionSpy).toHaveLastReturnedWith({ turnType: "exchange" });
        expect(winners).toHaveLength(2);
        expect(winners).toContainEqual(player1.name());
        expect(winners).toContainEqual(player2.name());
        expect(cheaters).toHaveLength(0);
    });

    test("Game ends when the last player is removed", () => {
        const [player1] = players3;
        const player1ActionSpy = jest.spyOn(player1, "takeTurn");
        player1ActionSpy.mockReturnValueOnce({
            turnType: TurnType.PLACE,
            tilePlacements: [illegalPlacement],
        });
        const { winners, cheaters } = runGame(players3, gameState3);
        expect(winners).toHaveLength(0);
        expect(cheaters).toEqual([player1.name()]);
    });

    test("Game ends immediately when there are no players", () => {
        const { winners, cheaters } = runGame(players4, gameState4);
        expect(winners).toHaveLength(0);
        expect(cheaters).toHaveLength(0);
    });

    // test("Second player plays on a game state that reflects the changes from the first player's action", () => {
    //     const [player1, player2] = players5;
    //     const player1ActionSpy = jest.spyOn(player1, "takeTurn");
    //     const player2ActionSpy = jest.spyOn(player2, "takeTurn");
    //     const { winners, cheaters } = runGame(players5, gameState5);
    //     expect(player1ActionSpy).toHaveLastReturnedWith({
    //         turnType: "place",
    //         tilePlacements: [
    //             {
    //                 coordinate: new Coordinate(0, 1),
    //                 tile: new RegularTile(Color.RED, Shape.EIGHT_STAR),
    //             },
    //         ],
    //     });
    //     expect(player2ActionSpy).toHaveLastReturnedWith({
    //         turnType: "place",
    //         tilePlacements: [
    //             {
    //                 coordinate: new Coordinate(0, 2),
    //                 tile: new RegularTile(Color.BLUE, Shape.EIGHT_STAR),
    //             },
    //         ],
    //     });
    //     expect(winners).toHaveLength(1);
    //     expect(winners).toContainEqual(player2.name());
    //     expect(cheaters).toHaveLength(0);
    // });

    test("Throws an error if given a list of players that does not reflect the players of the game state", () => {
        expect(() => runGame(players4, gameState5)).toThrowError();
        expect(() => runGame(players5, gameState1)).toThrowError();
    });
});
