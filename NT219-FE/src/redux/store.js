import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../slices/counterSlice";
import { userReducer } from "./reducers";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
});
