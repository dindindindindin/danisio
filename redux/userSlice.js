import { createSlice } from "@reduxjs/toolkit";

export const slice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    loggedInUser: (state, action) => {
      return action.payload;
    },
    logout: (state, action) => {
      return null;
    },
  },
});

export const { loggedInUser, logout } = slice.actions;

export default slice.reducer;
