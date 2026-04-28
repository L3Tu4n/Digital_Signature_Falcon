import React from "react";
import "../../styles/RegisterBanner.css";
import { Link } from "react-router-dom";

function Banner({ page }) {
  let text;
  if (page === "signup") {
    text = "Sign Up";
  } else if (page === "signin") {
    text = "Sign In";
  }

  return (
    <div className="register-banner">
      <span className="span-text">
        <Link className="logo-link" to="/">
          Giấy đi chợ
        </Link>{" "}
        - {text}
      </span>
    </div>
  );
}

export default Banner;
