import { Canvas, createCanvas, loadImage, Image } from "canvas";
import { JsonState } from "../Common/Types/json";
import { Coordinate } from "../Common/coordinate";
import { JsonBuilder } from "../Common/Json/json-builder";
import { ImmutableBoard } from "../Common/map";
import fs from "fs";
import { PlayerState } from "../Common/player-state";
import { Tile } from "../Common/tile";

const TILE_SIZE = 50;
const IMAGE_DIR = "Tmp";

/**
 * Given json states, saves their image representations to the Tmp directory.
 *
 * @param jsonStates the json states to be saved as images
 */
export async function saveImages(jsonStates: JsonState[]) {
    if (fs.existsSync(IMAGE_DIR)) {
        fs.rmSync(IMAGE_DIR, { recursive: true });
    }
    fs.mkdirSync(IMAGE_DIR);
    for (let i = 0; i < jsonStates.length; i++) {
        const jsonState = jsonStates[i];
        const board = JsonBuilder.toBoard(jsonState.map);
        const boardCanvas = await boardToImage(board);
        const playerStatesCanvases = await Promise.all(
            jsonState.players.map(
                async (jsonPlayer) =>
                    await playerStateToImage(JsonBuilder.toPlayerState(jsonPlayer))
            )
        );
        const canvas = mergeCanvases([...playerStatesCanvases, boardCanvas]);
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(`Tmp/${i}.png`, buffer);
    }
}

async function playerStateToImage(playerState: PlayerState): Promise<Canvas> {
    const PADDING = 15;
    const FONT_SIZE = 15;
    const width = Math.max(TILE_SIZE * playerState.hand.length + PADDING, TILE_SIZE * 6);
    const canvas = createCanvas(width, TILE_SIZE + FONT_SIZE + PADDING * 2);
    const ctx = canvas.getContext("2d");
    // draw top texts
    ctx.fillStyle = "white";
    ctx.font = `${FONT_SIZE}px serif`;
    ctx.fillText(`Name: ${playerState.playerId}`, PADDING, PADDING);
    ctx.fillText(`Score: ${playerState.score}`, PADDING, 2 * PADDING);
    const hand = await playerHandToImage(playerState.hand);
    ctx.drawImage(hand, PADDING, canvas.height - (PADDING + TILE_SIZE));
    return canvas;
}

async function playerHandToImage(hand: Tile[]): Promise<Canvas> {
    const tiles = await Promise.all(
        hand.map(async (tile) => {
            const tileName = tile.toString();
            const imagePath = `../Q/Common/FrontEnd/qwirkle/public/tiles/${tileName}.png`;
            const image = await loadImage(imagePath);
            return image;
        })
    );
    const canvas = createCanvas(TILE_SIZE * tiles.length, TILE_SIZE);
    const ctx = canvas.getContext("2d");

    tiles.forEach((shape, index) => {
        ctx.drawImage(shape, TILE_SIZE * index, 0, TILE_SIZE, TILE_SIZE);
    });

    return canvas;
}

async function boardToImage(board: ImmutableBoard): Promise<Canvas> {
    const { minRow, maxRow, minCol, maxCol } = Coordinate.getBounds(board.getCoordinates());

    const totalWidth = TILE_SIZE * (maxCol - minCol + 1);
    const totalHeight = TILE_SIZE * (maxRow - minRow + 1);

    const canvas = createCanvas(totalWidth, totalHeight);
    const ctx = canvas.getContext("2d");

    for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
            const coordinate = JsonBuilder.toCoordinate({ row: r, column: c });
            const cell = board.getCell(coordinate);
            const tile = cell.hasValue() ? cell.value : undefined;
            const tileName = tile ? tile.toString() : "empty";
            const imagePath = `../Q/Common/FrontEnd/qwirkle/public/tiles/${tileName}.png`;
            const image = await loadImage(imagePath);
            ctx.drawImage(
                image,
                TILE_SIZE * (c - minCol),
                TILE_SIZE * (r - minRow),
                TILE_SIZE,
                TILE_SIZE
            );
        }
    }
    ctx.translate(minCol, minRow);
    return canvas;
}

function mergeCanvases(canvases: Canvas[]): Canvas {
    const totalWidth = canvases.reduce((maxWidth, canvas) => Math.max(maxWidth, canvas.width), 0);
    const totalHeight = canvases.reduce((accHeight, canvas) => accHeight + canvas.height, 0);
    const outputCanvas = createCanvas(totalWidth, totalHeight);
    const context = outputCanvas.getContext("2d");
    let currentHeight = 0;
    canvases.forEach((canvas) => {
        context.drawImage(canvas, 0, currentHeight);
        currentHeight += canvas.height;
    });
    return outputCanvas;
}
