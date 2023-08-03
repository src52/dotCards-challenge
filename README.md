# dotCards REST API Challenge

### Author: Spencer Carlson

This project uses Express and [Sequelize](https://www.npmjs.com/package//sequelize) to create a functional REST API 
that performs CRUD operations on a MySQL database.

## Features
### Technical requirements met
- GET (/:collection) requests fetch the specified row, and return JSON to the client.
- POST (/:collection) requests create a new row in the database if the correct parameters are specified.
- POST (/:collection/:id) requests modify rows in the database if the specified ID exists.
- DELETE (/:collection/:id) requests remove rows from the database if the specified ID exists.
- On server startup, tables specified in `schema.ts` are created in the database. 
---
### Project details
- 11 unit tests check edge cases like malformed parameters, invalid table names, and IDs.
- Proper error handling for unexpected events, detailed error messages are sent back to the client.
- Project is fully Dockerized: docker-compose.yml spins up fresh MySQL and NodeJS server instances.
- Code is well-documented, concise and organized.

If this project were running in a concurrent environment, we would need to verify that data being modified isn't already 
being modified elsewhere. This can be achieved using transactions and proper table/row locking when necessary.

Overall, I really enjoyed this project. It was a lot of fun, and it taught me about health check commands in Docker.

## Screenshots
![11 tests passing](images/img.png)