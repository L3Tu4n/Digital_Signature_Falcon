import React from "react";
import { Tabs, Typography, Card } from "antd";
import { QrcodeOutlined, CloudUploadOutlined } from "@ant-design/icons";
import CallVerify from "./CallVerify";
import VerifyUpload from "./VerifyUpload";

const { Title, Text } = Typography;

const VerifyTabs = () => {
  return (
    <div
      style={{
        padding: "30px 15px",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "800px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: 0 }}>
            CỔNG KIỂM ĐỊNH TÀI LIỆU SỐ
          </Title>
          <Text type="secondary">
            Tích hợp Chữ ký Lượng tử Falcon & Mã băm SHA-256
          </Text>
        </div>

        <Tabs
          defaultActiveKey="1"
          centered
          size="large"
          items={[
            {
              key: "1",
              label: (
                <span>
                  <QrcodeOutlined />
                  Tra cứu Database
                </span>
              ),
              children: <CallVerify />, // Tab 1: Vẫn gọi file ruột cũ của Tuấn
            },
            {
              key: "2",
              label: (
                <span>
                  <CloudUploadOutlined />
                  Kiểm định chống giả mạo
                </span>
              ),
              children: <VerifyUpload />, // Tab 2: Gọi file ruột mới
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default VerifyTabs;
