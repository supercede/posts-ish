const bcrypt = require('bcrypt');
const { Model } = require('sequelize');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
    },
  );

  User.beforeCreate(async user => {
    user.password = await user.generatePasswordHash();
  });

  User.beforeUpdate(async user => {
    if (user.changed('password')) {
      user.password = await user.generatePasswordHash();
    }
  });

  User.getExistinguser = async (queryString, column = 'email') => {
    const userData = await User.findOne({
      where: { [column]: queryString },
    });
    return userData;
  };

  User.prototype.generatePasswordHash = async function generatePasswordHash() {
    const saltRounds = +process.env.SALT;
    return bcrypt.hash(this.password, saltRounds);
  };

  User.prototype.generateAccessToken = function generateAccessToken() {
    return jwt.sign({ id: this.id }, secret, {
      expiresIn: '1d',
    });
  };

  User.prototype.toJSON = function toJSON() {
    const values = { ...this.get() };

    delete values.password;
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };

  User.prototype.validatePassword = function validatePassword(password) {
    return bcrypt.compareSync(password, this.password);
  };

  return User;
};
