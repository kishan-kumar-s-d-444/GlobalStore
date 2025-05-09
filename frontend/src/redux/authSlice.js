import {createSlice} from "@reduxjs/toolkit"
const userFromStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:userFromStorage,
    },
    reducers:{
        // actions
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        removeAuthUser: (state) => {
            state.user = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
          },
    }
});
export const {
    setAuthUser,
    removeAuthUser,
    setUser,
} = authSlice.actions;
export default authSlice.reducer;