import { GameState } from "../Referee/game-state";
import { JsonBuilder } from "../Common/Json/json-builder";
import { JsonMap } from "../Common/Types/json";
import { Readable } from "stream";
import { JsonPlacements } from "../Common/Types/json";
import { readInputFrom } from "./task-utils";
import { PlayerState } from "../Common/player-state";

export async function xscore() {
    const testResults = await performXScoreTest(process.stdin);
    console.log(testResults);
}

export async function performXScoreTest(inputStream: Readable): Promise<any> {
    const result = await readInputFrom(inputStream, 2);
    const [jMap, jPlacements] = result as [JsonMap, JsonPlacements];

    const board = JsonBuilder.toBoard(jMap);

    // create playerState with tiles
    const playerId = "TEST CASE PLAYER ID YUHHHHH 💯💯🔥🥶💰💸💪💪";
    const playerState = new PlayerState(playerId);
    const placements = JsonBuilder.toPlacementArray(jPlacements);
    const tiles = placements.map((placement) => placement.tile);
    playerState.addTiles(tiles);

    // create gameState
    const gameStateTestFactory = new GameState.Factory();
    const gameState = gameStateTestFactory.setBoard(board).addPlayerState(playerState).create();
    gameState.startRound();
    const placementsToScore = JsonBuilder.toPlacementArray(jPlacements);

    return gameState.calculateScoreForPlaceTurn(placementsToScore);
}
