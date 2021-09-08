module.exports = (sequelize, DataTypes) => {
  const Comments = sequelize.define("Comments", {
    body: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return Comments;
};
