import React, { Fragment, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { routes } from "../routes";
import { LoadingProvider, useLoading } from "../components/LoadingPage";
import DefaultComponentHeader from "../components/DefaultComponent/DefaultComponentHeader";

const LocationWatcher = () => {
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    showLoading("Đang chuyển trang...");
    const timer = setTimeout(() => hideLoading(), 400);
    return () => clearTimeout(timer);
  }, [location.pathname, showLoading, hideLoading]);

  return null;
};

function App() {
  return (
    <LoadingProvider>
      {" "}
      {/* Dùng Provider từ file LoadingPage */}
      <Router>
        <LocationWatcher />
        <Routes>
          {routes.map((route, index) => {
            const Page = route.page;
            const HeaderLayout = route.isShowHeader
              ? DefaultComponentHeader
              : Fragment;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <HeaderLayout>
                    <Page />
                  </HeaderLayout>
                }
              />
            );
          })}
        </Routes>
      </Router>
    </LoadingProvider>
  );
}

export default App;
