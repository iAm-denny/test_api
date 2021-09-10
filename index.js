const express = require("express");
const cors = require("cors");
const db = require("./models");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const { Server } = require('socket.io')
const http = require('http')
const { Notifications } = require('./models')

const app = express();
const PORT = 4000;

// route
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const followRouter = require("./routes/follow");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social API",
      version: "1.0.0",
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
  apis: ["./routes/*.js"],
};



const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


const openapiSpecification = swaggerJsDoc(options);

app.use(cors());
app.use(express.json());
app.set('socketio', io);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/follow", followRouter);


io.on('connection', async (socket) => {
  console.log('socket connected ', socket.id);
  const notis = await Notifications.findAll();
  console.log('notis', notis)
  console.log('-----------------')
  io.emit('get_notifications', notis)
})

db.sequelize
  .sync()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

  })
  .catch((err) => {
    console.log("err", err);
  });


