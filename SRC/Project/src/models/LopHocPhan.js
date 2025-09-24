const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const HocPhan = require('./HocPhan');
const GiangVien = require('./GiangVien');

const LopHocPhanStates = Object.freeze({
  SAP_MO: 'SAP_MO',
  DANG_MO: 'DANG_MO',
  DA_DAY: 'DA_DAY',
  DA_DONG: 'DA_DONG',
  DA_HUY: 'DA_HUY'
});

const LopHocPhan = sequelize.define('LopHocPhan', {
    maLHP: { type: DataTypes.STRING, primaryKey: true },
    thu: DataTypes.STRING,
    tietHoc: DataTypes.STRING,
    phongHoc: DataTypes.STRING,
    chiTieu: { type: DataTypes.INTEGER, defaultValue: 0 },
    siSo: { type: DataTypes.INTEGER, defaultValue: 0 },
    trangThai: { type: DataTypes.STRING, defaultValue: LopHocPhanStates.SAP_MO }
}, {
    tableName: 'lophocphan',
    timestamps: false
});

// Helper & transitions
LopHocPhan.prototype.conCho = function() {
  return this.siSo < this.chiTieu;
};
LopHocPhan.prototype.openRegistration = function() {
  if (this.trangThai !== LopHocPhanStates.SAP_MO) throw new Error('Invalid state');
  this.trangThai = LopHocPhanStates.DANG_MO; return this.save();
};
LopHocPhan.prototype.closeRegistration = function() {
  if (![LopHocPhanStates.DANG_MO, LopHocPhanStates.DA_DAY].includes(this.trangThai)) throw new Error('Invalid state');
  this.trangThai = LopHocPhanStates.DA_DONG; return this.save();
};
LopHocPhan.prototype.cancelClass = function(reason) {
  if (this.trangThai === LopHocPhanStates.DA_HUY) return Promise.resolve(this);
  this.trangThai = LopHocPhanStates.DA_HUY; this.lyDoHuy = reason; return this.save();
};
LopHocPhan.prototype.themSinhVien = function() {
  if (this.trangThai !== LopHocPhanStates.DANG_MO) throw new Error('Lớp chưa mở đăng ký');
  if (!this.conCho()) throw new Error('Lớp đã đầy');
  this.siSo += 1;
  if (!this.conCho()) this.trangThai = LopHocPhanStates.DA_DAY;
  return this.save();
};
LopHocPhan.prototype.xoaSinhVien = function() {
  if (this.siSo > 0) this.siSo -= 1;
  if (this.trangThai === LopHocPhanStates.DA_DAY && this.conCho()) this.trangThai = LopHocPhanStates.DANG_MO;
  return this.save();
};
LopHocPhan.prototype.setChiTieu = function(newQuota) {
  if (newQuota <= 0) throw new Error('Chỉ tiêu phải > 0');
  this.chiTieu = newQuota;
  if (this.trangThai === LopHocPhanStates.DA_DAY && this.conCho()) this.trangThai = LopHocPhanStates.DANG_MO;
  return this.save();
};


// Quan hệ
HocPhan.hasMany(LopHocPhan, { foreignKey: 'maHP' });
LopHocPhan.belongsTo(HocPhan, { foreignKey: 'maHP' });

GiangVien.hasMany(LopHocPhan, { foreignKey: 'maGV' });
LopHocPhan.belongsTo(GiangVien, { foreignKey: 'maGV' });

module.exports = LopHocPhan;


module.exports.LopHocPhanStates = LopHocPhanStates;
