const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const GiangVien = sequelize.define('GiangVien', {
    maGV: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    hoTen: DataTypes.STRING,
    boMon: DataTypes.STRING,
    email: DataTypes.STRING
}, {
    tableName: 'giangvien',
    timestamps: false
});

module.exports = GiangVien;
