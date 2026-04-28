import React, { createContext, useState, useContext } from "react";
import LoadingPage from "../components/LoadingPage";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Đang tải...");

  const showLoading = (msg) => {
    setMessage(msg || "Đang tải dữ liệu...");
    setIsLoading(true);
  };

  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingPage message={message} />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
