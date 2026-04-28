import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Input,
  Typography,
  Upload,
  message,
} from "antd";
import {
  SafetyCertificateOutlined,
  InboxOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import "../../styles/AdminHome.css";

const { Dragger } = Upload;
const { Text } = Typography;
const apiUrl = process.env.REACT_APP_API_URL;

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
        className="styled-button"
        onClick={() => record.onClick()}
        disabled={record.status === "Đã ký"}
      >
        {record.status === "Đã ký" ? "Đã ký" : "Ký"}
      </Button>
    ),
  },
];

const AdminHome = () => {
  const [data, setData] = useState([]);

  // --- STATE CHO TÍNH NĂNG KIỂM TRA DỮ LIỆU ---
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [verifyId, setVerifyId] = useState("");
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    loadAllGdc();
  }, []);

  const loadAllGdc = async () => {
    try {
      const response = await fetch(`${apiUrl}/load_all_gdc`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const gdcList = await response.json();
      if (!Array.isArray(gdcList)) return;

      const newData = gdcList.map((gdc, index) => ({
        key: (index + 1).toString(),
        marketPassId: gdc.gdc_Id,
        idNumber: gdc.cccd,
        from: gdc.start_place,
        to: gdc.destination_place,
        status: gdc.signature ? "Đã ký" : "Chưa ký",
      }));
      newData.sort((a, b) => (a.status === "Chưa ký" ? -1 : 1));
      setData(newData);
    } catch (error) {
      message.error("Không thể tải danh sách dữ liệu!");
    }
  };

  const handleSign = async (record) => {
    const signData = {
      gdc_Id: record.marketPassId,
      CP_username: localStorage.getItem("cccd"),
    };
    try {
      const response = await fetch(`${apiUrl}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(signData),
      });
      if (response.status === 200) {
        setData((prevData) => {
          const updatedData = prevData.map((item) =>
            item.key === record.key ? { ...item, status: "Đã ký" } : item,
          );
          updatedData.sort((a, b) => (a.status === "Chưa ký" ? -1 : 1));
          return updatedData;
        });
        message.success("Ký xác thực thành công!");
      }
    } catch (error) {
      message.error("Lỗi trong quá trình ký!");
    }
  };

  // --- LOGIC XỬ LÝ KIỂM TRA FILE ---
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
          title: "Kết quả kiểm định",
          content: `Tài liệu toàn vẹn và hợp lệ! Chủ sở hữu: ${resData.cccd}`,
          okButtonProps: { style: { backgroundColor: "rgb(78, 147, 178)" } },
        });
      } else {
        Modal.error({
          title: "Phát hiện sai lệch!",
          content: resData.Message,
        });
      }
      setIsVerifyModalVisible(false);
      setVerifyId("");
      setVerifyFile(null);
    } catch (error) {
      message.error("Lỗi kết nối Server.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const dataWithActions = data.map((item) => ({
    ...item,
    onClick: () => handleSign(item),
  }));

  return (
    <div className="container" style={{ padding: "20px" }}>
      {/* NÚT KIỂM TRA DÀNH CHO ADMIN */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <Button
          type="default"
          icon={<SafetyCertificateOutlined />}
          onClick={() => setIsVerifyModalVisible(true)}
          style={{
            height: "40px",
            fontWeight: "bold",
            border: "1px solid rgb(78, 147, 178)",
            color: "rgb(78, 147, 178)",
            backgroundColor: "#fff",
          }}
        >
          Kiểm tra tài liệu (Integrity)
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataWithActions}
        pagination={{ pageSize: 7 }}
        rowClassName={(record) =>
          record.status === "Đã ký" ? "signed-row" : "unsigned-row"
        }
      />

      {/* MODAL KIỂM TRA TÀI LIỆU */}
      <Modal
        title={
          <Typography variant="h4" className="request-title">
            KIỂM ĐỊNH TÀI LIỆU SỐ
          </Typography>
        }
        open={isVerifyModalVisible}
        okText="Bắt đầu kiểm tra"
        onOk={handleVerifyOk}
        confirmLoading={verifyLoading}
        onCancel={() => setIsVerifyModalVisible(false)}
        okButtonProps={{ style: { backgroundColor: "rgb(78, 147, 178)" } }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Nhập mã định danh (ID):</Text>
          <Input
            placeholder="Ví dụ: 362540"
            value={verifyId}
            onChange={(e) => setVerifyId(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <Text strong>Tải lên file PDF đối soát:</Text>
        </div>
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
          <p className="ant-upload-hint">
            Hệ thống sẽ so sánh mã SHA-256 thực tế với chữ ký gốc
          </p>
        </Dragger>
      </Modal>
    </div>
  );
};

export default AdminHome;
