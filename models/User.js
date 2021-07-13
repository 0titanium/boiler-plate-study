const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxllength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});

// 유저 모델에 유저 정보를 저장하기 전에(user.save) 처리를 함.
userSchema.pre('save', function( next) {
    // 비밀번호 암호화
    let user = this; // this = userSchema

    if (user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) {
                return next(err);
            }
    
            bcrypt.hash(user.password, salt, function(err, hash) {
                // Store hash in your password DB.
                if (err) {
                    return next(err);
                }
    
                user.password = hash;
                next();
            });
        });
    }
});

const User = mongoose.model('User', userSchema);

module.exports = {User};