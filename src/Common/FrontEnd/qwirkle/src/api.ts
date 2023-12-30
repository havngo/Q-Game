import axios from "axios";
import { JsonState } from "../../../Types/json";

const PORT = process.env.EXPRESS_PORT ?? "37681";
const API_URL = `http://localhost:${PORT}`;

export async function getJsonStates(): Promise<JsonState[]> {
    const response = await axios.get(`${API_URL}/jsonstates`);
    if (response.status !== 200) {
        throw new Error(`Failed to get board: ${response.statusText}`);
    }
    return JSON.parse(response.data);
}
