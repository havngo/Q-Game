import { Readable } from "stream";
import { ClientConfig } from "../Common/Types/json";
import { delay, getCommandLineArg, readInputFrom } from "./task-utils";
import { JsonBuilder } from "../Common/Json/json-builder";
import { client, retryConnection } from "../Client/client";
import { CLIENT_CONFIGURATIONS as config } from "../Common/Types/constants";
import * as net from "net";

export async function xclients() {
    await performXClients(process.stdin);
}

export async function performXClients(inputStream: Readable) {
    const [clientConfig] = (await readInputFrom(inputStream, 1)) as [ClientConfig];
    configureRemoteConstants(clientConfig);
    const port = getCommandLineArg(0);
    if (port !== undefined && !isNaN(Number(port))) {
        config.SOCKET_OPTIONS.port = Number(port);
    }
    const waitingTimeoutMs = clientConfig.wait * 1000;
    const tempSocket = net
        .createConnection(config.SOCKET_OPTIONS)
        .on("error", (error: Error) => {
            retryConnection(tempSocket, error, Math.max(waitingTimeoutMs, 3000));
        })
        .once("connect", async () => {
            tempSocket.destroy();

            for (const [i, jsonActor] of clientConfig.players.entries()) {
                const player = JsonBuilder.toPlayer(jsonActor);
                client(player);
                if (i < clientConfig.players.length - 1) {
                    await delay(waitingTimeoutMs);
                }
            }
        });
}

function configureRemoteConstants(clientConfig: ClientConfig) {
    config.SOCKET_OPTIONS.port = clientConfig.port;
    config.SOCKET_OPTIONS.host = clientConfig.host;
    config.VERBOSE = !clientConfig.quiet;
}
