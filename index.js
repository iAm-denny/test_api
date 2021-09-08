const express = require("express");
const cors = require("cors");
const db = require("./models");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

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

const openapiSpecification = swaggerJsDoc(options);

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/follow", followRouter);

db.sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch((err) => {
    console.log("err", err);
  });
