import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/SignIn.css";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { message } from "antd";

const apiUrl = process.env.REACT_APP_API_URL;

function SignInForm() {
  const [formDataSignIn, setFormDataSignIn] = useState({
    CCCD: "",
    Password: "",
  });

  const [formErrorSignIn, setFormErrorSignIn] = useState({
    CCCD: false,
    Password: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleChangeSingIn = (e) => {
    let targetName, targetValue;

    if (e && e.target) {
      targetName = e.target.name;
      targetValue = e.target.value;
    } else {
      targetValue = e;
    }

    setFormDataSignIn((prevFormData) => ({
      ...prevFormData,
      [targetName]: targetValue,
    }));

    setFormErrorSignIn((prevFormErrors) => ({
      ...prevFormErrors,
      [targetName]:
        typeof targetValue === "string"
          ? targetValue.trim() === ""
          : !targetValue,
    }));
  };

  const [canShowMessage, setCanShowMessage] = useState(true);

  const handleSubmitSignIn = (e) => {
    e.preventDefault();

    const newErrors = { ...formErrorSignIn };
    let hasError = false;

    for (const key in formDataSignIn) {
      const value = formDataSignIn[key];
      if (typeof value === "string") {
        if (value.trim() === "") {
          newErrors[key] = true;
          hasError = true;
        } else {
          newErrors[key] = false;
        }
      } else {
        if (!value) {
          newErrors[key] = true;
          hasError = true;
        } else {
          newErrors[key] = false;
        }
      }
    }

    setFormErrorSignIn(newErrors);

    if (
      hasError ||
      Object.values(formDataSignIn).every((value) => value.trim() === "")
    ) {
      if (canShowMessage) {
        setCanShowMessage(false);
        message.error("Vui lòng nhập đầy đủ thông tin");
        setTimeout(() => setCanShowMessage(true), 500);
      }
    } else {
      console.log(formDataSignIn);

      fetch(`${apiUrl}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formDataSignIn.CCCD,
          password: formDataSignIn.Password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
            fetch(`${apiUrl}/users/me`, {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            })
              .then((response) => response.json())
              .then((userData) => {
                localStorage.setItem("cccd", userData.cccd);
                if (userData.user_type === "chingsphu") {
                  navigate("/sign");
                } else {
                  navigate("/request");
                }
              });
          } else {
            message.error("Invalid username or password");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  return (
    <form className="signin-form">
      <div className="signin">
        <label>
          CCCD<span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          name="CCCD"
          placeholder="Nhập căn cước công dân"
          value={formDataSignIn.CCCD}
          onChange={handleChangeSingIn}
          className="input-signin-cccd"
        />
        <span className={`error-message ${formErrorSignIn.CCCD ? "show" : ""}`}>
          Vui lòng nhập căn cước công dân
        </span>
      </div>

      <div className="password-signin-container">
        <label>
          Mật khẩu<span style={{ color: "red" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="Password"
            placeholder="Nhập mật khẩu"
            value={formDataSignIn.Password}
            onChange={handleChangeSingIn}
            className="input-signin-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-signin-password"
          >
            {showPassword ? (
              <EyeInvisibleOutlined />
            ) : (
              <EyeTwoTone twoToneColor="rgb(78, 147, 178)" />
            )}
          </button>
        </div>
        <span
          className={`error-message ${formErrorSignIn.Password ? "show" : ""}`}
        >
          Vui lòng nhập mật khẩu
        </span>
      </div>

      <div className="signin-submit">
        <button type="submit" onClick={handleSubmitSignIn}>
          Đăng nhập
        </button>
      </div>

      <div className="signup-link">
        <span>Chưa có tài khoản? </span>
        <a href="/signup">Đăng ký</a>
      </div>
    </form>
  );
}

export default SignInForm;
