const route = require("express").Router();
const { Posts, Likes, Comments, SavedPost, Users } = require("../models");
const { validateToken } = require("../middlewares/validation");

route.get("/", async (req, res) => {
  const posts = await Posts.findAll({
    order: [["createdAt", "DESC"]],
    include: [Likes, Comments],
  });
  return res.json({ message: "success", data: posts });
});

route.post("/", validateToken, async (req, res) => {
  const { description } = req.body;
  try {
    const post = await Posts.create({
      description: description,
      UserId: req.user.id,
    });
    return res.json({
      message: "success",
      data: post,
    });
  } catch (err) {
    return res.json({ error: err });
  }
});

route.post("/like", validateToken, async (req, res) => {
  const { post_id } = req.body;
  try {
    const likeFound = await Likes.findOne({
      where: {
        UserId: req.user.id,
        PostId: post_id,
      },
    });

    if (!likeFound) {
      await Likes.create({
        UserId: req.user.id,
        PostId: post_id,
      });
      return res.json({
        message: "success liked",
      });
    } else {
      await Likes.destroy({
        where: {
          UserId: req.user.id,
          PostId: post_id,
        },
      });
      return res.json({
        message: "success unliked",
      });
    }
  } catch (err) {
    return res.json({ error: err });
  }
});

route.post("/comment", validateToken, async (req, res) => {
  const { post_id, body } = req.body;

  try {
    await Comments.create({
      body: body,
      PostId: post_id,
      UserId: req.user.id,
    });
    return res.json({ message: "success" });
  } catch (err) {
    return res.json({ error: err });
  }
});

route.get("/comments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await Comments.findAll({
      oreder: [["createdAt", "DESC"]],
      where: {
        PostId: id,
      },
    });
    return res.json({ message: "success", data: comments });
  } catch (err) {
    return res.json({ error: err });
  }
});

route.post("/saved_post", validateToken, async (req, res) => {
  const { post_id } = req.body;
  try {
    const postFound = await SavedPost.findOne({
      where: {
        UserId: req.user.id,
        PostId: post_id,
      },
    });

    if (!postFound) {
      await SavedPost.create({
        UserId: req.user.id,
        PostId: post_id,
      });

      return res.json({ message: "success saved" });
    } else {
      await SavedPost.destroy({
        where: {
          UserId: req.user.id,
          PostId: post_id,
        },
      });

      return res.json({ message: "success unsaved" });
    }
  } catch (err) {
    return res.json({ error: err });
  }
});

route.get("/saved_posts", validateToken, async (req, res) => {
  try {
    const savedPost = await Posts.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Users,
        },
        {
          model: SavedPost,
          where: {
            UserId: req.user.id,
          },
        },
      ],
    });

    return res.json({ message: "success", savedPost });
  } catch (err) {
    return res.json({ error: err });
  }
});

module.exports = route;
