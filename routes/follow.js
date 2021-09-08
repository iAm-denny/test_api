const route = require("express").Router();
const { Users, Follows, Posts, Likes, sequelize } = require("../models");
const { validateToken } = require("../middlewares/validation");

route.post("/", validateToken, async (req, res) => {
  const { toUserId } = req.body;

  try {
    const userFound = await Follows.findOne({
      user_id: toUserId,
      followByUser_id: req.user.id,
    });

    if (!userFound) {
      await Follows.create({
        user_id: toUserId,
        followByUser_id: req.user.id,
      });
      return res.json({ message: "success followed" });
    } else {
      await Follows.destroy({
        where: {
          user_id: toUserId,
          followByUser_id: req.user.id,
        },
      });
      return res.json({ message: "success unfollowed" });
    }
  } catch (err) {
    return res.json({ error: err });
  }
});

route.get("/posts", validateToken, async (req, res) => {
  try {
    const raw_query = `
    SELECT * FROM follows JOIN posts
    ON follows.user_id = posts.UserId
    JOIN users ON
    posts.UserId = users.id
    WHERE
    followbyuser_id  = ${req.user.id}`;

    const followedPosts = await sequelize.query(raw_query, {
      type: sequelize.QueryTypes.SELECT,
    });

    console.log("followedPosts", followedPosts);

    return res.json({ message: "success", followedPosts: followedPosts });
  } catch (err) {
    return res.json({ error: err });
  }
});

module.exports = route;
