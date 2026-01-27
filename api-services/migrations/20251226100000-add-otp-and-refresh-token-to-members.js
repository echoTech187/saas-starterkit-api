'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('members', 'otp_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('members', 'otp_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('members', 'refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('members', 'otp_code');
    await queryInterface.removeColumn('members', 'otp_expires_at');
    await queryInterface.removeColumn('members', 'refresh_token');
  }
};
