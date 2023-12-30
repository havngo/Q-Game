import { JsonValidator } from "../../../Common/Json/json-validator";

describe("json validator", () => {
    const tile1 = {
        shape: "circle",
        color: "red",
    };
    const tile2 = {
        shape: "diamond",
        color: "green",
    };
    const badtile1 = {
        shape: "oval",
        color: "blue",
    };
    const badtile2 = {
        shape: "square",
        color: "beige",
    };
    const badtile3 = {
        wrongKey: "?",
    };
    const p1 = {
        score: 12,
        name: "ha",
        "tile*": [tile1, tile2, tile1],
    };
    const badp2 = {
        score: 10000,
        name: "hey",
        wrong_key: [],
    };
    const p3 = {
        score: 11231232,
        name: "second",
        "tile*": [tile1, tile2, tile1, tile1],
    };
    const ps1 = [p1, 123, 0, 5678, 2];
    const badps2 = [badp2, -234, 17];
    const badps3 = [p3, 0, 0, "hi"];
    const badps4 = [p3, [], 1, 7];
    const ps5 = [p3];

    const map1 = [[0, [0, { color: "red", shape: "square" }]]];
    const map2 = [
        [
            0,
            [0, { color: "red", shape: "circle" }],
            [1, { color: "red", shape: "square" }],
            [2, { color: "red", shape: "star" }],
        ],
        [
            1,
            [0, { color: "blue", shape: "circle" }],
            [1, { color: "blue", shape: "square" }],
            [2, { color: "blue", shape: "star" }],
        ],
        [
            2,
            [0, { color: "green", shape: "circle" }],
            [1, { color: "green", shape: "square" }],
            [2, { color: "green", shape: "star" }],
        ],
    ];
    const badmap1 = [[0, [0, { color: "red", shape: "hello" }]]];
    const badmap2 = [[-10, [1000, { color: "kkkk", shape: "square" }]]];

    const jpub1 = {
        map: map1,
        players: ps1,
        "tile*": 100,
    };

    const jpub2 = {
        map: map2,
        players: ps5,
        "tile*": 0,
    };

    const badjpub3 = {
        maps: map2,
        players: ps5,
        "tile*": 0,
    };

    const badjpub4 = {
        map: map2,
        players: p1,
        "tile*": [tile1],
    };

    test("jName", () => {
        expect(JsonValidator.validateJName("hango")).toBe(true);
        expect(JsonValidator.validateJName("1234")).toBe(true);
        expect(JsonValidator.validateJName("12efwe3q4")).toBe(true);

        expect(JsonValidator.validateJName("    asd")).toBe(false);
        expect(JsonValidator.validateJName("'12#$34")).toBe(false);
        expect(JsonValidator.validateJName("-1_234")).toBe(false);
        expect(JsonValidator.validateJName('{"key": "value"}')).toBe(false);
        expect(JsonValidator.validateJName('["name"]')).toBe(false);
    });

    test("jTile", () => {
        expect(JsonValidator.validateJTile(tile1)).toBe(true);
        expect(JsonValidator.validateJTile(badtile2)).toBe(false);
        expect(JsonValidator.validateJTile(badtile3)).toBe(false);

        expect(JsonValidator.validateJTiles([tile1, tile2])).toBe(true);
        expect(JsonValidator.validateJTiles([badtile1, badtile2])).toBe(false);
        expect(JsonValidator.validateJTiles([tile1, badtile2])).toBe(false);
    });

    test("Natural number", () => {
        expect(JsonValidator.validateNaturalNum(12342341231233)).toBe(true);
        expect(JsonValidator.validateNaturalNum(0)).toBe(true);
        expect(JsonValidator.validateNaturalNum(-58)).toBe(false);
        expect(JsonValidator.validateNaturalNum(12.6)).toBe(false);
    });

    test("jPlayer", () => {
        expect(JsonValidator.validateJPlayer(p1)).toBe(true);
        expect(JsonValidator.validateJPlayer(badp2)).toBe(false);
    });

    test("Players in jPub", () => {
        expect(JsonValidator.validatePlayersInJPub(ps1)).toBe(true);
        expect(JsonValidator.validatePlayersInJPub(ps5)).toBe(true);
        expect(JsonValidator.validatePlayersInJPub(badps2)).toBe(false);
        expect(JsonValidator.validatePlayersInJPub(badps3)).toBe(false);
        expect(JsonValidator.validatePlayersInJPub(badps4)).toBe(false);
    });

    test("jMap", () => {
        expect(JsonValidator.validateJMap(map1)).toBe(true);
        expect(JsonValidator.validateJMap(map2)).toBe(true);

        expect(JsonValidator.validateJMap(badmap1)).toBe(false);
        expect(JsonValidator.validateJMap(badmap2)).toBe(false);
        expect(JsonValidator.validateJMap(ps1)).toBe(false);
        expect(JsonValidator.validateJMap(p3)).toBe(false);
    });

    test("jPub", () => {
        expect(JsonValidator.validateJPub(jpub1)).toBe(true);
        expect(JsonValidator.validateJPub(jpub2)).toBe(true);
        expect(JsonValidator.validateJPub(badjpub3)).toBe(false);
        expect(JsonValidator.validateJPub(badjpub4)).toBe(false);
    });

    test("Setup args", () => {
        expect(JsonValidator.validateSetupArgs([jpub1, []])).toBe(true);
        expect(JsonValidator.validateSetupArgs([jpub2, [tile2, tile1]])).toBe(true);

        expect(JsonValidator.validateSetupArgs([jpub1, jpub1])).toBe(false);
        expect(JsonValidator.validateSetupArgs([[], []])).toBe(false);
        expect(JsonValidator.validateSetupArgs([jpub1])).toBe(false);
        expect(JsonValidator.validateSetupArgs([badjpub3, [tile1]])).toBe(false);
    });

    test("Take-turn args", () => {
        expect(JsonValidator.validateTakeTurnArgs([jpub1])).toBe(true);
        expect(JsonValidator.validateTakeTurnArgs([jpub2])).toBe(true);
        
        expect(JsonValidator.validateTakeTurnArgs([badjpub3])).toBe(false);
        expect(JsonValidator.validateTakeTurnArgs([tile1])).toBe(false);
        expect(JsonValidator.validateTakeTurnArgs([])).toBe(false);
    });

    test("New-tiles args", () => {
        expect(JsonValidator.validateNewTilesArgs([[]])).toBe(true);
        expect(JsonValidator.validateNewTilesArgs([[tile1, tile2]])).toBe(true);
        
        expect(JsonValidator.validateNewTilesArgs([jpub1])).toBe(false);
        expect(JsonValidator.validateNewTilesArgs([tile1, jpub2])).toBe(false);
        expect(JsonValidator.validateNewTilesArgs([])).toBe(false);
    });

    test("Win args", () => {
        expect(JsonValidator.validateWinArgs([true])).toBe(true);
        expect(JsonValidator.validateWinArgs([false])).toBe(true);
        
        expect(JsonValidator.validateWinArgs([jpub1])).toBe(false);
        expect(JsonValidator.validateWinArgs([tile1, jpub2])).toBe(false);
        expect(JsonValidator.validateWinArgs([])).toBe(false);
    })

    test("Function calls", () => {
        expect(JsonValidator.validateFunctionCall(["setup", [jpub1, [tile1, tile2]]])).toBe(true);
        expect(JsonValidator.validateFunctionCall(["take-turn", [jpub1]])).toBe(true);
        expect(JsonValidator.validateFunctionCall(["new-tiles", [[]]])).toBe(true);
        expect(JsonValidator.validateFunctionCall(["win", [false]])).toBe(true);

        expect(JsonValidator.validateFunctionCall(["undefined-mname", [jpub1, []]])).toBe(false);
        expect(JsonValidator.validateFunctionCall(["setup", [jpub1]])).toBe(false);
        expect(JsonValidator.validateFunctionCall(["take-turn", [jpub1, []]])).toBe(false);
        expect(JsonValidator.validateFunctionCall(["win", []])).toBe(false);
        expect(JsonValidator.validateFunctionCall(["newtiles", [badtile1, badtile3]])).toBe(false);
    })

    test("jChoice", () => {
        const placements = [
            {"1tile": tile1, coordinate: {row: 0, column: -1}},
            {"1tile": tile2, coordinate: {row: 0, column: -1}}
        ]
        const badplacements = [
            {"1tile": badtile2, coordinate: {row: 0, column: 1}},
            {"1tile": tile2, coordinate: {row: 0, column: 1}}
        ]
        expect(JsonValidator.validateJChoice("pass")).toBe(true);
        expect(JsonValidator.validateJChoice("replace")).toBe(true);
        expect(JsonValidator.validateJChoice(placements)).toBe(true);

        expect(JsonValidator.validateJChoice("decided to pass")).toBe(false);
        expect(JsonValidator.validateJChoice("exchange all")).toBe(false);
        expect(JsonValidator.validateJChoice(badplacements)).toBe(false);
    })
});
