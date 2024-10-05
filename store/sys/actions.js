import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import sys from "../apis/sys";
import disks from "../apis/disks"
import storage from "../apis/storage"
import container from "../apis/container";
export const getDiskInfo = createAsyncThunk("user/getDiskInfo", async () => {
    return await sys.getDiskInfo();
});

export const hardwareInfo = createAsyncThunk("user/hardwareInfo", async () => {
    return await sys.hardwareInfo();
});

export const getMemoryInfo = createAsyncThunk("user/getMemoryInfo", async () => {
    return await sys.getMemoryInfo();
});

export const getUtilization = createAsyncThunk("user/getUtilization", async () => {
    return await sys.getUtilization();
});

export const getDiskList = createAsyncThunk("user/getDiskList", async () => {
    return await disks.getDiskList();
});

export const getStorageList = createAsyncThunk("user/getStorageList", async (data) => {
    return await storage.list(data);
});
export const getHardwareUsage = createAsyncThunk("user/getHardwareUsage", async () => {
    return await container.getHardwareUsage();
});
export const getNetwork = createAsyncThunk("user/getNetwork", async () => {
    return await container.getNetworks();
}); 