import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/Header.css";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { message } from "antd";

const apiUrl = process.env.REACT_APP_API_URL;

const ShowHeader = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token"),
  );
  const [username, setUsername] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch(`${apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (data.name) {
            setIsLoggedIn(true);
            setUsername(data.name);
          }
        })
        .catch((error) => {
          message.error("Phiên đăng nhập đã hết hạn!");
          setIsLoggedIn(false);
          setUsername(null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("cccd");
          if (error.message === "Unauthorized") {
            navigate("/");
          }
        });
    }
  }, [navigate]);

  const handleNormalLogOut = () => {
    setIsLoggedIn(false);
    setUsername(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("cccd");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="desktop" style={{ display: "flex" }}>
        <div className="logo">
          <Link
            className="logo-link"
            onClick={() => navigate(isLoggedIn ? "/request" : "/")}
          >
            Giấy đi chợ
          </Link>
        </div>
        <div className="options">
          <div className="actions">
            {isLoggedIn ? (
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  className="user-button"
                  onClick={() => setDropdownVisible(!dropdownVisible)}
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ marginBottom: "4px" }}
                  />{" "}
                  {username}
                </button>
                {dropdownVisible && (
                  <div
                    className={`user-dropdown-content ${
                      dropdownVisible ? "show" : ""
                    }`}
                  >
                    <button onClick={handleNormalLogOut}>Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="auth-button">
                <Link to="/signin">Đăng nhập | Đăng ký</Link>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShowHeader;
