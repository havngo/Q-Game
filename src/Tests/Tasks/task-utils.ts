import { createReadStream, readFileSync } from "fs";
import { Readable } from "stream";

/**
 * Performs the given tests with the given function
 *
 * @param testDirectory the directory containing the test files
 * @param numTests the number of tests to run
 * @param testFunc the function with which to run the tests for
 */
export function runJsonTests(
    testDirectory: string,
    numTests: number,
    testFunc: (input: Readable) => Promise<any>
) {
    describe(`json tests in ${testDirectory}`, () => {
        for (let i = 0; i < numTests; i++) {
            const jsonInName = `../${testDirectory}/${i}-in.json`;
            const jsonOutName = `../${testDirectory}/${i}-out.json`;
            test(`Test case for ${jsonInName}`, async () => {
                const jsonTestRes = await testFunc(
                    createReadStream(jsonInName, { encoding: "utf8" })
                );
                const jsonOutVal = JSON.parse(readFileSync(jsonOutName, "utf-8"));
                expect(jsonTestRes).toEqual(jsonOutVal);
            });
        }
    });
}
