'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('LigneCommandes', 'prixUnitaire', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('LigneCommandes', 'prixUnitaire');
  }
};
