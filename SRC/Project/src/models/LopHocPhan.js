const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const HocPhan = require('./HocPhan');
const GiangVien = require('./GiangVien');

const LopHocPhan = sequelize.define('LopHocPhan', {
    maLHP: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    thu: DataTypes.STRING,
    tietHoc: DataTypes.STRING,
    phongHoc: DataTypes.STRING
}, {
    tableName: 'lophocphan',
    timestamps: false
});

// Quan hệ
HocPhan.hasMany(LopHocPhan, { foreignKey: 'maHP' });
LopHocPhan.belongsTo(HocPhan, { foreignKey: 'maHP' });

GiangVien.hasMany(LopHocPhan, { foreignKey: 'maGV' });
LopHocPhan.belongsTo(GiangVien, { foreignKey: 'maGV' });

module.exports = LopHocPhan;
