'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('utilisateurs', 'solde', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('utilisateurs', 'solde');
  }
};