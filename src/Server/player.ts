import { Bag } from "typescript-collections";
import { JsonActorSpecAll, MName } from "../Common/Types/json";
import { PublicState } from "../Common/Types/public-state";
import { Tile } from "../Common/tile";
import { TurnAction } from "../Player/Types/types";
import { IPlayer } from "../Player/player";
import * as net from "net";
import { JsonBuilder } from "../Common/Json/json-builder";
import { JsonValidator } from "../Common/Json/json-validator";
import { SimpleLogging } from "../Common/Logging/logging";
import { SERVER_CONFIGURATIONS, VOID } from "../Common/Types/constants";

const logger = new SimpleLogging("PLAYER PROXY");

/**
 * Represents a remote proxy player, containing a tcp socket connection between a
 * server and a client of a Q Game. It has all methods that a normal player would
 * have and sends json formats of method calls to the client side.
 */
export class PlayerProxy implements IPlayer {
    constructor(private c: net.Socket, private _name: string) {
        logger.setVerbose(SERVER_CONFIGURATIONS.VERBOSE);
    }

    name(): string {
        return this._name;
    }

    async setup(state: PublicState, tiles: Bag<Tile>): Promise<void> {
        return new Promise((resolve, reject) => {
            logger.log(`Sending setup call to ${this._name}...`);
            const message = JSON.stringify([
                MName.SETUP,
                [state.toJson(), JsonBuilder.toJTiles(tiles)],
            ]);
            this.c.write(message);
            this.promiseVoidResult(resolve, reject, MName.SETUP);
        });
    }

    async takeTurn(state: PublicState): Promise<TurnAction> {
        return new Promise((resolve, reject) => {
            logger.log(`Sending take-turn call to ${this._name}...`);
            let onError: (e: Error) => void;
            let onData = (data: Buffer) => {
                this.c.removeListener("error", onError);
                const jChoice = JSON.parse(data.toString());
                if (JsonValidator.validateJChoice(jChoice)) {
                    const action: TurnAction = JsonBuilder.toAction(jChoice);
                    resolve(action);
                } else {
                    reject(`${MName.TAKE_TURN}: Invalid jChoice`);
                }
            };
            onError = (e: Error) => {
                logger.error(new Error(`An error emitted from ${this._name}: ${e.message}`));
                this.c.removeListener("data", onData);
                reject(`${MName.TAKE_TURN}: error in referee proxy`);
            };
            const message = JSON.stringify([MName.TAKE_TURN, [state.toJson()]]);
            this.c.write(message);
            this.c.once("error", onError);
            this.c.once("data", onData);
        });
    }

    async newTiles(newBagOfTiles: Bag<Tile>): Promise<void> {
        return new Promise((resolve, reject) => {
            const message = JSON.stringify([
                MName.NEW_TILES,
                [JsonBuilder.toJTiles(newBagOfTiles)],
            ]);
            logger.log(`Sending new-tiles call to ${this._name}...`);
            this.c.write(message);
            this.promiseVoidResult(resolve, reject, MName.NEW_TILES);
        });
    }

    async win(result: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            logger.log(`Sending win call to ${this._name}...`);
            const message = JSON.stringify([MName.WIN, [result]]);
            this.c.write(message);
            this.promiseVoidResult(resolve, reject, MName.WIN);
        });
    }

    /**
     * Helper method to handle resolving and rejecting void function calls since
     * the socket might receive a data or an error event.
     * If the data received is "void", remove the error listener and resolve
     * If an error is emitted, remove the data listener and reject
     * @param resolve resolve callback from a promise invoking this helper
     * @param reject reject callback from a promise invoking this helper
     * @param mname method name for logging purposes.
     */
    private promiseVoidResult(resolve: () => void, reject: (reason?: any) => void, mname: MName) {
        let onError: (e: Error) => void;
        let onData = (data: Buffer) => {
            this.c.removeListener("error", onError);
            if (JSON.parse(data.toString()) === VOID) {
                logger.log(`${mname}: Received a "void" from ${this._name}`);
                resolve();
            } else {
                logger.warn(`Received a something else from ${this._name}...`);
                reject(`${mname}: Invalid void, got ${data.toString()}`);
            }
        };
        onError = (e: Error) => {
            this.c.removeListener("data", onData);
            logger.error(new Error(`An error emitted from ${this._name}: ${e.message}`));
            reject(`${mname}: error in referee proxy`);
        };
        this.c.once("data", onData);
        this.c.once("error", onError);
    }

    closeConnection() {
        this.c.destroy();
    }

    toJson(): JsonActorSpecAll {
        return [this._name, "a proxy", this.c.remotePort, this.c.remoteAddress];
    }
}
