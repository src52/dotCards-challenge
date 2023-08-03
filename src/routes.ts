import {Router} from "express";
import {createRow, readRow, deleteRow, updateRow} from "./crud";

const routes = Router();

/**
 * Handles GET requests, with the table's name (collection) and ID as the path.
 * Returns the specified row from the DB, or an error if the query failed.
 */
routes.get('/:collection/:id', validateId, async (req, res) => {
    let result = await readRow(req.params.collection, Number(req.params.id));
    await returnResponse(res, result);
});


/**
 * Handles POST requests to create a new DB row, with the table's name (collection) as the path.
 * Attempts to create the row with parameters specified in the URL, returning an error if the query failed.
 */
routes.post('/:collection', async (req, res) => {
    let result = await createRow(req.params.collection, { ...req.query });
    await returnResponse(res, result);
});

/**
 * Handles POST requests to update an existing DB row, with the table's name (collection) and ID as the path.
 * Attempts to update the row with parameters specified in the URL, returning an error if the query failed.
 */
routes.post('/:collection/:id', validateId, async (req, res) => {
    let result = await updateRow(req.params.collection, Number(req.params.id), { ...req.query });
    await returnResponse(res, result);
});

/**
 * Handles DELETE requests, with the table's name (collection) and ID as parameters.
 * Returns 200 if successful, or an error if the query failed.
 */
routes.delete(`/:collection/:id`, validateId, async (req, res) => {
    let result = await deleteRow(req.params.collection, Number(req.params.id));
    await returnResponse(res, result);
});

/**
 * Takes the result of a server request, and returns an appropriate response to the client.
 * @param res The server response to send back to the client.
 * @param result The result of the request made to the server.
 */
function returnResponse(res, result) {
    if (result.errorMessage) {
        return res
            .status(400)
            .send({ error: result.errorMessage });

    } else {
        return res.status(200).json(result);
    }
}

/**
 * Validates that the ID specified in the request is numerical before continuing with routing.
 * @param req The server request being made
 * @param res The server response to return if invalid.
 * @param next The next function to move on to if successful.
 */
function validateId(req, res, next) {
    const id = Number(req.params.id);
    if (Number(id)) {
        return next();
    }
    return res.status(400).send({error: "The specified ID isn't numeric."});
}

export default routes;