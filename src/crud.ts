import {or, QueryTypes, ValidationError} from "sequelize";
import {sequelize} from "./schema";

/**
 * The method attempts to fetch a row from the database given a table name and ID.
 *
 * If the table or ID doesn't exist, an error is returned. Otherwise, the database is queried, and the row is returned.
 * @param tableName The table to query
 * @param id The ID of the row to query
 */
export async function readRow(tableName: string, id: number): Promise<{ errorMessage?: string, row?: any }> {
    if (!tableExists(tableName)) {
        return {errorMessage: ErrorType.InvalidTable};
    }

    const rowExists = await idExistsInDatabase(tableName, id);
    if (!rowExists) {
        return {errorMessage: ErrorType.InvalidId};
    } else {
        const result = await sequelize.models[tableName].findOne({where: {id: id}});
        return {row: result};
    }
}

/**
 * The method attempts to delete a row from the database given a table name and ID.
 *
 * If the table or ID doesn't exist, an error is returned. Otherwise, the database is queried, and the row is removed.
 * @param tableName The table to query
 * @param id The ID of the row to query
 */
export async function deleteRow(tableName: string, id: number): Promise<{
    errorMessage?: string,
    rowRemoved: boolean
}> {
    if (!tableExists(tableName)) {
        return {errorMessage: ErrorType.InvalidTable, rowRemoved: false};
    }

    const rowExists = await idExistsInDatabase(tableName, id);
    if (!rowExists) {
        return {errorMessage: ErrorType.InvalidId, rowRemoved: false};
    } else {
        let rowRemoved = true;
        await sequelize
            .query(`DELETE
                    FROM \`${tableName}\`
                    WHERE id = ${id}`, {type: QueryTypes.DELETE})
            .catch(err => rowRemoved = false);
        return {rowRemoved};
    }
}

/**
 * The method attempts to create a row from the database given a table name, and its object data.
 *
 * If the table doesn't exist, an error is returned. Otherwise, we attempt to insert the row into the database.
 * @param tableName The table to query
 * @param data Key-value pairs that correspond to the table schema
 */
export async function createRow(tableName: string, data: object): Promise<{
    errorMessage?: string,
    rowCreated?: boolean
}> {
    if (!tableExists(tableName)) {
        return {errorMessage: ErrorType.InvalidTable};
    }

    let errorMessage: string;
    await sequelize.models[tableName].create(data).catch(v => {
        if (v instanceof ValidationError) {
            const error = v.errors.pop();
            errorMessage = error.message;
        }
    });

    if (errorMessage) {
        return {errorMessage: errorMessage};
    } else {
        return {rowCreated: true};
    }
}

/**
 * The method attempts to update a row from the database given a table name, and ID.
 *
 * If the table or ID doesn't exist, an error is returned. Otherwise, the database is queried, and the row is updated.
 * @param tableName The table to query
 * @param id The ID of the row to query
 * @param data The data to replace in the row
 */
export async function updateRow(tableName: string, id: number, data: object): Promise<{ errorMessage?: string;
    rowUpdated?: boolean }> {
    if (!tableExists(tableName)) {
        return {errorMessage: ErrorType.InvalidTable};
    }

    const rowExists = await idExistsInDatabase(tableName, id);
    if (!rowExists) {
        return {errorMessage: ErrorType.InvalidId, rowUpdated: false};
    }

    let errorMessage: string;
    await sequelize.models[tableName].update(data, {
        where: {
            id: id
        },
        modelName: tableName
    }).catch(error => {
        errorMessage = error.message;
    });

    if (errorMessage) {
        return {errorMessage: errorMessage};
    } else {
        return {rowUpdated: true};
    }
}

/**
 * A helper function that checks the existence of a table by name.
 * @param tableName The name of the table being checked
 */
function tableExists(tableName: string): boolean {
    for (let modelsKey in sequelize.models) {
        if (sequelize.models[modelsKey].getTableName() === tableName) {
            return true;
        }
    }
    return false;
}

/**
 * A helper function that checks if a given ID exists in a DB table.
 * @param tableName The name of the table being checked
 * @param id The ID to check
 */
async function idExistsInDatabase(tableName: string, id: number): Promise<boolean> {
    const query = `EXISTS(SELECT * FROM  \`${tableName}\` WHERE id = ${id})`;
    const results = await sequelize.query(`SELECT ` + query, {type: QueryTypes.SELECT})
    return (results.pop()[query] == 1);
}

/**
 * A set of static error messages to return when a query fails.
 */
export enum ErrorType {
    InvalidTable = `The specified table name is invalid.`,
    InvalidId = `The specified ID doesn't exist in the table.`,
    MissingRequiredField = `You failed to specify a not_null field.`
}
