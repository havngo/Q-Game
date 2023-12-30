import { PlayerState } from "../../../../player-state";
import { tileToImageElem } from "./Tile";
import "../style/PlayerState.css";

export interface PlayerInfoProps {
    playerState: PlayerState;
}

function PlayerInfo({ playerState }: PlayerInfoProps) {
    return (
        <div className="playerStateEntire">
            <div>Player: {playerState.playerId}</div>
            <div>Score: {playerState.score}</div>
            <p>Hand:</p>
            <div className="handContainer">
                {playerState.hand.map((tile) => (
                    <div className="handTile">{tileToImageElem(tile)}</div>
                ))}
            </div>
        </div>
    );
}

export default PlayerInfo;
