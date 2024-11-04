import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import users from "./api";

export const setAccessToken = createAction("user/setAccessToken", (token) => {
    return {
        payload:token
    }
}); 

export const setRefreshToken = createAction("user/setRefreshToken", (token) => {
    return {
        payload:token
    }
}); 
export const getStatus = createAsyncThunk("user/status", async () => {
    return users.getUserStatus();
});
 

export const logIn = createAsyncThunk("user/login", async ({username, password}) => {
    return users.login(username, password);
});
 
export const logOut = createAction("user/logOut"); 

export const signUp = createAsyncThunk("user/register", async ({username, password, key}) => {
    return await users.register(username, password, key);
});

export const getUserImage = createAsyncThunk("user/getUserImage", async (path) => {
    return await users.getUserImage(path);
});

export const changePassword = createAsyncThunk("user/changePassword", async (data) => {
    return await users.changePassword(data);
});

export const getUserInfo = createAsyncThunk("user/getUserInfo", async () => {
    return await users.getUserInfo();
});
