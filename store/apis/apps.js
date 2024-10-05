/*
 * @Author: Jerryk jerry@icewhale.org
 * @Date: 2022-07-12 22:00:10
 * @LastEditors: Jerryk jerry@icewhale.org
 * @LastEditTime: 2022-07-14 10:21:43
 * @FilePath: \CasaOS-UI\src\service\apps.js
 * @Description: 
 * 
 * Copyright (c) 2022 by IceWhale, All Rights Reserved. 
 */
import { api } from "../service";

const PREFIX = "/apps";
const PREFIX2 = "/v2/app_management";

const apps = {
	// get app list
	getAppList(data) {
		return api.get(`${PREFIX}`, data);
	},

	//v2:: get app category list
	getCategoryListV2(data) {
		return api.get(`${PREFIX2}/categories`, data);
	},
	//v2:: get app list
	getAppListV2(data) {
		return api.get(`${PREFIX2}/apps`, data);
	},
	//v2:: get app list
	getAppListV2Grid(data) {
		return api.get(`${PREFIX2}/web/appgrid`, data);
	},
	//v2:: get app compose
	getAppCompose(data, config) {
		return api.get(`${PREFIX2}/apps/${data.name}/compose`, {}, {
			headers: {
				"Accept": data.json ? "application/json" : "application/yaml",
			},
		});
	},

	//v2:: install app compose
	installAppCompose(params, data) {
		return api.post(`${PREFIX2}/compose`, data, {
			headers: {
				"Content-Type": "application/yaml",
				"Accept": "application/yaml",
			},
			params: params
		});
	},


	//v2:: uninstall app compose
	unInstallAppCompose(params, data) {
		return api.delete(`${PREFIX2}/compose/${data.name}`, data, {
			params: params
		});
	},



	// Get app info
	getAppInfo(id) {
		return api.get(`${PREFIX}/${id}`);
	},

	//v2:: Get app info about store。
	getAppInfoV2(id) {
		return api.get(`${PREFIX2}/apps/${id}`);
	},

	//v2:: Get app info about config。
	getAppConfigV2(id) {
		return api.get(`${PREFIX2}/container/${id}`);
	},

	// Check app version
	checkAppVersion(id) {
		return api.patch(`${PREFIX2}/container/${id}`);
	},

	// Check port
	checkPort() {
		return api.get(`/v2/casaos/health/ports`);
	}

}

export default apps;