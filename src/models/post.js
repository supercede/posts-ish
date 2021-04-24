const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Post.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      tags: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('tags').split(';');
        },
        set(val) {
          this.setDataValue('tags', val.join(';'));
        },
      },
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
    },
  );
  return Post;
};
