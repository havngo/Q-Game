import express, { Request, Response, Express } from "express";
import http from "http";
import { JsonState } from "../Common/Types/json";
import { join } from "path";
import { open } from "openurl";

const EXPRESS_PORT = process.env.EXPRESS_PORT ?? "37681";
const FRONTEND_BUILD_PATH = join(__dirname, "../../Common/FrontEnd/qwirkle/dist");

/**
 * Represents an ExpressServer which serves the frontend and the json states of the game.
 * The frontend will communicate with it to fetch the json states, and if the frontend has
 * been opened by the {@code openFrontend} method, it will open the browser to the frontend
 * for the user to see the observer.
 */
export class ExpressServer {
    app: Express;
    server: http.Server;

    /**
     * Creates a new ExpressServer on the express port. Further methods need to be called
     * to instantiate functionality.
     */
    constructor() {
        this.app = express();
        this.server = this.app.listen(EXPRESS_PORT, () => {});
        this.setJsonStates([]);
    }

    /**
     * Initializes the frontend and opens it on the browser.
     * This method should only be called once per ExpressServer. In addition, this method
     * assumes a valid build of the frontend exists in Q/Common/FrontEnd/qwirkle/dist/index.html
     * file. If no such build exists, the browser will not be able to display anything.
     */
    openFrontend() {
        const frontEndStatic = express.static(FRONTEND_BUILD_PATH);
        this.app.use(frontEndStatic);
        this.app.get("*", (_, res) => {
            res.sendFile(join(FRONTEND_BUILD_PATH, "index.html"));
        });
        open(`http://localhost:${EXPRESS_PORT}`);
    }

    /**
     * Terminates the express server. After this call, if the user still has the frontend
     * open on the browser, it will no longer be able to load correctly.
     */
    close() {
        this.server.close();
    }

    /**
     * Updates this express server to serve the given json states at the /jsonstates endpoint.
     * This will be used by the frontend to fetch the json states for the game.
     *
     * @param jsonStates the json states to be served by the express server
     */
    setJsonStates(jsonStates: JsonState[]) {
        this.app.get("/jsonstates", (_: Request, res: Response) => {
            res.json(JSON.stringify(jsonStates));
        });
    }
}
