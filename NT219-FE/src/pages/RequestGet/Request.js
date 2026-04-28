import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Typography, Modal, Input, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import "../../styles/Request.css";

const apiUrl = process.env.REACT_APP_API_URL;

const Request = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const location = useLocation();

  useEffect(() => {
    const loadGdc = async () => {
      if (location.state && location.state.isNewUser) {
        setData([]);
        return;
      }

      // 2. NẾU KHÔNG PHẢI USER MỚI (Từ trang Đăng nhập qua) THÌ GỌI API BÌNH THƯỜNG
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
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
      body: JSON.stringify({
        cccd,
        start_place: from,
        destination_place: to,
      }),
    });

    const gdc = await response.json();
    const newData = {
      key: (data.length + 1).toString(),
      marketPassId: gdc.gdc_Id,
      idNumber: gdc.cccd,
      from: gdc.start_place,
      to: gdc.destination_place,
      status: gdc.signature ? "Đã ký" : "Chưa ký",
    };

    setData([...data, newData]);
    setFrom("");
    setTo("");
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setFrom("");
    setTo("");
    setIsModalVisible(false);
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
    {
      title: "Di chuyển từ",
      dataIndex: "from",
      key: "from",
      width: 200,
    },
    {
      title: "Điểm đến",
      dataIndex: "to",
      key: "to",
      width: 200,
    },
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
          onClick={() => handleDownload(record)}
          disabled={record.status === "Chưa ký"}
          icon={<DownloadOutlined />}
        >
          Tải xuống
        </Button>
      ),
    },
  ];

  return (
    <div className="container">
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 7 }}
        rowClassName={(record) =>
          record.status === "Đã ký" ? "pass-signed-row" : "pass-unsigned-row"
        }
        locale={{ emptyText: <Typography>Chưa có giấy đi chợ</Typography> }}
      />
      <div className="request-button-container">
        <Button type="primary" onClick={showModal} className="request-btn">
          Xin giấy
        </Button>
        <Modal
          title={
            <Typography variant="h4" component="h1" className="request-title">
              YÊU CẦU CẤP GIẤY ĐI CHỢ
            </Typography>
          }
          open={isModalVisible}
          okButtonProps={{
            style: {
              backgroundColor: "rgb(78, 147, 178)",
            },
          }}
          okText="Gửi yêu cầu"
          onOk={handleOk}
          onCancel={handleCancel}
          closable={false}
        >
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Di chuyển từ"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Điểm đến"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Request;
