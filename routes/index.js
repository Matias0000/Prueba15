
const express = require('express');
const http = require('http');
const Chat = require('../Chat');
const Productos = require('../Productos');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const { normalize, schema } = require('normalizr');
const io = new Server(server);

const cookieParser = require('cookie-parser')
const session =require('express-session')
const faker = require('faker');
const router = express.Router()
const passport =require( "passport");
const { Strategy } =require( "passport-local");
const LocalStrategy = Strategy;
const bcrypt = require('bcrypt');





const products = new Productos();
const mensajes = new Chat();



// Normalizacion como lo pidio el profe
const author = new schema.Entity('authors');
const message = new schema.Entity('messages', {
  author: author,
});

const messagesSchema = new schema.Array(message);

router.get('/api/messages', async (req, res) => {
  const messages = await mensajes.getAll();

  res.json(normalize(messages, messagesSchema))
})


// router.get('/productos', async (req, res) => {
//   const productos = await products.getAll();
//   let messages = await mensajes.getAll();
//   res.render('main', { title: 'Productos', productos, messages });
// });


// mongoose.connect('mongodb+srv://Matias:coderhouse@cluster0.asa9o.mongodb.net/ecommerce').then(res => console.log('Conectado a DB')).catch(err => console.log(err))


passport.use(new LocalStrategy(
  (username, password, done)=>{
      //Logica para validar si un usuario existe
      const existeUsuario = usuariosDB.find(usuario => {
          return usuario.nombre == username;
      });

      if (!existeUsuario) {
          console.log('Usuario no encontrado')
          return done(null, false);
      }

      if(!(existeUsuario.password == password)){
          console.log('Contrase;a invalida')
          return done(null, false);
      }

      return done(null, existeUsuario);
  }
))

passport.serializeUser((usuario, done)=>{
  done(null, usuario.nombre);
})

passport.deserializeUser((nombre, done)=>{
  const usuario = usuariosDB.find(usuario => usuario.nombre == nombre);
  done(null, usuario);
});

router.use(cookieParser());
// router.use(session({
//     secret: '1234567890!@#$%^&*()',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 20000 //20 seg
//     },
//   //   store: MongoStore.create({
//   //     mongoUrl:
//   //        'mongodb+srv://Matias:coderhouse@cluster0.asa9o.mongodb.net/ecommerce',
//   //     dbName: 'ecommerce',
//   //     collectionName: 'sessions',
//   //  }),
// }))

router.use(passport.initialize());
router.use(passport.session());



function isAuth(req, res, next) {
  if(req.isAuthenticated()){
      next()
  } else {
      res.redirect('/login')
  }
}

const usuariosDB = [];

/*============================[Rutas]============================*/
router.get('/', (req, res)=>{
    if (req.session.nombre) {
        res.redirect('/datos')
    } else {
        res.redirect('/login')
    }
})

router.get('/login', (req, res)=>{
    res.render('login');
})

router.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/productos',
        failureRedirect: '/login-error'
    }
))

router.get('/login-error', (req, res)=>{
    res.render('login-error');
})

router.get('/register', (req, res)=>{
    res.render('register');
})

router.post('/register', (req, res)=>{
    const {nombre, password } = req.body;
    
    const newUsuario = usuariosDB.find(usuario => usuario.nombre == nombre);
    if (newUsuario) {
        res.render('register-error')
    } else {
        usuariosDB.push({nombre, password});
        res.redirect('/login')
    }
});

// router.get('/datos', isAuth, (req, res)=>{
//     if(!req.user.contador){
//         req.user.contador = 1
//     } else {
//         req.user.contador++
//     }
//     const datosUsuario = {
//         nombre: req.user.nombre,
//         direccion: req.user.direccion
//     }
//     res.render('datos', {contador: req.user.contador, datos: datosUsuario});
// });

router.get('/productos', isAuth, async (req, res)=>{
  const productos = await products.getAll();
  let messages = await mensajes.getAll();
  const datosUsuario = {
      nombre: req.user.nombre,
      direccion: req.user.direccion
  }
  res.render('main', {main: datosUsuario,title: 'Productos', productos, messages});
});


router.get('/logout', (req, res)=>{

  res.redirect('/');
});


router.get('/api/productos-test', async (req, res) => {
  const productos = [null,null,null,null,null].map((id) => {
    return {
      id,
      title: faker.commerce.product(),
      price: faker.commerce.price(),
      thumbnail: faker.image.image(),
    };
  });
  res.render('random', { title: 'Productos Random', productos });
});
  
 io.on('connection', (socket) => {
  console.log('New conection', socket.id);

  socket.on('disconnect', () => {
    console.log(socket.id, 'disconnected');
  });

  socket.on('add-product', (product) => {
    products.addProduct(product);

    io.emit('update-products', product);
  });

  socket.on('message', async (message) => {
    const data = {
      author: {
        id: message.author.id,
        nombre: message.author.nombre,
        apellido: message.author.apellido,
        alias: message.author.alias,
        edad: message.author.edad,
        avatar: message.author.avatar,
      },
      text: message.text,
      date: new Date().toLocaleString()
    };
    await mensajes.save(data);

    io.emit('message', data);
  });
});







module.exports = router


