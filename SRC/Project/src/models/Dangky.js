const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const SinhVien = require('./sinhvien');
const HocPhan = require('./HocPhan');

const DangKy = sequelize.define('DangKy', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    trangThai: DataTypes.STRING,
    ngayDangKy: DataTypes.DATE
}, {
    tableName: 'dangky',
    timestamps: false
});

// Quan hệ: SinhVien - HocPhan (N-N)
SinhVien.belongsToMany(HocPhan, { through: DangKy, foreignKey: 'maSV' });
HocPhan.belongsToMany(SinhVien, { through: DangKy, foreignKey: 'maHP' });

module.exports = DangKy;
