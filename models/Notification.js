module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define("Notifications", {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  return Notifications;
};
