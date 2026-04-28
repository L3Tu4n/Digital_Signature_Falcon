import React from "react";
import { Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Text } = Typography;

const LoadingPage = ({ message = "Đang tải dữ liệu..." }) => {
  const antIcon = (
    <LoadingOutlined
      style={{ fontSize: 48, color: "rgb(78, 147, 178)" }}
      spin
    />
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
        width: "100%",
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

export default LoadingPage;
