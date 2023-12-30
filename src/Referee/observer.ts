import { JsonState } from "../Common/Types/json";
import { ExpressServer } from "./express-server";
import { saveImages } from "./render";

/**
 * Represents an observer of the Q game.
 */
export interface IObserver {
    /**
     * Updates the observer with a new state of the game.
     *
     * @param state the new state of the game
     */
    newState(state: JsonState): void;

    /**
     * Informs the observer that the game has ended.
     */
    gameEnded(): void;
}

/**
 * Represents an observer that synchronously runs the front end. It will wait for the
 * whole game to be completed, collecting the game states along the way, and then it will
 * send these to the front end all at once when the game ends.
 */
export class SyncObserver implements IObserver {
    private readonly states: JsonState[] = [];

    constructor() {}

    newState(state: JsonState) {
        this.states.push(state);
    }

    gameEnded() {
        const server = new ExpressServer();
        server.setJsonStates(this.states);
        server.openFrontend();
        saveImages(this.states);
        return "👍";
    }
}

/**
 * Represents an asynchronous observer, which will asynchronously send data to the
 * frontend. On each call of newState, it will update its endpoint to the front end,
 * and the front end will have to keep polling the endpoint to keep getting the new data.
 */
export class AsyncObserver implements IObserver {
    private readonly states: JsonState[] = [];
    private readonly server: ExpressServer;

    constructor() {
        this.server = new ExpressServer();
        this.server.openFrontend();
    }

    newState(state: JsonState) {
        this.states.push(state);
        this.server.setJsonStates(this.states);
    }

    gameEnded() {
        saveImages(this.states);
        return "👌";
    }
}
