const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { auth } = require("./middleware/auth");
const { User } = require("./config/models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json 형태의 데이터를 분석해서 가져올 수 있게 해준다.
app.use(bodyParser.json());

app.use(cookieParser());

const mongoose = require("mongoose");

// mongodb atlas connecting
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB atlas Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// register route
app.post("/api/users/register", (req, res) => {
  // 회원가입시 필요한 정보를 클라이언트에서 가져오면
  // 데이터베이스에 넣어준다.

  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) {
      return res.json({ success: false, err });
    }

    return res.status(200).json({
      success: true,
    });
  });
});

// login route
app.post("/api/users/login", (req, res) => {
  // 1 요청된 이메일이 db에 있는지 찾기

  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    // 2 요청된 이메일이 db에 있으면 암호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 다릅니다.",
        });
      }

      // 3 암호가 맞다면 토큰 생성
      user.generateToken((err, user) => {
        if (err) {
          return res.status(400).send(err);
        }

        // 토큰을 저장 (쿠키, 세션, 로컬스토리지등 어디가 제일 안전한지는 논란)
        // 여기선 쿠키에 저장

        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

// role 1 admin, role 2 특정 부서 admin이면 json이 달라질 수 있음
// roel 0 일반 유저, role !0 관리자
// auth route
app.get("/api/users/auth", auth, (req, res) => {
  // auth에서 req에 token, user를 넣어줌으로써 이 함수에서 사용가능해짐
  // 미들웨어 통과 - auth === true

  res.status(200).json({
    // 유저 정보 제공 / 원하는 항목
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

// logout route
app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.status(200).send({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
