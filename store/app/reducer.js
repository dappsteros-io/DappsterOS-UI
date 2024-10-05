import { createReducer } from "@reduxjs/toolkit";
import {
    getCategories,
    getApps,
    setAppStatus,
    clearAppStatus,
    getAppsGrid
} from "./actions";
const initalState = {
    categories: [],
    apps: [],
    installedApps: [],
    appStatus: {},
    appGrid: []
};
export const appReducer = createReducer(initalState, (builder) => {
    builder
        .addCase(getCategories.fulfilled, (state, action) => {
            state.status = "idle";
            state.categories = action.payload.data
        })
        .addCase(getCategories.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getCategories.rejected, (state, action) => {
            state.status = "failed";
        })
        .addCase(getApps.fulfilled, (state, action) => {
            state.status = "idle";
            for (let i in action.payload.data.list) {
                action.payload.data.list[i]["name"] = i
            }
            state.apps = action.payload.data.list
            state.installedApps = action.payload.data.installed
        })
        .addCase(getApps.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getApps.rejected, (state, action) => {
            state.status = "failed";
        })
        .addCase(getAppsGrid.fulfilled, (state, action) => {
            state.status = "idle";
            state.appGrid = action.payload.data
        })
        .addCase(getAppsGrid.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getAppsGrid.rejected, (state, action) => {
            state.status = "failed";
        })
        .addCase(setAppStatus, (state, action) => {
            state.appStatus[action.payload.type] = {
                process: action.payload.progress,
                state: action.payload.state,
                message: action.payload.message,
                app: action.payload.app,
                name: action.payload.name,
                type: action.payload.type
            }
        })
        .addCase(clearAppStatus, (state, action) => {
            state.appStatus = {}
        })
});
