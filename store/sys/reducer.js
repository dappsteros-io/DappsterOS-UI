import { createReducer } from "@reduxjs/toolkit";
import {
    hardwareInfo,
    getDiskList,
    getMemoryInfo,
    getUtilization,
    getStorageList,
    getNetwork
} from "./actions";
const initalState = {
    hardware: {},
    mem: {},
    net: [],
    cpu: {},
    sys_disk: {},
    disks: [],
    storages: []
};
export const sysReducer = createReducer(initalState, (builder) => {
    builder
        .addCase(hardwareInfo.fulfilled, (state, action) => {
            state.status = "idle";
            state.hardware = action.payload.data
        })
        .addCase(hardwareInfo.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(hardwareInfo.rejected, (state, action) => {
            state.status = "failed";
        })
        .addCase(getNetwork.fulfilled, (state, action) => {
            state.status = "idle";
            state.networks = action.payload.data
        })
        .addCase(getNetwork.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getNetwork.rejected, (state, action) => {
            state.status = "failed";
        })
        .addCase(getDiskList.fulfilled, (state, action) => {
            state.status = "idle";
            state.disks = action.payload.data.disks
        })
        .addCase(getDiskList.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getDiskList.rejected, (state, action) => {
            state.status = "failed";
        })
        .addCase(getMemoryInfo.fulfilled, (state, action) => {
            state.status = "idle";
            state.memory = action.payload.data
        })
        .addCase(getMemoryInfo.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getMemoryInfo.rejected, (state, action) => {
            state.status = "failed";
        })
        .addCase(getUtilization.fulfilled, (state, action) => {
            state.status = "idle";
            state.sys_disk = action.payload.data.sys_disk
            state.net = action.payload.data.net
            state.mem = action.payload.data.mem
            state.cpu = action.payload.data.cpu
            state.hardware = action.payload.data
        })
        .addCase(getUtilization.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getUtilization.rejected, (state, action) => {
            state.status = "failed";
        })
        .addCase(getStorageList.fulfilled, (state, action) => {
            state.status = "idle";
            state.storages = action.payload.data
        })
        .addCase(getStorageList.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getStorageList.rejected, (state, action) => {
            state.status = "failed";
        })
});
