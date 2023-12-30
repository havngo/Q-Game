import { Tile, Tile as TileData } from "../../../../tile";
import { Coordinate } from "../../../../coordinate";
import "../style/Tile.css";

interface TileProps {
    tileName: string;
}

export function tileToImageElem(tile: Tile) {
    return tileNameToImageElem(tile.toString());
}

function tileNameToImageElem(tileName: string) {
    const imagePath = `/tiles/${tileName}.png`;
    return <img src={imagePath} alt={tileName} className="tile-image" />;
}

function TileElement({ tileName }: TileProps) {
    const className = tileName === "empty" ? "tileEmpty" : `tile tile-${tileName}`;
    return <div className={className}>{tileNameToImageElem(tileName)}</div>;
}

export default TileElement;
