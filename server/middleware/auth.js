const { User } = require("../config/models/User");

let auth = (req, res, next) => {
  // 인증 처리

  // 클라이언트 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;

  // 토큰 복호화 후 유저 찾기
  User.findByToken(token, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user) {
      return res.json({ isAuth: false, error: true });
    }

    req.token = token;
    req.user = user;
    next(); // next 없으면 미들웨어에서 갇힘
  });

  // 유저 있으면 인증 성공

  // 유저 없으면 인증 실패
};

module.exports = { auth };
