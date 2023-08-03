import request from 'supertest';
import {ErrorType} from "../src/crud";
import {sequelize, Users} from "../src/schema";
import {app, server} from "../src/app";

const tableName = `Users`;
const user = {
    id: 1,
    firstName: `Firsttest`,
    lastName: `Lasttest`,
    gpa: "3.024",
    streetNumber: 4455,
    registrationDate: `2023-08-02T20:24:37.000Z`
};

beforeAll(async () => {
    try {
        await sequelize.sync({ force: true, alter: true });
        await sequelize.models[tableName].create(user);
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.log('Unable to connect to the database:', error);
    }
})

afterAll(async () => {
    await server.close();
    await sequelize.close();
})

describe('GET requests', () => {
    test('Returns error when ID is not specified', async () => {
        const path = createUrlString([tableName]);
        const result = await request(app).get(path).send();
        expect(result.status).toBe(404);
    });

    test(`Returns error when ID doesn't exist in table`, async () => {
        const path = createUrlString([tableName, 5000]);
        const result = await request(app).get(path).send();
        expect(result.status).toBe(400);
        expect(result.body.error).toBe(ErrorType.InvalidId);
    });

    test(`Returns error when table doesn't exist`, async () => {
        const path = createUrlString([`Cats`, 1]);
        const result = await request(app).get(path).send();
        expect(result.status).toBe(400);
        expect(result.body.error).toBe(ErrorType.InvalidTable);
    });

    test('Returns successfully when reading with valid row and ID', async () => {
        const path = createUrlString([tableName, user.id]);
        const result = await request(app).get(path).send();

        expect(result.status).toBe(200);
        expect(result.body.row).toStrictEqual(user);
    });
});


describe('DELETE requests', () => {
    test(`Returns successfully when deleting with valid row and ID.`, async () => {
        let userToDelete = { ...user };
        userToDelete.id++;
        await sequelize.models[tableName].create(userToDelete);

        const path = createUrlString([tableName, userToDelete.id]);
        const result = await request(app).delete(path).send();
        expect(result.status).toBe(200);
        expect(result.body.rowRemoved).toBe(true);
    });

    test(`Returns error when deleting with ID that doesn't exist in table`, async () => {
        const path = createUrlString([tableName, 50]);
        const result = await request(app).delete(path).send();
        expect(result.status).toBe(400);
        expect(result.body.error).toBe(ErrorType.InvalidId);
    });
});

describe('POST requests', () => {
    test('Returns successfully when new user is added to database', async () => {
        let userToCreate = { ...user };
        userToCreate.id++;
        userToCreate.firstName = `Scott`;

        const path = createUrlString([tableName], userToCreate);
        const result = await request(app).post(path).send();
        expect(result.status).toBe(200);
        expect(result.body.rowCreated).toBe(true);
    });

    test(`Returns error when missing required fields`, async () => {
        let invalidUserData = { ...user };
        const fieldNameToRemove = `firstName`;
        const missingField = `${tableName}.${fieldNameToRemove}`;
        delete invalidUserData[fieldNameToRemove];

        const path = createUrlString([tableName], invalidUserData);
        const result = await request(app).post(path).send();

        expect(result.status).toBe(400);
        expect(result.body.error).toEqual(`${missingField} cannot be null`);
    });

    test(`Returns error when creating entry with malformed field value`, async () => {
        let invalidUserData = { ...user };
        invalidUserData.gpa = `Four`;
        const path = createUrlString([tableName], invalidUserData);
        const result = await request(app).post(path).send();
        const expectedMessage = sequelize.models[tableName].rawAttributes[`gpa`].validate.isDecimal[`msg`];
        expect(result.status).toBe(400);
        expect(result.body.error).toEqual(expectedMessage);
    });

    test(`Returns error when updating entry with an ID that isn't in table`, async () => {
        let userToUpdate = { ...user };
        userToUpdate.id = 1234;

        const path = createUrlString([tableName, userToUpdate.id], userToUpdate);
        const result = await request(app).post(path).send();

        expect(result.status).toBe(400);
        expect(result.body.error).toEqual(ErrorType.InvalidId);
    });

    test(`Returns successfully when updating user with valid data`, async () => {
        let updatedUserValues = { ...user };
        updatedUserValues.lastName = `Smith`;
        const path = createUrlString([tableName, updatedUserValues.id], updatedUserValues);
        const result = await request(app).post(path).send();

        expect(result.status).toBe(200);
        expect(result.body.rowUpdated).toEqual(true);
    });
});

/**
 * Creates a URL string given a set of URL parameters (/x/y/z), and query parameters (?x=5&y=12&z=48)
 * @param urlParams The parameters of the URL to append.
 * @param queryParams The query parameters to append.
 */
function createUrlString(urlParams: any[], queryParams?: {}): string {
    let urlPath: string = ``;

    urlParams.forEach(param => urlPath = urlPath.concat(`/`, param));
    urlPath = urlPath.concat(`?`);
    for (const queryKey in queryParams) {
        urlPath = urlPath.concat(`${queryKey}=${queryParams[queryKey]}&`)
    }
    console.info(`URL PATH: ` + urlPath)
    return urlPath.substring(0, urlPath.length - 1);
}