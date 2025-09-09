const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const SinhVien = sequelize.define('SinhVien', {
    maSV: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    hoTen: DataTypes.STRING,
    lop: DataTypes.STRING,
    ngaySinh: DataTypes.DATE,
    gioiTinh: DataTypes.STRING,
    email: DataTypes.STRING
}, {
    tableName: 'sinhvien',
    timestamps: false
});

module.exports = SinhVien;
