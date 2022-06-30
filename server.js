require('dotenv').config({path:'./.env'})
const handlebars = require('express-handlebars')
const path = require('path');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./Chat');
const Productos = require('./Productos');
const app = express();
const server = http.createServer(app);
const { normalize, schema } = require('normalizr');
const io = new Server(server);
const faker = require('faker');

const passport =require( "passport");
const { Strategy } =require( "passport-local");
const LocalStrategy = Strategy;

const session =require('express-session')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const User = require('./models/user')
const { fork } = require('child_process');
const cluster = require('cluster');

const args = require('minimist')(process.argv.slice(2));

const main = async () => {
  console.log(`Worker ${process.pid} started`);


// middleware 
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'index.hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
  defaultLayout: 'index',
  extname: 'hbs',
}))

app.set('view engine', 'hbs')
app.set('views', __dirname +'/views')


app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))



const products = new Productos();
const mensajes = new Chat();



// Normalizacion como lo pidio el profe
const author = new schema.Entity('authors');
const message = new schema.Entity('messages', {
  author: author,
});

const messagesSchema = new schema.Array(message);

app.get('/api/messages', async (req, res) => {
  const messages = await mensajes.getAll();

  res.json(normalize(messages, messagesSchema))
})


// app.get('/productos', async (req, res) => {
//   const productos = await products.getAll();
//   let messages = await mensajes.getAll();
//   res.render('main', { title: 'Productos', productos, messages });
// });


// mongoose.connect('mongodb+srv://Matias:coderhouse@cluster0.asa9o.mongodb.net/ecommerce').then(res => console.log('Conectado a DB')).catch(err => console.log(err))

mongoose.connect(process.env.MONGO_URI).then(res => console.log('Conectado a DB')).catch(err => console.log(err))


// app.get('/productos',async (req, res)=>{
//   const productos = await products.getAll();
//   let messages = await mensajes.getAll();

//   // const datosUsuario = 'pepito'
//   const datosUsuario = {
//       email: req.body.email,
//       // direccion: req.user.direccion
//   }
//   res.render('main', {main: datosUsuario,title: 'Productos', productos, messages});
// });


app.get('/productos', async (req, res) => {
  
  // if (!req.user) {
  //    return res.redirect('/login');
  // }

  const productos = await products.getAll();

  let messages = await mensajes.getAll();
  
  req.body.email="hola"
  const datosUsuario = {
    email: req.body.email,
    // direccion: req.user.direccion
}
// console.log(req.body.email)
  res.render('main', {main:datosUsuario, title: 'Productos', productos, messages });
});

// app.get('/logout', (req, res)=>{

//   res.redirect('/');
// });







app.use(express.urlencoded({ extended: true }));
app.use(
   session({
      secret: '1234567890!@#$%^&*()',
      saveUninitialized: false,
      resave: false,
      cookie: {
         maxAge: 60000 * 10,
      },
      store: MongoStore.create({
         mongoUrl:
         process.env.MONGO_URI || 'mongodb+srv://Matias:coderhouse@cluster0.asa9o.mongodb.net/ecommerce',
            // mongoUrl:
            // process.env.MONGO_URI,
         dbName: 'ecommerce',
         collectionName: 'sessions',
      }),
   })
);




passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {

  try {

     const user = await User.findOne({ email })

     if (!user) return done(null, false)

     const validarPassword = await bcrypt.compare(password, user.password)

     if (!validarPassword) return done(null, false);

     return done(null, user);
  } catch (err) {
     console.log(err);
     done(err)
  }
}))

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
     cb(null, { id: user.id, email: user.email });
  })
})


passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
     return cb(null, user);
  })
})

app.get('/api/messages', async (req, res) => {
  const messages = await mensajes.getAll();

  res.json(messages);
});

// app.get('/productos', async (req, res) => {
  
//   if (!req.user) {
//      return res.redirect('/login');
//   }

//   const productos = await products.getAll();

//   let messages = await mensajes.getAll();

//   const datosUsuario = {
//     email: req.user.email,
//     // direccion: req.user.direccion
// }
// console.log(req.user.email)
//   res.render('main', {main:datosUsuario, title: 'Productos', productos, messages });
// });

app.get('/login', async (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', async (req, res) => {
  res.render('register', { title: 'Register' });
});

app.post('/register', async(req, res,done) => {
  try {
     const user =  await User.findOne({ email: req.body.email });

     if (user) return res.render('register-error')

     const brcrytPaswword = await bcrypt.hash(req.body.password, 10);

     const newUser = new User({
        email: req.body.email,
        password: brcrytPaswword
     })

     await newUser.save()
     done(null, newUser);
     res.redirect('login')
  } catch (err) {
     console.log(err);
     return res.json({ error: err })
  }
})




app.post('/login', passport.authenticate('local', 
{ session: true,
  successRedirect: '/productos',
  failureRedirect: '/login-error' 
  }), async (req, res) => {
  console.log(req.user);
  return res.redirect('productos')

});

app.get('/login-error', (req, res)=>{
  res.render('login-error');
})



app.get('/logout', async (req, res) => {
  if (!req.user) return res.redirect('/login');
  const email = req.user.email
  req.logout((err) => {
     if (err) return
     return res.render('logout', { title: 'Logout', name: email });
  })

});


app.get('/api/productos-test', async (req, res) => {
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


const args = require('minimist')(process.argv.slice(2));

console.log(args);

app.get('/info', async (req, res) => {

  const informacion = {
     args: process.argv.slice(2),
     os: process.platform,
     node_v: process.version,
     memory: process.memoryUsage(),
     path: process.execPath,
     pid: process.pid,
     dir: process.cwd()
  }
  
  console.log(informacion);

  res.render('info', { title: 'informacion', informacion });
})

app.get('/api/random', (req, res) => {
  const result = {}

  const amount = parseInt(req.query.cant) || 100_000_000

  const forked = fork(path.join(__dirname, './random.js'))

  forked.send({ start: true, amount })

  forked.on('message', (result) => {

    res.json(result)

  })
})








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

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ err, message: 'Fallo todo lo que podia fallar' });
});

const PORT = process.env.PORT || 8085;

server.listen(PORT, () => {
	console.log(`Servidor:${PORT}`);
});

server.on('error', error => {
	console.log(`Algo salio mal: ${error}`);
});

}

const MODE = args.mode || 'FORK';

if (MODE === 'CLUSTER') {
   if (cluster.isPrimary) {
      console.log(`Number of CPUs is ${totalCPUs}`);
      console.log(`Master ${process.pid} is running`);

      // Fork workers.
      for (let i = 0; i < totalCPUs; i++) {
         cluster.fork();
      }

      cluster.on("exit", (worker, code, signal) => {
         console.log(`worker ${worker.process.pid} died`);
         console.log("Let's fork another worker!");
         cluster.fork();
      });
   } else {
      main().catch(err => console.log(err));
   }
} else {
   main().catch(err => console.log(err));
}