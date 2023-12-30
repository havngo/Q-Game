import { Color, RegularTile, Shape, Tile } from "../Common/tile";
import { Readable } from "stream";
import { withParser } from "stream-json/streamers/StreamValues";
import { createReadStream, readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { GAME_STATE_CONSTANTS } from "../Common/Types/constants";

export interface JsonTestCase {
    testInputPath: string;
    testOutputPath: string;
}

export async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAllTestCases(directory: string, excludeDirs: string[] = []): JsonTestCase[] {
    const results: JsonTestCase[] = [];
    const jsonFiles: string[] = [];
    const paths = readdirSync(directory);
    paths.forEach((file) => {
        const fullPath = join(directory, file);
        if (statSync(fullPath).isDirectory() && !excludeDirs.includes(file)) {
            results.push(...getAllTestCases(fullPath, excludeDirs));
        } else if (extname(fullPath) === ".json") {
            jsonFiles.push(file);
        }
    });

    const jsonInputs = jsonFiles.filter((file) => file.endsWith("-in.json")).sort();
    const jsonOutputs = jsonFiles.filter((file) => file.endsWith("-out.json")).sort();

    for (let i = 0; i < Math.min(jsonInputs.length, jsonOutputs.length); i++) {
        if (jsonInputs[i].slice(0, 1) !== jsonOutputs[i].slice(0, 1)) {
            throw new Error("Bad json test file format");
        }
        results.push({
            testInputPath: join(directory, jsonInputs[i]),
            testOutputPath: join(directory, jsonOutputs[i]),
        });
    }

    return results;
}

export const ALL_TILES = Object.values(Color)
    .flatMap((color) => Object.values(Shape).map((shape) => ({ color, shape })))
    .reduce(
        (acc, { color, shape }) => ({
            ...acc,
            [color.toLowerCase() + shape.charAt(0).toUpperCase() + shape.slice(1).toLowerCase()]:
                new RegularTile(color, shape),
        }),
        {} as Record<string, Tile>
    );

export function readInputFrom(inputStream: Readable, numArgs: number): Promise<any[]> {
    const inputArr: any[] = [];
    return new Promise((res) => {
        const jsonStreamParser = withParser()
            .on("data", (data: any) => {
                inputArr.push(data.value);
                if (inputArr.length >= numArgs) {
                    jsonStreamParser.end();
                }
            })
            .on("end", () => res(inputArr))
            .on("error", () => res(inputArr));
        inputStream.pipe(jsonStreamParser);
    });
}

export function hasCommandLineArg(arg: string) {
    const commandLineArgs = process.argv.slice(2);
    return commandLineArgs.indexOf(arg) !== -1;
}

/**
 * Returns the command line arg at the given index if it exists starting from 0th index
 *
 * @param index the index of the argument starting from 0
 * @returns the command line arg at that position if it exists
 */
export function getCommandLineArg(index: number): string | undefined {
    const commandLineArgs = process.argv.slice(2);
    return commandLineArgs[index];
}

export function runMilestoneTests(
    description: string,
    testDirectory: string,
    testFunction: (inputStream: Readable) => Promise<any>,
    excludeDirs: string[] = [],
    { doBeforeAll, doAfterAll }: { doBeforeAll: () => void; doAfterAll: () => void } = {
        doBeforeAll: () => {},
        doAfterAll: () => {},
    }
) {
    describe(description, () => {
        beforeAll(doBeforeAll);
        afterAll(doAfterAll);
        getAllTestCases(`../${testDirectory}`, excludeDirs).forEach(
            ({ testInputPath, testOutputPath }) => {
                test(`Test case for ${testInputPath}`, async () => {
                    const jsonTestRes = await testFunction(
                        createReadStream(testInputPath, { encoding: "utf8" })
                    );
                    const jsonOutVal = JSON.parse(readFileSync(testOutputPath, "utf-8"));
                    expect(jsonTestRes).toEqual(jsonOutVal);
                });
            }
        );
    });
}

export const ensureOldScoring = {
    doBeforeAll() {
        GAME_STATE_CONSTANTS.Q_BONUS = 6;
        GAME_STATE_CONSTANTS.EMPTY_HAND_BONUS = 6;
    },
    doAfterAll() {
        GAME_STATE_CONSTANTS.Q_BONUS = 8;
        GAME_STATE_CONSTANTS.EMPTY_HAND_BONUS = 4;
    },
};
