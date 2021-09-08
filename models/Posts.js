module.exports = (sequelize, DataTypes) => {
  const Posts = sequelize.define("Posts", {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  Posts.associate = (models) => {
    Posts.belongsTo(models.Users, {
      onDelete: "cascade",
    });

    Posts.hasMany(models.Likes),
      {
        onDelete: "cascade",
      };

    Posts.hasMany(models.Comments, {
      onDelete: "cascade",
    });

    Posts.hasMany(models.SavedPost, {
      onDelete: "cascade",
    });
  };
  return Posts;
};
