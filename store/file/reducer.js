import { createReducer } from "@reduxjs/toolkit";
import {
    getFolderList,
    getRootFolderList
} from "./actions";
const initalState = {
    folders: [],
    dataFolders: []
};
export const fileReducer = createReducer(initalState, (builder) => {
    builder
        .addCase(getFolderList.fulfilled, (state, action) => {
            state.folders = action.payload.data.content || []
        })
        .addCase(getFolderList.pending, (state, action) => {
        })
        .addCase(getFolderList.rejected, (state, action) => {
        })
        .addCase(getRootFolderList.fulfilled, (state, action) => {
            state.dataFolders = action.payload.data.content || []
        })
        .addCase(getRootFolderList.pending, (state, action) => {
        })
        .addCase(getRootFolderList.rejected, (state, action) => {
        })
});
