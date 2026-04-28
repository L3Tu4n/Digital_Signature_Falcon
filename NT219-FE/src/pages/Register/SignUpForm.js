import React, { useState } from "react";
import "../../styles/SignUp.css";
import { useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { message } from "antd";

const apiUrl = process.env.REACT_APP_API_URL;

function SignUpForm() {
  const [formDataSignUp, setFormDataSignUp] = useState({
    Password: "",
    confirmPassword: "",
    CCCD: "",
    FirstAndLastName: "",
    Gender: "",
  });

  const [formErrorSignUp, setformErrorSignUp] = useState({
    Password: false,
    confirmPassword: false,
    CCCD: false,
    FirstAndLastName: false,
    Gender: false,
    passwordMatch: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeTermsError, setAgreeTermsError] = useState(false);
  const navigate = useNavigate();

  const handleChangeSignUp = (e) => {
    let targetName, targetValue;

    if (e && e.target) {
      targetName = e.target.name;
      targetValue =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
    } else {
      targetValue = e;
    }

    if (targetName === "CCCD") {
      targetValue = targetValue.replace(/\D/g, "");

      if (targetValue.length > 12) {
        targetValue = targetValue.slice(0, 12);
      }
    }

    setFormDataSignUp((prevFormData) => ({
      ...prevFormData,
      [targetName]: targetValue,
    }));

    setformErrorSignUp((prevFormErrors) => ({
      ...prevFormErrors,
      [targetName]:
        typeof targetValue === "string"
          ? targetValue.trim() === ""
          : !targetValue,
    }));

    if (targetName === "agreeTerms") {
      setAgreeTerms(targetValue);
      setAgreeTermsError(!targetValue);
    }

    if (targetName === "Password" || targetName === "confirmPassword") {
      setformErrorSignUp((prevFormErrors) => ({
        ...prevFormErrors,
        passwordMatch: false,
      }));
    }
  };

  const [canShowMessage, setCanShowMessage] = useState(true);
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    const newErrors = { ...formErrorSignUp };
    let hasError = false;

    for (const key in formDataSignUp) {
      const value = formDataSignUp[key];
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

    if (formDataSignUp.Password !== formDataSignUp.confirmPassword) {
      newErrors.passwordMatch = true;
      hasError = true;
    } else {
      newErrors.passwordMatch = false;
    }

    setformErrorSignUp(newErrors);

    if (!agreeTerms) {
      setAgreeTermsError(true);
      hasError = true;
    } else {
      setAgreeTermsError(false);
    }

    if (!hasError) {
      try {
        const response = await fetch(`${apiUrl}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cccd: formDataSignUp.CCCD,
            password: formDataSignUp.Password,
            name: formDataSignUp.FirstAndLastName,
            gender: formDataSignUp.Gender,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (typeof errorData.detail === "object") {
            message.error(JSON.stringify(errorData.detail));
          } else {
            message.error(errorData.detail);
          }
        } else {
          message.success("Đăng ký thành công");
          localStorage.setItem("cccd", formDataSignUp.CCCD);

          const loginResponse = await fetch(`${apiUrl}/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: formDataSignUp.CCCD,
              password: formDataSignUp.Password,
            }),
          });

          if (!loginResponse.ok) {
            const loginErrorData = await loginResponse.json();
            message.error(loginErrorData.detail);
          } else {
            const loginData = await loginResponse.json();
            localStorage.setItem("access_token", loginData.access_token);
            navigate("/request", { state: { isNewUser: true } });
          }
        }
      } catch (error) {
        message.error("Có lỗi xảy ra khi đăng ký");
      }
    } else {
      if (canShowMessage) {
        setCanShowMessage(false);
        message.error("Vui lòng nhập đầy đủ thông tin");
        setTimeout(() => setCanShowMessage(true), 500);
      }
    }
  };

  return (
    <form className="signup-form">
      <div className="signup">
        <label>
          Họ và tên<span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          name="FirstAndLastName"
          placeholder="Nhập họ và tên"
          value={formDataSignUp.FirstAndLastName}
          onChange={handleChangeSignUp}
          className="input-first-and-last-name"
        />
        <span
          className={`error-message ${
            formErrorSignUp.FirstAndLastName ? "show" : ""
          }`}
        >
          Vui lòng nhập họ và tên
        </span>
      </div>

      <div className="signup">
        <label>
          CCCD<span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          name="CCCD"
          placeholder="Nhập căn cước công dân"
          value={formDataSignUp.CCCD}
          onChange={handleChangeSignUp}
          className="input-signup-cccd"
        />
        <span className={`error-message ${formErrorSignUp.CCCD ? "show" : ""}`}>
          Vui lòng nhập căn cước công dân
        </span>
      </div>

      <div className="signup">
        <label>
          Giới tính<span style={{ color: "red" }}>*</span>
        </label>
        <div className="gender-container">
          <div className="custom-radio">
            <input
              type="radio"
              id="male"
              name="Gender"
              value="Nam"
              checked={formDataSignUp.Gender === "Nam"}
              onChange={handleChangeSignUp}
            />
            <label for="male" className="custom-radio-label">
              Nam
            </label>
          </div>
          <div className="custom-radio">
            <input
              type="radio"
              id="female"
              name="Gender"
              value="Nữ"
              checked={formDataSignUp.Gender === "Nữ"}
              onChange={handleChangeSignUp}
            />
            <label for="female" className="custom-radio-label">
              Nữ
            </label>
          </div>
        </div>
        <span
          className={`error-message ${formErrorSignUp.Gender ? "show" : ""}`}
        >
          Vui lòng chọn giới tính
        </span>
      </div>

      <div className="password-signup-container">
        <label>
          Mật khẩu<span style={{ color: "red" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="Password"
            placeholder="Nhập mật khẩu"
            value={formDataSignUp.Password}
            onChange={handleChangeSignUp}
            className="input-signup-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-signup-password"
          >
            {showPassword ? (
              <EyeInvisibleOutlined />
            ) : (
              <EyeTwoTone twoToneColor="rgb(78, 147, 178)" />
            )}
          </button>
        </div>
        <span
          className={`error-message ${formErrorSignUp.Password ? "show" : ""}`}
        >
          Vui lòng nhập mật khẩu
        </span>
      </div>

      <div className="password-signup-container">
        <label>
          Xác nhận lại mật khẩu<span style={{ color: "red" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={formDataSignUp.confirmPassword}
            onChange={handleChangeSignUp}
            className="input-signup-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="toggle-signup-password"
          >
            {showConfirmPassword ? (
              <EyeInvisibleOutlined />
            ) : (
              <EyeTwoTone twoToneColor="rgb(78, 147, 178)" />
            )}
          </button>
        </div>
        <span
          className={`error-message ${
            formErrorSignUp.confirmPassword || formErrorSignUp.passwordMatch
              ? "show"
              : ""
          }`}
        >
          {formErrorSignUp.passwordMatch
            ? "Mật khẩu và xác nhận mật khẩu không khớp"
            : "Vui lòng nhập lại mật khẩu"}
        </span>
      </div>

      <div className="agreement">
        <div>
          <input
            type="checkbox"
            name="agreeTerms"
            checked={agreeTerms}
            onChange={handleChangeSignUp}
          />
          <span>
            <span>Tôi đồng ý với </span>
            <a href="https://nplaw.vn/quy-dinh-cua-phap-luat-ve-bao-mat-thong-tin-ca-nhan.html">
              Điều khoản sử dụng
            </a>
            <span> và </span>
            <a href="https://nplaw.vn/quy-dinh-cua-phap-luat-ve-bao-mat-thong-tin-ca-nhan.html">
              Chính sách bảo mật
            </a>
            <span> của Nhà Nước</span>
          </span>
        </div>
        <span className={`error-message ${agreeTermsError ? "show" : ""}`}>
          Vui lòng xác nhận đồng ý
        </span>
      </div>

      <div className="signup-submit">
        <button type="submit" onClick={handleSignUpSubmit}>
          Tiếp tục
        </button>
      </div>

      <div className="login-link">
        <span>Đã có tài khoản? </span>
        <a href="/signin">Đăng nhập</a>
      </div>
    </form>
  );
}

export default SignUpForm;
