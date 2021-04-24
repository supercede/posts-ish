const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BlacklistedToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BlacklistedToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'BlacklistedToken',
      tableName: 'blacklisted_tokens',
    },
  );
  return BlacklistedToken;
};
