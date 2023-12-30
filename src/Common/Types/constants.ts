import { Coordinate } from "../coordinate";

export const GAME_STATE_CONSTANTS = {
    Q_BONUS: 8,
    EMPTY_HAND_BONUS: 4,
    INITIAL_HAND_SIZE: 6,
    PER_TILE_SCORE: 1,
    DEFAULT_STARTING_POSITION: new Coordinate(0, 0),
};

export const TILE_CONSTANTS = {
    UNIQUE_TILE_KIND_COUNT: 30,
};

export const SERVER_CONFIGURATIONS = {
    SOCKET_OPTIONS: {
        host: "127.0.0.1",
        port: 3000,
    },
    WAITS: 20000, // 20 seconds for player register
    SIGNUP_WAITS: 3000, // 3 seconds for name submission
    TRIES: 2,
    MAXIMUM_NUMBER_OF_PLAYERS: 4,
    MINIMUM_NUMBER_OF_PLAYERS: 2,
    VERBOSE: true,
};

export const CLIENT_CONFIGURATIONS = {
    SOCKET_OPTIONS: {
        host: "127.0.0.1",
        port: 3000,
    },
    CLIENT_RECONNECT_PERIOD: 10000,
    CLIENT_RETRY: 5,
    VERBOSE: true,
};

// The 'ACK' message for the client to response to server
export const VOID = "void";
