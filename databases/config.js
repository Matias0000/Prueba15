module.exports = {
  mysql: {
    client: 'mysql',
    connection: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'chat',
    },
  },
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: './chat.sqlite',
    },
    useNullAsDefault: true,
  },
};
