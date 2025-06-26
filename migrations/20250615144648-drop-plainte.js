'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('plaintes');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('plaintes', {
      // recréer les champs si besoin
    });
  }
};
