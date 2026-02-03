'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MemberStatus.hasMany(models.Member, { foreignKey: 'user_status' });
    }
  }
  MemberStatus.init({
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MemberStatus',
  });
  return MemberStatus;
};