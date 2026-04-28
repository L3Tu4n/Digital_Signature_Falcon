import React, { Fragment, useEffect, Suspense } from "react";
import { routes } from "../routes";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import DefaultComponentHeader from "../components/DefaultComponent/DefaultComponentHeader";

function App() {
  return (
    <Router>
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
  );
}

export default App;
