import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/Verify.css";

const apiUrl = process.env.REACT_APP_API_URL;

const CallVerify = () => {
  const [data, setData] = useState(null);
  const { gdc_id } = useParams(); // Extract gdc_id from the URL

  useEffect(() => {
    fetch(`${apiUrl}/verify/${gdc_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [gdc_id]);

  return (
    <div className="verify-container">
      {data && data.Status === "Success" ? (
        <>
          <h1>Giấy đi chợ đã được xác thực với các thông tin sau:</h1>
          <p>Căn cước công dân: {data.cccd}</p>
          <p>Di chuyển từ: {data.start_place}</p>
          <p>Điểm đến: {data.destination_place}</p>
          <p>Được kí bởi: {data.chingsphu_name}</p>
          <p>Có hiệu lực sau: {data.sign_date}</p>
          <p>Địa điểm kí: {data.sign_place}</p>
        </>
      ) : (
        <>
          <h1>Giấy đi chợ chưa được xác thực!</h1>
        </>
      )}
    </div>
  );
};

export default CallVerify;
