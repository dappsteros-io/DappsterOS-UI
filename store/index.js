import { configureStore, combineReducers } from "@reduxjs/toolkit"

import { userReducer } from "./user"
import { sysReducer } from "./sys"
import { appReducer } from "./app"
import { fileReducer } from "./file"

const rootReducer = combineReducers({
    user: userReducer,
    sys: sysReducer,
    apps: appReducer,
    files: fileReducer
})

const store = configureStore({
    reducer: rootReducer,
})

export default store
