module.exports = (sequelize, Datatypes) => {
  const SavedPost = sequelize.define("SavedPost");

  return SavedPost;
};
