const route = require("express").Router();
const bcrypt = require("bcrypt");
const { Users, Notifications, Posts, sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const { validateToken } = require("../middlewares/validation");
const secretCode = "<?.deaf7&^$&?75(_==)4";

/**
 * @swagger
 * /register:
 *  post:
 *    description: "Create account"
 *    requestBody:
 *      required: true
 *      content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *             username:
 *              type: string
 *             email:
 *              type: string
 *             password:
 *              type: string
 *      responses:
 *      '200':
 *           description: 'Created successfully'
 *           content:
 *                application/json:
 */

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

/**
 * @swagger
 * /login:
 *  post:
 *    description: "Log in"
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            email:
 *              type: string
 *            password:
 *              type: string
 *    responses:
 *    '200':
 *        description: "Logged in successfully"
 *        content:
 *            application/json:
 *
 */

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

route.get("/notifications", validateToken, async (req, res) => {
  try {

    const io = req.app.get('socketio')

    const raw_query = `
    SELECT 
    notifications.type, notifications.post_id, users.username, notifications.read
    FROM notifications
    JOIN users ON 
    notifications.by_userId = users.id
    WHERE notifications.to_userId = ${req.user.id}`;

    const notis = await sequelize.query(raw_query, {
      type: sequelize.QueryTypes.SELECT,
    });

    io.emit('get_notifications', notis)

    return res.json({ message: "success", notifications: notis });
  } catch (err) {
    return res.json({ error: err });
  }
});




route.post("/read_notifications", validateToken, async (req, res) => {
  try {
    const updatedNotifcations = await Notifications.update(
      {
        read: true,
      },
      {
        where: {
          to_userId: req.user.id,
        },
      }
    );
    return res.json({ message: "success", notifications: updatedNotifcations });
  } catch (err) {
    return res.json({ error: err });
  }
});

module.exports = route;
