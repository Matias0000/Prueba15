const { mysql, sqlite } = require('./config');

const knexMySQL = require('knex')(mysql);
const knexSQLite = require('knex')(sqlite);
knexMySQL.schema
  .hasTable('products')
  .then((exists) => {
    if (exists) return;
    return knexMySQL.schema.createTable('products', (table) => {
      table.increments();
      table.string('title').notNullable();
      table.integer('price').notNullable();
      table.string('thumbnail').notNullable();
    });
  })
  .catch((err) => console.log(err));
knexSQLite.schema
  .hasTable('messages')
  .then((exists) => {
    if (exists) return;
    return knexSQLite.schema.createTable('messages', (table) => {
      table.increments();
      table.string('email');
      table.string('message');
      table.string('date');
    });
  })
  .catch((err) => console.log(err));
