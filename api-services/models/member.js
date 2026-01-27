'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Member.belongsTo(models.MemberStatus, { foreignKey: 'user_status' });
    }
  }
  Member.init({
    slug: DataTypes.STRING,
    username: DataTypes.STRING,
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    password: DataTypes.STRING,
    image: DataTypes.TEXT,
    last_login: DataTypes.DATE,
    last_transaction: DataTypes.DATE,
    provider_account_id: DataTypes.STRING,
    provider: DataTypes.STRING,
    provider_type: DataTypes.STRING,
    user_status: DataTypes.BIGINT,
    otp_code: DataTypes.STRING,
    otp_expires_at: DataTypes.DATE,
    refresh_token: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Member',
  });
  return Member;
};