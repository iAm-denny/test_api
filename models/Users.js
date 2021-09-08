module.exports = (sequelize, Datatypes) => {
  const Users = sequelize.define("Users", {
    username: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    email: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    password: {
      type: Datatypes.STRING,
      allowNull: false,
    },
  });

  Users.associate = (models) => {
    Users.hasMany(models.Likes, {
      onDelete: "cascade",
    });

    Users.hasMany(models.Comments, {
      onDelete: "cascade",
    });

    Users.hasMany(models.SavedPost, {
      onDelete: "cascade",
    });

    Users.hasMany(models.Posts, {
      onDelete: "cascade",
    });

    Users.hasMany(models.Follows, {
      onDelete: "cascade",
      foreignKey: "user_id",
    });

    Users.hasMany(models.Follows, {
      onDelete: "cascade",
      foreignKey: "followByUser_id",
    });
  };

  return Users;
};
