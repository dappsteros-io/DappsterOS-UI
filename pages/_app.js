"use client";
import { createContext, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Provider } from 'react-redux';

import PrelineScript from "../components/SEO/Preline"
import store from "@/store";
import { DappsterContext, ExplorerContext } from '@/contexts';

import 'tailwindcss/tailwind.css'
import '../styles/index.css'



function MyApp({ Component, pageProps }) {
  const [ctx, setCtx] = useState({
    desktop: false, default: false, explorer: false, file: false, folder: false
  })
  const [explorerCtx, setExplorerCtx] = useState({
    desktop: false, default: false, explorer: false, file: false, folder: false
  })
  return <Provider store={store}>
    <DappsterContext.Provider value={{ ctx, setCtx }}>
      <ExplorerContext.Provider value={{ explorerCtx, setExplorerCtx }}>
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, }} >
          <Component {...pageProps} />
        </ConfigProvider>
      </ExplorerContext.Provider>
    </DappsterContext.Provider>
  </Provider>
}

export default MyApp
