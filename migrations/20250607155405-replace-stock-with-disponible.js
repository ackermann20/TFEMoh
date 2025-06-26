'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Produits : retirer 'stock' et ajouter 'disponible'
    await queryInterface.removeColumn('Produits', 'stock');
    await queryInterface.addColumn('Produits', 'disponible', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    // Garnitures : retirer 'stock' et ajouter 'disponible'
    await queryInterface.removeColumn('Garnitures', 'stock');
    await queryInterface.addColumn('Garnitures', 'disponible', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback : remettre 'stock' et supprimer 'disponible'
    await queryInterface.removeColumn('Produits', 'disponible');
    await queryInterface.addColumn('Produits', 'stock', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.removeColumn('Garnitures', 'disponible');
    await queryInterface.addColumn('Garnitures', 'stock', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  }
};
