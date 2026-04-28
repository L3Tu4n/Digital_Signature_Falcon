import React, { createContext, useState, useContext } from "react";
import { Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Text } = Typography;

// 1. Khởi tạo Context ngay tại đây
const LoadingContext = createContext();

// 2. Component giao diện (UI)
const LoadingUI = ({ message }) => {
  const antIcon = (
    <LoadingOutlined
      style={{ fontSize: 48, color: "rgb(78, 147, 178)" }}
      spin
    />
  );
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin indicator={antIcon} />
      <Text
        style={{ marginTop: 20, color: "rgb(78, 147, 178)", fontWeight: "500" }}
      >
        {message}
      </Text>
    </div>
  );
};

// 3. Provider để bọc quanh App (Export cái này để dùng ở App.js)
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Đang tải dữ liệu...");

  const showLoading = (msg) => {
    setMessage(msg || "Đang tải dữ liệu...");
    setIsLoading(true);
  };

  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {isLoading && <LoadingUI message={message} />}
      {children}
    </LoadingContext.Provider>
  );
};

// 4. Hook để gọi Loading (Export cái này để dùng ở AdminHome, Request...)
export const useLoading = () => useContext(LoadingContext);

// 5. Export default chính cái UI để dùng cho Suspense ở App.js (Fix lỗi Build)
export default LoadingUI;
