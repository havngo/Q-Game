import "react";
import "../style/Board.css";
import { ImmutableBoard as BoardData } from "../../../../map";
import { Coordinate } from "../../../../coordinate";
import TileElement from "./Tile";
import { JSX } from "react/jsx-dev-runtime";
import { JsonBuilder } from "../../../../Json/json-builder";

export interface BoardProps {
    boardData: BoardData;
}

function Board({ boardData }: BoardProps) {
    const coordinates = boardData.getCoordinates();

    if (coordinates.length === 0) {
        return <div className="board"></div>;
    }

    const { minRow, maxRow, minCol, maxCol } = Coordinate.getBounds(coordinates);
    const rowDivs: JSX.Element[] = [];
    for (let r = minRow; r <= maxRow; r++) {
        const rowTiles: JSX.Element[] = [];
        for (let c = minCol; c <= maxCol; c++) {
            const coordinate = JsonBuilder.toCoordinate({ row: r, column: c });
            const cell = boardData.getCell(coordinate);
            const tile = cell.hasValue() ? cell.value : undefined;
            const tileName = tile ? tile.toString() : "empty";
            const imagePath = getImagePath(tileName);
            const tileElem = <TileElement tileName={tileName} />;
            rowTiles.push(tileElem);
        }
        const rowElem = <div className="boardRow">{rowTiles}</div>;
        rowDivs.push(rowElem);
    }

    return <div className="board">{rowDivs}</div>;
}

function getImagePath(tileName: string) {
    return `/tiles/${tileName}.png`;
}

export default Board;
