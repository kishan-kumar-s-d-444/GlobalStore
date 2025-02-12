import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
    },
    reducers:{
        // actions
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        removeAuthUser: (state) => {
            state.user = null;
        },
    }
});
export const {
    setAuthUser,
    removeAuthUser
} = authSlice.actions;
export default authSlice.reducer;