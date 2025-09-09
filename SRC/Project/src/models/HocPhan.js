const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const HocPhan = sequelize.define('HocPhan', {
    maHP: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    tenHP: DataTypes.STRING,
    soTinChi: DataTypes.INTEGER,
    hocKy: DataTypes.INTEGER,
    dieuKienTienQuyet: DataTypes.STRING  // có thể để null
}, {
    tableName: 'hocphan',
    timestamps: false
});

module.exports = HocPhan;
