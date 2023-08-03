import {DataTypes} from "sequelize";

const {Sequelize} = require('sequelize');

import {details} from "../config/db.config";

export const sequelize = new Sequelize({
    host: details.HOSTNAME,
    port: details.MYSQL_PORT,
    database: details.DATABASE,
    username: details.USERNAME,
    password: details.PASSWORD,
    dialect: details.DIALECT
});

/**
 * Defines a table schema in TS using Sequelize model.
 */
export const Users = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
    },
    gpa: {
        type: DataTypes.DECIMAL(4, 3),
        validate: {
            isDecimal: {
                msg: `The GPA field must be a decimal.`
            }
        }
    },
    streetNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: {
                msg: `The street number field must be an integer.`
            }
        }
    },
    registrationDate: {
        type: DataTypes.DATE
    }
}, {
    timestamps: false,
    tableName: "Users"
});

async function initialize() {
    try {
        await sequelize.sync({ force: true });
    } catch (error) {
        console.log(`Failed to synchronize with the database. Retrying...`)
    }

    console.log(`Initialization complete.`)
}

initialize().then(r => {
    console.log(`Initialized database.`);
});