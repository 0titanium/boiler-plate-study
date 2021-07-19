import axios from "axios";
import React from "react";
import { withRouter } from "react-router-dom";

function LandingPage(props) {
  const onClickHandler = () => {
    axios.get(`api/users/logout`).then((response) => {
      if (response.data.success) {
        props.history.push("/login"); // withRouter 필요
      } else {
        alert('로그아웃에 실패했습니다.');
      }
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <h2>시작 페이지</h2>

      <button onClick={onClickHandler}>LogOut</button>
    </div>
  );
}

export default withRouter(LandingPage);
