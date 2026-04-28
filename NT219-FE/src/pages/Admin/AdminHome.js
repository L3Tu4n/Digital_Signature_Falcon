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
  Pagination,
} from "antd";
import { SafetyCertificateOutlined, InboxOutlined } from "@ant-design/icons";
import "../../styles/AdminHome.css";
import { useLoading } from "../../components/LoadingPage";

const { Dragger } = Upload;
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
  const { showLoading, hideLoading } = useLoading();

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [verifyId, setVerifyId] = useState("");
  const [verifyFile, setVerifyFile] = useState(null);

  useEffect(() => {
    loadAllGdc();
  }, []);

  const loadAllGdc = async () => {
    showLoading("Đang tải danh sách giấy đi chợ...");
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
      message.error("Lỗi tải dữ liệu!");
    } finally {
      hideLoading(); // <--- Tắt khi xong
    }
  };

  const handleSign = async (record) => {
    const signData = {
      gdc_Id: record.marketPassId,
      CP_username: localStorage.getItem("cccd"),
    };

    showLoading("Đang băm Hash và ký số...");
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
        message.success("Ký thành công!");
      }
    } catch (error) {
      message.error("Lỗi hệ thống khi ký!");
    } finally {
      hideLoading(); // <--- Tắt Loading
    }
  };

  const handleVerifyOk = async () => {
    if (!verifyId || !verifyFile) {
      message.error("Vui lòng nhập ID và chọn file PDF.");
      return;
    }

    showLoading("Đang kiểm định tính toàn vẹn tài liệu..."); // <--- Dùng cái này thay cho state verifyLoading cũ
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
          title: "Hợp lệ",
          content: `Chủ sở hữu: ${resData.cccd}`,
        });
      } else {
        Modal.error({ title: "Gian lận!", content: resData.Message });
      }
      setIsVerifyModalVisible(false);
      setVerifyId("");
      setVerifyFile(null);
    } catch (error) {
      message.error("Lỗi kết nối!");
    } finally {
      hideLoading();
    }
  };

  const dataWithActions = data.map((item) => ({
    ...item,
    onClick: () => handleSign(item),
  }));

  const currentTableData = dataWithActions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="container" style={{ padding: "20px" }}>
      <Table
        columns={columns}
        dataSource={currentTableData}
        pagination={false}
        rowClassName={(record) =>
          record.status === "Đã ký" ? "signed-row" : "unsigned-row"
        }
      />

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pagination
          current={currentPage}
          total={data.length}
          pageSize={pageSize}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />

        <Button
          type="default"
          icon={<SafetyCertificateOutlined />}
          onClick={() => setIsVerifyModalVisible(true)}
          style={{
            height: "40px",
            fontWeight: "bold",
            border: "1px solid rgb(78, 147, 178)",
            color: "rgb(78, 147, 178)",
            borderRadius: "6px",
          }}
        >
          Kiểm tra tài liệu
        </Button>
      </div>

      <Modal
        title={
          <Typography className="request-title">
            KIỂM ĐỊNH TÀI LIỆU SỐ
          </Typography>
        }
        open={isVerifyModalVisible}
        okText="Kiểm tra ngay"
        onOk={handleVerifyOk}
        onCancel={() => setIsVerifyModalVisible(false)}
        okButtonProps={{ style: { backgroundColor: "rgb(78, 147, 178)" } }}
      >
        <Input
          placeholder="Nhập ID"
          value={verifyId}
          onChange={(e) => setVerifyId(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Dragger
          multiple={false}
          beforeUpload={(f) => {
            setVerifyFile(f);
            return false;
          }}
          onRemove={() => setVerifyFile(null)}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Kéo thả file PDF vào đây</p>
        </Dragger>
      </Modal>
    </div>
  );
};

export default AdminHome;
