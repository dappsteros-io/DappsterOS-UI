import { createReducer } from "@reduxjs/toolkit";
import {
    logIn,
    signUp,
    changePassword,
    getUserInfo,
    logOut
} from "./actions";
const initalState = {
    token: {},
    user: {},
    settings: {
        existing_apps_switch: true,
        lang: "en_us",
        recommend_switch: true,
        rss_switch: true,
        search_engine: "https://duckduckgo.com/?q=",
        search_switch: true,
        shortcuts_switch: true,
        widgets_switch: true,
    },
    errors: {},
    wallpapers: {
        "wall-1": "./images/wallpapers/wall-1.jpg",
        "wall-2": "./images/wallpapers/wall-2.jpg",
        "wall-3": "./images/wallpapers/wall-3.jpg",
        "wall-11": "./images/wallpapers/wall-1.webp",
        "wall-12": "./images/wallpapers/wall-2.webp",
        "wall-13": "./images/wallpapers/wall-3.webp",
        "wall-4": "./images/wallpapers/wall-4.webp",
        "wall-5": "./images/wallpapers/wall-5.webp",
        "wall-6": "./images/wallpapers/wall-6.webp",
        "wall-7": "./images/wallpapers/wall-7.webp",
        "wall-8": "./images/wallpapers/wall-8.webp",
    }
};
export const userReducer = createReducer(initalState, (builder) => {
    builder
        .addCase(logIn.fulfilled, (state, action) => {
            state.status = "idle";
            state.user = action.payload.data.user;
            state.token = action.payload.data.token;
            localStorage.setItem("access_token", state.token.access_token)
            localStorage.setItem("refresh_token", state.token.refresh_token)
        })
        .addCase(logIn.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(logIn.rejected, (state, action) => {
            state.status = "failed";
            state.errors["profile"] = action.error;
        })
        .addCase(signUp.fulfilled, (state, action) => {
            state.status = "idle";
            state.profile = action.payload;
        })
        .addCase(signUp.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(signUp.rejected, (state, action) => {
            state.status = "failed";
            state.errors["profile"] = action.error;
        })
        .addCase(changePassword.fulfilled, (state, action) => {
            state.status = "idle";
            console.log(action.payload)
        })
        .addCase(changePassword.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(changePassword.rejected, (state, action) => {
            state.status = "failed";
            state.errors["profile"] = action.error;
        })
        .addCase(getUserInfo.fulfilled, (state, action) => {
            state.status = "idle";
            const access_token = localStorage.getItem("access_token", state.token.access_token)
            const refresh_token = localStorage.getItem("refresh_token", state.token.refresh_token)
            state.user = action.payload.data;
            state.token = { access_token, refresh_token }
        })
        .addCase(getUserInfo.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getUserInfo.rejected, (state, action) => {
            state.status = "failed";
            state.errors["profile"] = action.error;
        })
        .addCase(logOut, (state, action) => {
            state.status = "idle";
            state.user = {}
            state.token = {}
            localStorage.removeItem("access_token", state.token.access_token)
            localStorage.removeItem("refresh_token", state.token.refresh_token)
        })
});
