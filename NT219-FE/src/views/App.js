import React, { Fragment, useEffect, Suspense } from "react";
import { routes } from "../routes";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import DefaultComponentHeader from "../components/DefaultComponent/DefaultComponentHeader";
import { LoadingProvider, useLoading } from "../components/LoadingPage";

const LocationWatcher = () => {
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    showLoading("Đang chuyển trang...");

    const timer = setTimeout(() => {
      hideLoading();
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <LoadingProvider>
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
