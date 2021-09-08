const route = require("express").Router();
const bcrypt = require("bcrypt");
const { Users } = require("../models");
const jwt = require("jsonwebtoken");

const secretCode = "<?.deaf7&^$&?75(_==)4";

route.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = await Users.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      return res.json({ message: "User already existed" });
    } else {
      bcrypt
        .hash(password, 10)
        .then(async (hash) => {
          await Users.create({
            username: username,
            email: email,
            password: hash,
          });
          res.json({ message: "Successfully created" });
        })
        .catch((err) => res.json({ message: err }));
    }
  } catch (err) {
    return res.json({ error: err });
  }
});

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({
      where: {
        email: email,
      },
    });

    if (!user) res.json({ message: "User not found" });
    else {
      bcrypt.compare(password, user.password).then((match) => {
        if (!match) res.json({ message: "User not found" });

        const accessToken = jwt.sign(
          {
            id: user.id,
            username: user.username,
            email: user.email,
          },
          secretCode,
          {
            expiresIn: 3 * 24 * 60 * 60, // 3 days
          }
        );
        return res.json({ accessToken });
      });
    }
  } catch (err) {
    return res.json({ error: err });
  }
});

module.exports = route;
