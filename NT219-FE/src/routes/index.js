import SignUp from "../pages/Register/SignUp.jsx";
import SignIn from "../pages/Register/SignIn.jsx";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Home from "../pages/Home/Home.jsx";
import Admin from "../pages/Admin/Admin.jsx";
import Request from "../pages/RequestGet/Request.jsx"
import Verify from "../pages/Verify/Verify.jsx";

export const routes = [
  {
    path: "/",
    page: Home,
    isShowHeader: true,
  },
  {
    path: "/signup",
    page: SignUp,
    isShowHeader: false,
  },
  {
    path: "/signin",
    page: SignIn,
    isShowHeader: false,
  },
  {
    path: "/sign",
    page: Admin,
    isShowHeader: true,
  },
  {
    path: "*",
    page: NotFoundPage,
  },
  {
    path: "/verify/:gdc_id",
    page: Verify,
  },
  {
    path: "/request",
    page: Request,
    isShowHeader: true,
  },
];
