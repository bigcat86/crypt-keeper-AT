const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Coin extends Model {}

Coin.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        coin_name: {
           type: DataTypes.STRING,
           allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false,
            validate: {
                isDecimal: true
            }
        }
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'coin',
    }
);

module.exports = Coin;