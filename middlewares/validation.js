const jwt = require("jsonwebtoken");

const secretCode = "<?.deaf7&^$&?75(_==)4";

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");
  if (!accessToken) {
    return res.json({ error: "needed token" });
  }
  try {
    const validated = jwt.verify(accessToken, secretCode);
    req.user = validated;
    if (validated) {
      return next();
    }
  } catch (err) {
    return res.json({ error: err });
  }
};

module.exports = { validateToken };
