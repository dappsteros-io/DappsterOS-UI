import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import folder from "../apis/folder";
import file from "../apis/file";
import batch from "../apis/batch";

export const getFolderList = createAsyncThunk("app/getFolderList", async (path) => {
    return await folder.getList(path)
})
export const getRootFolderList = createAsyncThunk("app/getRootFolderList", async () => {
    return await folder.getList("/DATA")
})

export const renameFolder = createAsyncThunk("app/renameFolder", async (data) => {
    return await folder.rename(data.old_path, data.new_path)
})
export const downloadFile = createAsyncThunk("app/downloadFile", async (path) => {
    return await file.download(path)
})
export const createFile = createAsyncThunk("app/createFile", async (path) => {
    return await file.create(path)
})
export const deleteFiles = createAsyncThunk("app/deleteFiles", async (paths) => {
    return await batch.delete(paths)
})
export const createFolder = createAsyncThunk("app/createFolder", async (path) => {
    return await folder.create(path)
})


export const task = createAsyncThunk("app/copyFolder", async (data) => {
    return await batch.task(data)
})
export const downloadFolder = createAsyncThunk("app/downloadFolder", async ({ format, files }) => {
    return await batch.download(format, files)
})
export const getDownloadLink = createAsyncThunk("app/getDownloadLink", async (files) => {
    return await batch.getDownloadLink(files)
})