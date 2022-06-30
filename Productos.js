const { mysql } = require('./databases/config');
const knex = require('knex')(mysql);

class Productos {
  async addProduct(newData) {
    try {
      await knex('products').insert({
        title: newData.title,
        price: newData.price,
        thumbnail: newData.thumbnail,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getById(id) {
    try {
      const product = await knex('products').where({ id });

      return product;
    } catch (error) {
      console.log(error);
    }
  }
  async update(id, data) {
    try {
      return await knex('products').where({ id }).update(
        {
          title: data.title,
          price: data.price,
          thumbnail: data.thumbnail,
        },
        '*'
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getAll() {
    return await knex('products');
  }

  async deleteById(id) {
    await knex('products').where({ id }).del();
  }
}

module.exports = Productos;
