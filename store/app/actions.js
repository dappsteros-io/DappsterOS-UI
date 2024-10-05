import { createAction, createAsyncThunk } from "@reduxjs/toolkit"; 
import apps from "../apis/apps";
import folder from "../apis/folder";

export const setAppStatus = createAction("app/setAppStatus", (payload) => {
    return {
        payload
    }
});

export const clearAppStatus = createAction("app/clearAppStatus");

export const getCategories = createAsyncThunk("app/getCategories", async (data) => {
    return await apps.getCategoryListV2(data);
});

export const getApps = createAsyncThunk("app/getApps", async (data) => {
    return await apps.getAppListV2(data);
});

export const getAppsGrid = createAsyncThunk("app/getAppsGrid", async (data) => {
    return await apps.getAppListV2Grid(data);
});

export const getAppCompose = createAsyncThunk("app/getAppCompose", async (data) => {
    return await apps.getAppCompose(data);
});

export const installAppCompose = createAsyncThunk("app/installAppCompose", async ({ params, data }) => {
    return await apps.installAppCompose(params, data);
});
export const unInstallAppCompose = createAsyncThunk("app/unInstallAppCompose", async ({ params, data }) => {
    return await apps.unInstallAppCompose(params, data);
});
