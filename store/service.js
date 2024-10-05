"use client"
import axios from 'axios'
import router from 'next/router'
import store from '@/store'
import { setAccessToken, setRefreshToken } from './user/actions'
import { isEmpty } from '@/lib'
// import { ToastProgrammatic as Toast } from 'buefy'

// const axiosBaseURL1 = (process.env.NODE_ENV === "dev") ? `${document.location.protocol}//${process.env.VUE_APP_DEV_IP}:${process.env.VUE_APP_DEV_PORT}` : ``
var doc
if (typeof document === 'undefined' || document === null) {
	doc = null
} else {
	doc = document
}

export const isDev = process.env.NODE_ENV === 'development';
export const protocol = isEmpty(doc) ? "http:" : doc.location.protocol
export const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
export const devIp = process.env.NEXT_PUBLIC_IP
export const devPort = process.env.NEXT_PUBLIC_PORT
export const localhost = isEmpty(doc) ? "" : doc.location.host
export const localhostName = isEmpty(doc) ? "" : doc.location.hostname
export const baseIp = isDev ? `${devIp}` : `${localhostName}`
export const baseHost = isDev ? `${devIp}:${devPort}` : ``
export const baseURL = isDev ? `${protocol}//${devIp}:${devPort}` : ``
export const wsURL = isDev ? `${wsProtocol}//${baseHost}` : ""

// console.log({ isDev, baseURL, baseIp, devPort, devIp, baseHost })
//Create a axios instance, And set timeout to 30s
const instance = axios.create({
	baseURL: baseURL,
	timeout: 60000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: false,
});

const getLangFromBrowser = () => {
	let lang = navigator.language || navigator.userLanguage;
	lang = lang.toLowerCase().replace("-", "_");
	return lang
}

const getInitLang = () => {
	const lang = localStorage.getItem('lang') || getLangFromBrowser()
	return lang
}


// Interception before request initiation
instance.interceptors.request.use(
	(config) => {
		// config.headers["Language"] = getInitLang()
		const token = localStorage.getItem("access_token")
		const rtoken = localStorage.getItem("refresh_token")
		if (token) {
			config.headers.Authorization = token
			// store.commit("SET_ACCESS_TOKEN", token);
			// store.commit("SET_REFRESH_TOKEN", rtoken);
		}
		return config;
	}, (error) => {
		// Do something with request error
		return Promise.reject(error)
	}
)

// Response interception

let isRefreshing = false
let requests = []

function logout() {
	store.dispatch(setAccessToken(""));
	store.dispatch(setRefreshToken(""));
	router.replace({ //Jump to the logout page
		path: '/logout'
	})
}

instance.interceptors.response.use(
	(response) => {
		return response.data;
	},
	async (error) => {
		const originalConfig = error?.config;
		const refresh_token = localStorage.getItem("refresh_token")
		if (originalConfig.url !== "/users/register" && error?.response?.status === 401) {
			// Access Token was expired
			if (!isRefreshing) {
				isRefreshing = true

				instance.post("/v1/users/refresh", {
					refresh_token: refresh_token,
				}).then(tokenRes => {
					if (tokenRes.data.success == 200) {
						localStorage.setItem("access_token", tokenRes.data.data.access_token);
						localStorage.setItem("refresh_token", tokenRes.data.data.refresh_token);
						localStorage.setItem("expires_at", tokenRes.data.data.expires_at);

						store.dispatch(setAccessToken(tokenRes.data.data.access_token));
						store.dispatch(setRefreshToken(tokenRes.data.data.refresh_token));
						originalConfig.headers.Authorization = tokenRes.data.data.access_token
						instance.defaults.headers.Authorization = tokenRes.data.data.access_token
						isRefreshing = false
						return tokenRes.data.data.access_token
					} else {
						logout()
					}
				}).then(token => {
					requests.forEach(cb => cb(token))
					requests = []
				}).catch(error => {
					logout()
					console.log(error);
				})

			} else if (originalConfig.url === "/v1/users/refresh" && error?.response?.status === 401) {
				logout()
			}
			return new Promise(resolve => {
				requests.push((token) => {
					originalConfig.headers = {}
					originalConfig.headers.Authorization = token
					resolve(instance(originalConfig))
				})
			})
		}
		return Promise.reject(error?.response?.data)

	}
)

const testVisionNum = (prefix) => {
	// default version number is /v1
	if (/^http/.test(prefix) || /^\/v[2-9]/.test(prefix)) {
		return prefix
	} else {
		return `/v1${prefix}`
	}
}

const CancelToken = axios.CancelToken;
// Wrapping of axios by request type
const api = {

	get(url, data, config, _this) {
		url = testVisionNum(url)
		if (config) {
			instance.defaults.headers = { ...instance.defaults.headers, ...config.headers };
		}
		/* if (_this) {
			return instance.get(url, {
				params: data,
				cancelToken: new CancelToken(function executor(c) {
					_this.cancelRequest = c
				})
			}, config)
		} else { */
		return instance.get(url, {
			params: data
		}, config)
		// }

	},
	post(url, data, config) {
		url = testVisionNum(url)
		return instance.post(url, data, config)
	},
	put(url, data) {
		url = testVisionNum(url)
		return instance.put(url, data)
	},
	delete(url, data, config) {
		url = testVisionNum(url)
		return instance.delete(url, { ...config, data })
	},
	patch(url, data, config) {
		url = testVisionNum(url)
		return instance.patch(url, data, config)
	},
}
export { api, instance }
