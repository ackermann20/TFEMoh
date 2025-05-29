'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Produits', 'nom_en', {
  type: Sequelize.STRING,
  allowNull: true
  });
  await queryInterface.addColumn('Produits', 'nom_nl', {
    type: Sequelize.STRING,
    allowNull: true
  });
  await queryInterface.addColumn('Produits', 'description_en', {
    type: Sequelize.TEXT,
    allowNull: true
  });
  await queryInterface.addColumn('Produits', 'description_nl', {
    type: Sequelize.TEXT,
    allowNull: true
});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Produits', 'nom_en');
    await queryInterface.removeColumn('Produits', 'nom_nl');
    await queryInterface.removeColumn('Produits', 'description_en');
    await queryInterface.removeColumn('Produits', 'description_nl');

  }
};
