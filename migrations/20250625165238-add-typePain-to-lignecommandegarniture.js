'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lignecommandegarnitures', 'typePain', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'blanc',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('lignecommandegarnitures', 'typePain');
  }
};
