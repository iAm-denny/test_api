module.exports = (sequelize, DataTypes) => {
  const Follows = sequelize.define("Follows", {
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return Follows;
};
