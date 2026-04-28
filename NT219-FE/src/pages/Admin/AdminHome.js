import React, { useState, useEffect } from "react";
import { Table, Button, Tag } from "antd";
import "../../styles/AdminHome.css";

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

  useEffect(() => {
    loadAllGdc();
  }, []);

  const loadAllGdc = async () => {
    const response = await fetch(`${apiUrl}/load_all_gdc`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    const gdcList = await response.json();

    if (!Array.isArray(gdcList)) {
      return;
    }

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
      const responseData = await response.json();

      if (response.status === 200) {
        setData((prevData) => {
          const updatedData = prevData.map((item) =>
            item.key === record.key ? { ...item, status: "Đã ký" } : item,
          );

          updatedData.sort((a, b) => (a.status === "Chưa ký" ? -1 : 1));

          return updatedData;
        });
      } else {
        console.error("Failed to sign:", responseData);
      }
    } catch (error) {
      console.error("Failed to sign:", error);
    }
  };

  const dataWithActions = data.map((item) => ({
    ...item,
    onClick: () => handleSign(item),
  }));

  return (
    <div className="container">
      <Table
        columns={columns}
        dataSource={dataWithActions}
        pagination={{ pageSize: 7 }}
        rowClassName={(record) =>
          record.status === "Đã ký" ? "signed-row" : "unsigned-row"
        }
      />
    </div>
  );
};

export default AdminHome;
