import { JsonChoice, JsonPub, JsonTile, MName } from "../Types/json";
import { Color, Shape } from "../tile";

export type JSONObject = { [key: string]: JSONType };
export type JSONType = string | number | JSONType[] | JSONObject;
export type FunctionCallArguments = [JsonPub, JsonTile[]] | [JsonPub] | [JsonTile[]] | [boolean];
const NUMBER_TYPE = "number";

/**
 * A util static class to validate json data to rule out ill-formed and invalid messages
 * from communication between remote proxies.
 */
export class JsonValidator {
    /**
     * Is a given json string a valid jName?
     */
    static validateJName(data: string): boolean {
        const regexp = new RegExp("^[a-zA-Z0-9]+$");
        return typeof data === "string" && regexp.test(data);
    }

    /**
     * Is this a valid json format of a function call?
     * @param data in format [MName, [...Args]]
     * @returns
     */
    static validateFunctionCall(data: any): data is [MName, FunctionCallArguments] {
        return (
            data &&
            data[0] &&
            data[1] &&
            Object.values(MName).includes(data[0]) &&
            Array.isArray(data[1]) &&
            this.validateArgs(data[0], data[1])
        );
    }

    /**
     * Helper to validate each combination of mname and corresponding arguments
     * @param mname the given method name, defined in MName
     * @param args an array of arguments
     * @returns true if the combination is well-formed
     */
    static validateArgs(mname: MName, args: any[]): boolean {
        switch (mname) {
            case MName.SETUP:
                return this.validateSetupArgs(args);
            case MName.TAKE_TURN:
                return this.validateTakeTurnArgs(args);
            case MName.NEW_TILES:
                return this.validateNewTilesArgs(args);
            case MName.WIN:
                return this.validateWinArgs(args);
        }
    }

    static validateSetupArgs(args: any[]): args is [JsonPub, JsonTile[]] {
        return args.length === 2 && this.validateJPub(args[0]) && this.validateJTiles(args[1]);
    }
    static validateTakeTurnArgs(args: any[]): args is [JsonPub] {
        return args.length === 1 && this.validateJPub(args[0]);
    }
    static validateNewTilesArgs(args: any[]): args is [JsonTile[]] {
        return args.length === 1 && this.validateJTiles(args[0]);
    }
    static validateWinArgs(args: any[]): args is [boolean] {
        return args.length === 1 && typeof args[0] == "boolean";
    }

    /**
     * Is the given json object a valid jPub?
     * @param data a JSON object
     * @returns
     */
    static validateJPub(data: JSONObject): boolean {
        return (
            "map" in data &&
            "tile*" in data &&
            "players" in data &&
            this.validateJMap(data["map"]) &&
            this.validateNaturalNum(data["tile*"]) &&
            this.validatePlayersInJPub(data["players"])
        );
    }

    /**
     * Is the given json a valid jMap?
     * @param data a JSON data
     * @returns
     */
    static validateJMap(data: JSONType) {
        const extractedStrings = extractObjectStrings(data);
        return extractedStrings.every(
            (s) =>
                s === NUMBER_TYPE ||
                Object.values(Color).includes(s as Color) ||
                Object.values(Shape).includes(s as Shape)
        );
    }

    /**
     * Is the given json a natural number?
     * @param data a JSON data
     * @returns
     */
    static validateNaturalNum(data: any): boolean {
        return typeof data == "number" && data >= 0 && Math.floor(data) === data;
    }

    /**
     * Is the given json in a valid format for players in JPub? (ie. [JPlayer, ...Tile#[]])
     * @param data
     * @returns
     */
    static validatePlayersInJPub(data: JSONType) {
        return (
            Array.isArray(data) &&
            data.length > 0 &&
            this.validateJPlayer(data[0] as JSONObject) &&
            data.slice(1).every((n) => this.validateNaturalNum(n))
        );
    }

    /**
     * Is the given json a valid JPlayer?
     * @param data a JSON object
     * @returns
     */
    static validateJPlayer(data: JSONObject) {
        return (
            "score" in data &&
            "name" in data &&
            "tile*" in data &&
            this.validateNaturalNum(data["score"]) &&
            this.validateJName(data["name"] as string) &&
            this.validateJTiles(data["tile*"])
        );
    }

    /**
     * Is the given json a valid JTile* array?
     * @param data a JSON data
     * @returns
     */
    static validateJTiles(data: JSONType): boolean {
        if (!Array.isArray(data)) {
            return false;
        }
        return data.every((tile) => this.validateJTile(tile as JSONObject));
    }

    /**
     * Is the given json a valid JTile?
     * @param data a JSON data
     * @returns
     */
    static validateJTile(data: JSONObject): boolean {
        return (
            "color" in data &&
            "shape" in data &&
            Object.values(Color).includes(data["color"] as Color) &&
            Object.values(Shape).includes(data["shape"] as Shape)
        );
    }

    /**
     * Is the given json a valid JChoice?
     * @param data a JSON object
     * @returns
     */
    static validateJChoice(data: JSONType): boolean {
        const extractedStrings = extractObjectStrings(data);
        const isPass =
            extractedStrings.length === 1 && extractedStrings[0] === ("pass" as JsonChoice);
        const isExchange =
            extractedStrings.length === 1 && extractedStrings[0] === ("replace" as JsonChoice);
        const isPlacement = extractedStrings.every(
            (s) =>
                s === NUMBER_TYPE ||
                Object.values(Color).includes(s as Color) ||
                Object.values(Shape).includes(s as Shape)
        );

        return isPass || isExchange || isPlacement;
    }
}

/**
 * Creates a list of all strings in the given JSON object, ignoring keys.
 * Numbers are replaced with the literal string "number".
 * @param inputObject parsed JSON
 * @returns the list of strings found
 */
function extractObjectStrings(inputObject: JSONType): string[] {
    if (typeof inputObject === "string") {
        return [inputObject];
    } else if (typeof inputObject === "number") {
        return [NUMBER_TYPE];
    } else if (typeof inputObject === "object") {
        // Arrays are objects in JavaScript, so we have to disambiguate
        if (Array.isArray(inputObject)) {
            return inputObject.map(extractObjectStrings).flat();
        } else {
            return (
                Object.entries(inputObject)
                    // sort entries by key (alphabetically increasing order)
                    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
                    .map(([, value]) => extractObjectStrings(value))
                    .flat()
            );
        }
    } else {
        throw new Error("Unsupported JSON type!");
    }
}
