import { LOG_IN, LOG_OUT } from "./actions";

const initialState = {
  isLoggedIn: false,
  username: "",
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOG_IN:
      return {
        ...state,
        isLoggedIn: true,
        username: action.payload,
      };
    case LOG_OUT:
      return {
        ...state,
        isLoggedIn: false,
        username: "",
      };
    default:
      return state;
  }
};
