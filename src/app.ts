import express from 'express';
import * as http from 'http';
import routes from './routes';
import {details} from "../config/db.config";

export const app: express.Application = express();
export const server: http.Server = http.createServer(app);
const port = details.EXPRESS_PORT;

/**
 * Register all the routes our API requires.
 */
app.use(routes);

/**
 * Begin the application by first synchronizing the database with the schema, then starting the API to query it.
 */
server.listen(port, async () => {
    console.log(`We are running the REST server on port ${port}...`)
});