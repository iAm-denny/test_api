const route = require("express").Router();
const {
  Posts,
  Likes,
  Comments,
  SavedPost,
  Users,
  Notifications,
} = require("../models");
const { validateToken } = require("../middlewares/validation");

const redis = require("redis");
const redisClient = redis.createClient();
const DEFAULT_EXPIRATION = 3600; // 1 hour

const redisCacheFun = (key, cb) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, async (error, data) => {
      if (error) return reject(error);
      if (data != null) return resolve(JSON.parse(data)); // If data is existing in redis, return that one
      const freshData = await cb(); // else fetch data and then saved into redis
      redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
      resolve(freshData);
    });
  });
};

/**
 * @swagger
 * /post/:
 *  get:
 *    description: Get All Posts
 *    responses:
 *      '200':
 *          description: "success"
 *          content:
 *            application/json:
 */

route.get("/", async (req, res) => {
  try {
    const posts = await redisCacheFun("posts", async () => {
      const posts = await Posts.findAll({
        order: [["createdAt", "DESC"]],
        include: [Likes, Comments],
      });
      return posts;
    });
    return res.json({ message: "success", data: posts });
  } catch (err) {
    return res.json({ error: err });
  }
});

/**
 * @swagger
 * /post:
 *  post:
 *    security:
 *    - OAuth2: [admin]
 *    - BasicAuth: []
 *    description: "Create a post"
 *    requestBody:
 *        required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            description: string
 */

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

/**
 * @swagger
 * /post/like:
 *  post:
 *    description: 'Like a post'
 *    parameters:
 *      - in : path
 *        name: accessToken
 *        type: string
 *        required: true
 *        description: "Access Token"
 *    requestBody:
 *      required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            post_id: number
 */

route.post("/like", validateToken, async (req, res) => {
  const { post_id, post_userId } = req.body;
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

      await Notifications.create({
        type: "like",
        by_userId: req.user.id,
        post_id: post_id,
        to_userId: post_userId,
        read: false,
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

      await Notifications.destroy({
        where: {
          type: "like",
          by_userId: req.user.id,
          post_id: post_id,
          to_userId: post_userId,
          read: false,
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
  const { post_id, body, post_user_id } = req.body;

  try {
    await Comments.create({
      body: body,
      PostId: post_id,
      UserId: req.user.id,
    });

    await Notifications.create({
      type: "comment",
      post_id: post_id,
      to_userId: post_user_id,
      by_userId: req.user.id,
      read: false,
    });

    return res.json({ message: "success" });
  } catch (err) {
    return res.json({ error: err });
  }
});

/**
 * @swagger
 * /post/comment/{id}:
 *  get:
 *    description: 'Get Comments by specific post id'
 *    parameters:
 *      - in : path
 *        name: id
 *        type: integer
 *        required: true
 *        description: "Post Id"
 *    responses:
 *      '200':
 *         content:
 *            application/json:
 */

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
