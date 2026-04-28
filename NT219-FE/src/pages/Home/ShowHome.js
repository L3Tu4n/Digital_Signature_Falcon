import React from "react";
import "../../styles/ShowHome.css";

const ShowHome = () => {
  return (
    <div className="home-container">
      <h1>Trang đăng ký giấy đi chợ</h1>

      <div className="announcement">
        <h2>Thông báo mới nhất</h2>
        <ul>
          <li>
            Thông báo 1: Hướng dẫn đăng ký giấy đi chợ trong thời gian giãn
            cách.
          </li>
          <li>Thông báo 2: Thời gian cấp giấy đi chợ tại các quận/huyện.</li>
        </ul>
      </div>

      <div className="instructions">
        <h2>Hướng dẫn đăng ký</h2>
        <ul>
          <li>Bước 1: Điền thông tin cá nhân.</li>
          <li>Bước 2: Chọn điểm đi và điểm đến.</li>
          <li>Bước 3: Xác nhận và gửi đăng ký.</li>
        </ul>
      </div>

      <div className="contact">
        <h2>Thông tin liên hệ</h2>
        <ul>
          <li>Email: 22521603@gmail.com</li>
          <li>Hotline: 0794-012-456</li>
        </ul>
      </div>
    </div>
  );
};

export default ShowHome;
