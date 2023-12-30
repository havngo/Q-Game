import { Readable } from "stream";
import { JsonState, JsonActors } from "../Common/Types/json";
import { readInputFrom } from "./task-utils";
import { JsonBuilder } from "../Common/Json/json-builder";
import { runGame } from "../Referee/referee";

export async function xgames() {
    const testResults = await performXGamesTest(process.stdin);
    console.log(JSON.stringify(testResults));
}

export async function performXGamesTest(inputStream: Readable): Promise<[string[], string[]]> {
    const testInput = await readInputFrom(inputStream, 2);
    const [jState, jActors] = testInput as [JsonState, JsonActors];
    const playerNames = jActors.map((actor) => actor[0]);
    const gameState = JsonBuilder.toGameState(jState, playerNames);
    const players = jActors.map((actor) => JsonBuilder.toPlayer(actor));
    const { winners, cheaters } = await runGame(players, gameState);
    return [winners.sort(), cheaters];
}
