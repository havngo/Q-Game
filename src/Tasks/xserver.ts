import { Readable } from "stream";
import { getCommandLineArg, readInputFrom } from "./task-utils";
import { RefereeConfig, RefereeStateConfig, ServerConfig } from "../Common/Types/json";
import {
    GAME_STATE_CONSTANTS as gsConfig,
    SERVER_CONFIGURATIONS as rcConfig,
} from "../Common/Types/constants";
import { GameState } from "../Referee/game-state";
import { IObserver, SyncObserver } from "../Referee/observer";
import { REFEREE_CONSTANTS as refConfig } from "../Referee/Types/constants";
import { JsonBuilder } from "../Common/Json/json-builder";
import { runServer } from "../Server/server";

export async function xserver() {
    const testResults = await performXServer(process.stdin);
    console.log(JSON.stringify(testResults));
    process.exit();
}

export async function performXServer(inputStream: Readable): Promise<[string[], string[]]> {
    const [serverConfig] = (await readInputFrom(inputStream, 1)) as [ServerConfig];
    configureRemoteConstants(serverConfig);
    const port = getCommandLineArg(0);
    if (port !== undefined && !isNaN(Number(port))) {
        rcConfig.SOCKET_OPTIONS.port = Number(port);
    }
    const [gameState, observer] = configureReferee(serverConfig["ref-spec"]);
    configureScoringConstants(serverConfig["ref-spec"]["config-s"]);
    const { winners, cheaters } = await runServer({ gameState, observer });
    return [winners.sort(), cheaters];
}

function configureRemoteConstants(serverConfig: ServerConfig) {
    rcConfig.SOCKET_OPTIONS.port = serverConfig.port;
    rcConfig.TRIES = serverConfig["server-tries"];
    rcConfig.WAITS = serverConfig["server-wait"] * 1000;
    rcConfig.SIGNUP_WAITS = serverConfig["wait-for-signup"] * 1000;
    rcConfig.VERBOSE = !serverConfig.quiet;
}

function configureReferee(refereeConfig: RefereeConfig): [GameState, IObserver | undefined] {
    refConfig.PLAYER_TIMEOUT_MS = refereeConfig["per-turn"] * 1000;
    refConfig.VERBOSE = !refereeConfig.quiet;
    const initialGameState = JsonBuilder.toGameState(refereeConfig.state0);
    const observer = refereeConfig.observe ? new SyncObserver() : undefined;
    return [initialGameState, observer];
}

function configureScoringConstants(refStateConfig: RefereeStateConfig) {
    gsConfig.Q_BONUS = refStateConfig.qbo;
    gsConfig.EMPTY_HAND_BONUS = refStateConfig.fbo;
}
