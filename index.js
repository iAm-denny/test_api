const express = require("express");
const cors = require("cors");
const db = require("./models");

const app = express();
const PORT = 4000;

// route
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const followRouter = require("./routes/follow");

app.use(cors());
app.use(express.json());

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
