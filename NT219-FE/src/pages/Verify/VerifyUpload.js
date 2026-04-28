import React, { useState } from "react";
import { Upload, Button, message, Card, Typography, Result, Spin } from "antd";
import {
  InboxOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const VerifyUpload = () => {
  const { gdc_id } = useParams(); // Lấy ID từ thanh URL
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const handleUpload = async () => {
    if (!file) {
      message.error("Vui lòng chọn file PDF để kiểm tra!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file); // Gắn file vào form

    try {
      // Gửi file lên API mới viết
      const response = await fetch(`${apiUrl}/verify_upload/${gdc_id}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
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
      return false; // Ngăn chặn tự động upload
    },
    maxCount: 1,
  };

  return (
    <div style={{ padding: "50px", display: "flex", justifyContent: "center" }}>
      <Card
        style={{
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          HỆ THỐNG KIỂM ĐỊNH TÀI LIỆU SỐ
        </Title>
        <Text
          type="secondary"
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Mã tài liệu kiểm tra: <b>{gdc_id}</b>
        </Text>

        {!result ? (
          <>
            <Dragger {...uploadProps} style={{ padding: "20px" }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#1890ff" }} />
              </p>
              <p className="ant-upload-text">
                Click hoặc Kéo thả file PDF Hợp đồng/Giấy đi chợ vào đây
              </p>
              <p className="ant-upload-hint">
                Thuật toán SHA-256 sẽ quét nội dung vật lý của file để đối soát.
              </p>
            </Dragger>

            <Button
              type="primary"
              block
              size="large"
              onClick={handleUpload}
              loading={loading}
              disabled={!file}
              style={{ marginTop: "20px" }}
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
                subTitle="Chữ ký Falcon khớp. Nội dung không bị chỉnh sửa."
                extra={[
                  <div
                    key="info"
                    style={{
                      textAlign: "left",
                      backgroundColor: "#f6ffed",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <p>
                      <b>Chủ sở hữu:</b> {result.cccd}
                    </p>
                    <p>
                      <b>Điểm đi:</b> {result.start_place}
                    </p>
                    <p>
                      <b>Điểm đến:</b> {result.destination_place}
                    </p>
                    <p>
                      <b>Cơ quan cấp:</b> {result.chingsphu_name}
                    </p>
                  </div>,
                  <Button
                    type="default"
                    onClick={() => setResult(null)}
                    style={{ marginTop: "15px" }}
                  >
                    Kiểm tra file khác
                  </Button>,
                ]}
              />
            ) : (
              <Result
                status="error"
                icon={<WarningOutlined />}
                title="PHÁT HIỆN GIAN LẬN!"
                subTitle={result.Message}
                extra={
                  <Button type="primary" danger onClick={() => setResult(null)}>
                    Thử lại
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

export default VerifyUpload;
