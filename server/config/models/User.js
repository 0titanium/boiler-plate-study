const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxllength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

// 유저 모델에 유저 정보를 저장하기 전에(user.save) 처리를 함.
userSchema.pre("save", function (next) {
  // 비밀번호 암호화
  let user = this; // this = userSchema

  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        return next(err);
      }

      bcrypt.hash(user.password, salt, function (err, hash) {
        // Store hash in your password DB.
        if (err) {
          return next(err);
        }

        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plain pw, encrypted pw
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;

  // json web token으로 token 생성

  let token = jwt.sign(user._id.toHexString(), "secretToken"); // user._id + 'secretToken' = token;

  user.token = token;
  user.save(function (err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  // cb - callback
  let user = this;

  // 토큰 복호화

  jwt.verify(token, "secretToken", function (err, decoded) {
    // 유저 아이디로 유저 찾은 후
    // 클라이언트 쿠키에서 가져온 토큰과 db에 저장된 토큰이 일치하는지 확인

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) {
        return cb(err);
      }
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
