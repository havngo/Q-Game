import { Duplex } from "stream-json/Parser";
import { JsonPub, JsonTile } from "../Common/Types/json";
import { IPlayer } from "../Player/player";

export type SetUpFunc = (args: [JsonPub, JsonTile[]], player: IPlayer, c: Duplex) => Promise<void>;
export type TakeTurnFunc = (args: [JsonPub], player: IPlayer, c: Duplex) => Promise<void>
export type NewTilesFunc = (args: [JsonTile[], player: IPlayer, c: Duplex]) => Promise<void>
export type WinFunc = (args: [boolean], player: IPlayer, c: Duplex) => Promise<void>

export type CommandFunction = (args: any, player: IPlayer, c: Duplex) => Promise<void>