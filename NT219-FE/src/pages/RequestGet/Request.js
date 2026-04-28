import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Typography,
  Modal,
  Input,
  message,
  Upload,
} from "antd";
import {
  DownloadOutlined,
  SafetyCertificateOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import "../../styles/Request.css";

const { Dragger } = Upload;
const apiUrl = process.env.REACT_APP_API_URL;

const Request = () => {
  const [data, setData] = useState([]);
  const location = useLocation();

  // State cho Modal Xin giấy
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // State cho Modal Kiểm tra tài liệu
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [verifyId, setVerifyId] = useState("");
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    const loadGdc = async () => {
      if (location.state && location.state.isNewUser) {
        setData([]);
        return;
      }
      try {
        const cccd = localStorage.getItem("cccd");
        const response = await fetch(`${apiUrl}/load_gdc/${cccd}`);
        if (response.status === 404) {
          setData([]);
          return;
        }
        const gdcList = await response.json();
        if (Array.isArray(gdcList)) {
          const newData = gdcList.map((gdc, index) => ({
            key: (index + 1).toString(),
            marketPassId: gdc.gdc_Id,
            idNumber: gdc.cccd,
            from: gdc.start_place,
            to: gdc.destination_place,
            status: gdc.signature ? "Đã ký" : "Chưa ký",
          }));
          setData(newData);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    loadGdc();
  }, [location.state]);

  const handleDownload = (record) => {
    window.location.href = `${apiUrl}/download_signed/${record.marketPassId}`;
  };

  const handleRequestOk = async () => {
    if (!from || !to) {
      message.error("Vui lòng nhập đủ thông tin.");
      return;
    }
    const cccd = localStorage.getItem("cccd");
    const response = await fetch(`${apiUrl}/request_sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
      body: JSON.stringify({ cccd, start_place: from, destination_place: to }),
    });
    const gdc = await response.json();
    setData([
      ...data,
      {
        key: (data.length + 1).toString(),
        marketPassId: gdc.gdc_Id,
        idNumber: gdc.cccd,
        from: gdc.start_place,
        to: gdc.destination_place,
        status: gdc.signature ? "Đã ký" : "Chưa ký",
      },
    ]);
    setFrom("");
    setTo("");
    setIsRequestModalVisible(false);
    message.success("Gửi yêu cầu thành công!");
  };

  const handleVerifyOk = async () => {
    if (!verifyId || !verifyFile) {
      message.error("Vui lòng nhập ID và chọn file PDF.");
      return;
    }
    setVerifyLoading(true);
    const formData = new FormData();
    formData.append("file", verifyFile);

    try {
      const response = await fetch(
        `${apiUrl}/verify_upload/${verifyId.trim()}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const resData = await response.json();

      if (resData.Status === "Success") {
        Modal.success({
          title: "Kết quả kiểm tra",
          content: `Tài liệu hợp lệ! Chủ sở hữu: ${resData.cccd}`,
        });
      } else {
        Modal.error({
          title: "Cảnh báo gian lận",
          content: resData.Message,
        });
      }
      setIsVerifyModalVisible(false);
      setVerifyId("");
      setVerifyFile(null);
    } catch (error) {
      message.error("Lỗi kết nối server.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const columns = [
    {
      title: "ID giấy đi chợ",
      dataIndex: "marketPassId",
      key: "marketPassId",
      width: 150,
    },
    {
      title: "Căn cước công dân",
      dataIndex: "idNumber",
      key: "idNumber",
      width: 180,
    },
    { title: "Di chuyển từ", dataIndex: "from", key: "from", width: 200 },
    { title: "Điểm đến", dataIndex: "to", key: "to", width: 200 },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "Đã ký" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record)}
          disabled={record.status === "Chưa ký"}
        >
          Tải xuống
        </Button>
      ),
    },
  ];

  return (
    <div className="container">
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 7 }} />

      {/* VÙNG CHỨA NÚT ĐÃ ĐỒNG BỘ KÍCH THƯỚC */}
      <div
        className="request-button-container"
        style={{ display: "flex", gap: "10px", marginTop: "15px" }}
      >
        <Button
          type="primary"
          onClick={() => setIsRequestModalVisible(true)}
          className="request-btn"
          style={{ height: "40px", fontWeight: "bold", padding: "0 20px" }}
        >
          Xin giấy
        </Button>

        <Button
          type="default"
          icon={<SafetyCertificateOutlined />}
          onClick={() => setIsVerifyModalVisible(true)}
          style={{
            height: "40px",
            fontWeight: "bold",
            padding: "0 20px",
            backgroundColor: "#fff", // Giữ màu trắng
          }}
        >
          Kiểm tra tài liệu
        </Button>

        {/* MODAL XIN GIẤY */}
        <Modal
          title={
            <Typography variant="h4" className="request-title">
              YÊU CẦU CẤP GIẤY ĐI CHỢ
            </Typography>
          }
          open={isRequestModalVisible}
          okText="Gửi yêu cầu"
          onOk={handleRequestOk}
          onCancel={() => setIsRequestModalVisible(false)}
          okButtonProps={{ style: { backgroundColor: "rgb(78, 147, 178)" } }}
        >
          <Input
            placeholder="Di chuyển từ"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Input
            placeholder="Điểm đến"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Modal>

        {/* MODAL KIỂM TRA TÀI LIỆU */}
        <Modal
          title={
            <Typography variant="h4" className="request-title">
              KIỂM ĐỊNH TÀI LIỆU SỐ
            </Typography>
          }
          open={isVerifyModalVisible}
          okText="Kiểm tra ngay"
          onOk={handleVerifyOk}
          confirmLoading={verifyLoading}
          onCancel={() => setIsVerifyModalVisible(false)}
          okButtonProps={{ style: { backgroundColor: "rgb(78, 147, 178)" } }}
        >
          <Input
            placeholder="Nhập mã định danh (ID)"
            value={verifyId}
            onChange={(e) => setVerifyId(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Dragger
            multiple={false}
            beforeUpload={(file) => {
              setVerifyFile(file);
              return false;
            }}
            onRemove={() => setVerifyFile(null)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Kéo thả file PDF vào đây để băm Hash
            </p>
          </Dragger>
        </Modal>
      </div>
    </div>
  );
};

export default Request;
