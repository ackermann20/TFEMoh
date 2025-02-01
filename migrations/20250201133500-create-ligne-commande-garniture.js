'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LigneCommandeGarnitures', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ligneCommandeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LigneCommandes', 
          key: 'id',
        },
        onDelete: 'CASCADE', 
      },
        garnitureId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Garnitures',
            key: 'id',
          },
          onDelete: 'CASCADE', 
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LigneCommandeGarnitures');
  }
};