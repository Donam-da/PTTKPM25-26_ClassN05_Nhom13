const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const SinhVien = require('./sinhvien');
const HocPhan = require('./HocPhan');

const DangKyStates = Object.freeze({
  KHOI_TAO: 'KHOI_TAO',
  DANG_XU_LY: 'DANG_XU_LY',
  THANH_CONG: 'THANH_CONG',
  CHO_DOI: 'CHO_DOI',
  TU_CHOI: 'TU_CHOI',
  DA_HUY: 'DA_HUY'
});

const DangKy = sequelize.define('DangKy', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    trangThai: { type: DataTypes.STRING, defaultValue: DangKyStates.KHOI_TAO },
    ngayDangKy: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'dangky',
    timestamps: false
});

// Instance methods: state transitions
DangKy.prototype.submit = function() {
  if (this.trangThai !== DangKyStates.KHOI_TAO) throw new Error('Invalid state');
  this.trangThai = DangKyStates.DANG_XU_LY; return this.save();
};
DangKy.prototype.markValid = function() {
  if (this.trangThai !== DangKyStates.DANG_XU_LY) throw new Error('Invalid state');
  return Promise.resolve(this);
};
DangKy.prototype.confirm = function() {
  if (this.trangThai !== DangKyStates.DANG_XU_LY) throw new Error('Invalid state');
  this.trangThai = DangKyStates.THANH_CONG; return this.save();
};
DangKy.prototype.waitlist = function() {
  if (this.trangThai !== DangKyStates.DANG_XU_LY) throw new Error('Invalid state');
  this.trangThai = DangKyStates.CHO_DOI; return this.save();
};
DangKy.prototype.resumeFromWaitlist = function() {
  if (this.trangThai !== DangKyStates.CHO_DOI) throw new Error('Invalid state');
  this.trangThai = DangKyStates.DANG_XU_LY; return this.save();
};
DangKy.prototype.reject = function(reason) {
  if (this.trangThai !== DangKyStates.DANG_XU_LY) throw new Error('Invalid state');
  this.trangThai = DangKyStates.TU_CHOI; this.lyDoTuChoi = reason; return this.save();
};
DangKy.prototype.cancel = function() {
  if (![DangKyStates.THANH_CONG, DangKyStates.CHO_DOI].includes(this.trangThai)) throw new Error('Invalid state');
  this.trangThai = DangKyStates.DA_HUY; return this.save();
};

// Quan hệ: SinhVien - HocPhan (N-N)
SinhVien.belongsToMany(HocPhan, { through: DangKy, foreignKey: 'maSV' });
HocPhan.belongsToMany(SinhVien, { through: DangKy, foreignKey: 'maHP' });

module.exports = DangKy;


module.exports.DangKyStates = DangKyStates;
