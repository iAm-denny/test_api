const route = require("express").Router();
const { Users, Follows, Posts, Likes, Sequelize } = require("../models");
const { validateToken } = require("../middlewares/validation");
const { QueryTypes } = require("sequelize");

route.post("/", validateToken, async (req, res) => {
  const { toUserId } = req.body;

  try {
    const userFound = await Follows.findOne({
      UserId: req.user.id,
      toUserId: toUserId,
    });

    if (!userFound) {
      await Follows.create({
        UserId: req.user.id,
        toUserId: toUserId,
      });
      return res.json({ message: "success followed" });
    } else {
      await Follows.destroy({
        where: {
          UserId: req.user.id,
          toUserId: toUserId,
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
    // const followedPosts = await Follows.findAll({
    //   where: {
    //     UserId: req.user.id,
    //   },
    //   include: [
    //     {
    //       model: Users,
    //       include: [
    //         {
    //           model: Posts,
    //         },
    //       ],
    //     },
    //   ],
    // });
    const followedPosts = await Posts.findAll({
      include: [
        {
          model: Users,
        },
        {
          model: Follows,
          where: {
            UserId: req.user.id,
          },
        },
      ],
    });

    return res.json({ message: "success", followedPosts: followedPosts });

    // const followedUser = await Follows.findAll({
    //   UserId: req.user.id,
    // });

    // let toUserIds = [];
    // const data = followedUser.map((f) => toUserIds.push(f.toUserId));

    // if (data) {
    //   const followedPosts = await Posts.findAll({
    //     where: {
    //       UserId: { [Sequelize.Op.in]: [...data] },
    //     },
    //   });
    //   return res.json({ message: "success", followedPosts: followedPosts });
    // }
  } catch (err) {
    return res.json({ error: err });
  }
});

module.exports = route;
