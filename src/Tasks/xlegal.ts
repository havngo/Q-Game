import { GameState } from "../Referee/game-state";
import { JsonBuilder } from "../Common/Json/json-builder";
import { Readable } from "stream";
import { readInputFrom } from "./task-utils";
import { RandomTilePouch } from "../Common/tile-pouch";
import { JsonPub, JsonPlacements, JsonMap } from "../Common/Types/json";
import { PlayerState } from "../Common/player-state";
import { ImmutableBoard } from "../Common/map";
import { TurnType } from "../Common/turn";
import { TurnAction } from "../Player/Types/types";

export async function xlegal() {
    const testResults = await performXLegalTest(process.stdin);
    if (testResults === false) {
        console.log(false);
    } else {
        console.log(JSON.stringify(testResults));
    }
}

export async function performXLegalTest(inputStream: Readable): Promise<JsonMap | false> {
    const result = await readInputFrom(inputStream, 2);
    const [jPub, jPlacements] = result as [JsonPub, JsonPlacements];

    let board: ImmutableBoard;
    try {
        board = JsonBuilder.toBoard(jPub.map);
    } catch {
        return false;
    }

    const tilePouchFactory = new RandomTilePouch.Factory();
    const tilePouch = tilePouchFactory.setTileCount(jPub["tile*"]).create();

    // create playerState with tiles
    const playerId = "player1";
    const playerState = new PlayerState(playerId);
    const firstPlayer = jPub.players[0];
    const tiles = firstPlayer["tile*"].map((jsonTile) => JsonBuilder.toTile(jsonTile));
    playerState.addTiles(tiles);

    // create gameState
    const gameStateTestFactory = new GameState.Factory();
    const gameState = gameStateTestFactory
        .setBoard(board)
        .addPlayerState(playerState)
        .setTilePouch(tilePouch)
        .create();
    gameState.startRound();
    const placements = JsonBuilder.toPlacementArray(jPlacements);
    const placeTurn: TurnAction = {
        turnType: TurnType.PLACE,
        tilePlacements: placements,
    };
    const legalTurn = gameState.isTurnLegal(placeTurn);

    // visualizeBoard(gameState);

    if (!legalTurn) {
        return false;
    } else {
        gameState.completeTurn(placeTurn);
        const { map: mapResult } = gameState.getPublicState(playerId);
        return mapResult.toJson();
    }
}
