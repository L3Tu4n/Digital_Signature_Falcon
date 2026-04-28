import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Result, Card, Descriptions, Spin, Alert, Tag } from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import "../../styles/Verify.css";

const apiUrl = process.env.REACT_APP_API_URL;

const CallVerify = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { gdc_id } = useParams();

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/verify/${gdc_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, [gdc_id]);

  if (loading)
    return (
      <div className="verify-container">
        <Spin size="large" tip="Đang truy xuất dữ liệu mật mã..." />
      </div>
    );

  return (
    <div className="verify-container" style={{ padding: "20px" }}>
      {data && (
        <>
          {/* TRƯỜNG HỢP 1: THÀNH CÔNG - NGUYÊN BẢN */}
          {data.Status === "Success" && (
            <Result
              status="success"
              title={
                <span style={{ color: "#52c41a", fontWeight: "bold" }}>
                  GIẤY ĐI CHỢ HỢP LỆ
                </span>
              }
              subTitle={data.Message}
              extra={
                <Card
                  title="Thông tin chứng thực"
                  bordered={false}
                  className="verify-card"
                >
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Chủ sở hữu (CCCD)">
                      {data.cccd}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lộ trình">
                      {data.start_place} ➡️ {data.destination_place}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đơn vị cấp phát">
                      <Tag color="blue">{data.chingsphu_name}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian ký">
                      {data.sign_date}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa điểm">
                      {data.sign_place}
                    </Descriptions.Item>
                  </Descriptions>
                  <Alert
                    message="Tính toàn vẹn được đảm bảo bởi thuật toán Falcon"
                    type="success"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                </Card>
              }
            />
          )}

          {/* TRƯỜNG HỢP 2: PHÁT HIỆN PTS (TAMPERED) - QUAN TRỌNG NHẤT ĐỂ DEMO */}
          {data.Status === "Tampered" && (
            <Result
              status="error"
              icon={<StopOutlined style={{ color: "#ff4d4f" }} />}
              title={
                <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                  PHÁT HIỆN GIAN LẬN!
                </span>
              }
              subTitle="Nội dung file PDF không khớp với chữ ký gốc lưu trong hệ thống."
              extra={
                <Alert
                  message="Cảnh báo Integrity"
                  description="Mã băm (SHA-256) của tài liệu này đã bị thay đổi. Giấy này đã bị chỉnh sửa trái phép bằng phần mềm hoặc PTS!"
                  type="error"
                  showIcon
                />
              }
            />
          )}

          {/* TRƯỜNG HỢP 3: CHƯA ĐƯỢC PHÊ DUYỆT (UNSIGNED) */}
          {data.Status === "Unsigned" && (
            <Result
              status="warning"
              icon={<WarningOutlined />}
              title="TÀI LIỆU CHƯA CÓ HIỆU LỰC"
              subTitle={data.Message}
              extra={
                <p>
                  Phiếu này đã được đăng ký nhưng chưa được đơn vị có thẩm quyền
                  ký xác nhận.
                </p>
              }
            />
          )}

          {/* TRƯỜNG HỢP 4: QR GIẢ (INVALID) */}
          {data.Status === "Invalid" && (
            <Result
              status="404"
              icon={<CloseCircleOutlined style={{ color: "#000" }} />}
              title="MÃ QR KHÔNG HỢP LỆ"
              subTitle="Mã định danh này không tồn tại trên hệ thống của chúng tôi."
            />
          )}
        </>
      )}
    </div>
  );
};

export default CallVerify;
