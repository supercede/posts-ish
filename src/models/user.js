const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post, {
        foreignKey: 'user_id',
      });
      User.hasMany(models.Photo, {
        foreignKey: 'user_id',
      });
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
      password_reset_token: {
        type: DataTypes.STRING,
      },
      password_token_expires_at: {
        type: DataTypes.DATE,
      },
      password_last_changed: {
        type: DataTypes.DATE,
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
      user.password_last_changed = Date.now() - 1000;
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

  User.prototype.toJSON = function toJSON() {
    const values = { ...this.get() };

    delete values.password;
    delete values.createdAt;
    delete values.updatedAt;
    delete values.password_reset_token;
    delete values.password_token_expires_at;

    return values;
  };

  User.prototype.validatePassword = function validatePassword(password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.prototype.checkLastPasswordChange = function checkLastPasswordChange(
    jwtTimestamp,
  ) {
    if (this.password_last_changed) {
      const lastPasswordChange = this.password_last_changed.getTime() / 1000;

      // false indicates that JWT was issued after last password change and thus is valid
      return jwtTimestamp < lastPasswordChange;
    }
    return false;
  };

  User.prototype.generatePasswordResetToken = async function generatePasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.password_reset_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.password_token_expires_at = Date.now() + 30 * 60 * 1000;

    await this.save();
    return resetToken;
  };

  return User;
};
