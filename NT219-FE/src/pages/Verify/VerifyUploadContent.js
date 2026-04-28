import React, { useState } from "react";
import {
  Upload,
  Button,
  message,
  Card,
  Typography,
  Result,
  Spin,
  Input,
  Tag,
} from "antd";
import {
  InboxOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const VerifyUploadContent = () => {
  const [file, setFile] = useState(null);
  const [inputId, setInputId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const handleUpload = async () => {
    if (!inputId.trim()) {
      message.error("Vui lòng nhập Mã tài liệu cần kiểm tra!");
      return;
    }
    if (!file) {
      message.error("Vui lòng chọn file PDF để kiểm tra!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${apiUrl}/verify_upload/${inputId.trim()}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Lỗi kết nối đến máy chủ xác thực!");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFile(null);
      setResult(null);
    },
    beforeUpload: (currentFile) => {
      if (currentFile.type !== "application/pdf") {
        message.error("Chỉ chấp nhận định dạng file PDF!");
        return Upload.LIST_IGNORE;
      }
      setFile(currentFile);
      return false;
    },
    maxCount: 1,
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setInputId("");
  };

  return (
    <div
      style={{
        padding: "50px 15px",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "650px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Title level={3} style={{ color: "#1890ff", marginBottom: 0 }}>
            HỆ THỐNG KIỂM ĐỊNH TÀI LIỆU SỐ
          </Title>
          <Text type="secondary">
            Phát hiện chỉnh sửa trái phép bằng SHA-256
          </Text>
        </div>

        {!result ? (
          <>
            <div style={{ marginBottom: "25px" }}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                1. Nhập mã tài liệu (ID):
              </Text>
              <Input
                size="large"
                placeholder="Ví dụ: 123456"
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                2. Tải lên file PDF cần kiểm tra:
              </Text>
              <Dragger
                {...uploadProps}
                style={{ padding: "20px", backgroundColor: "#fafafa" }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: "#1890ff" }} />
                </p>
                <p className="ant-upload-text">
                  Click hoặc Kéo thả file PDF vào khu vực này
                </p>
                <p className="ant-upload-hint">
                  Thuật toán sẽ trích xuất mã băm vật lý để đối soát dữ liệu gốc
                </p>
              </Dragger>
            </div>

            <Button
              type="primary"
              block
              size="large"
              onClick={handleUpload}
              loading={loading}
              disabled={!file || !inputId.trim()}
              style={{ height: "45px", fontWeight: "bold" }}
            >
              Xác minh chữ ký Falcon & Tính toàn vẹn
            </Button>
          </>
        ) : (
          <Spin spinning={loading}>
            {result.Status === "Success" ? (
              <Result
                status="success"
                icon={<SafetyCertificateOutlined />}
                title="Tài liệu Nguyên bản & Hợp lệ!"
                subTitle="Chữ ký Falcon khớp. Nội dung file không bị thay đổi so với bản gốc."
                extra={[
                  <div
                    key="info"
                    style={{
                      textAlign: "left",
                      backgroundColor: "#f6ffed",
                      padding: "15px",
                      borderRadius: "8px",
                      border: "1px solid #b7eb8f",
                    }}
                  >
                    <p style={{ margin: "8px 0" }}>
                      <b>Mã tài liệu:</b> <Tag color="blue">{inputId}</Tag>
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <b>Chủ sở hữu:</b> {result.cccd}
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <b>Lộ trình:</b> {result.start_place} ➡️{" "}
                      {result.destination_place}
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <b>Cơ quan cấp:</b> {result.chingsphu_name}
                    </p>
                  </div>,
                  <Button
                    key="reset"
                    type="default"
                    onClick={handleReset}
                    style={{ marginTop: "20px" }}
                  >
                    Kiểm tra tài liệu khác
                  </Button>,
                ]}
              />
            ) : (
              <Result
                status="error"
                icon={<WarningOutlined />}
                title={
                  <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                    PHÁT HIỆN GIAN LẬN!
                  </span>
                }
                subTitle={
                  <span style={{ fontSize: "16px" }}>{result.Message}</span>
                }
                extra={
                  <Button type="primary" danger onClick={() => setResult(null)}>
                    Kiểm tra lại
                  </Button>
                }
              />
            )}
          </Spin>
        )}
      </Card>
    </div>
  );
};

export default VerifyUploadContent;
