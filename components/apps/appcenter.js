import React, { useContext, useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import { FaUser, FaHdd, FaInfo, FaNetworkWired, FaSearch, FaBackward, FaBackspace, FaArrowRight, FaArrowLeft, FaChevronLeft, FaUpload, FaChevronRight, } from "react-icons/fa"
import { IoIosLogIn } from "react-icons/io";

import { useDispatch, useSelector } from 'react-redux';
import users from '@/store/user/api';
import { changePassword } from '@/store/user/actions';
import { baseURL } from '@/store/service';
import { getCategories, getApps, getAppCompose, installAppCompose, unInstallAppCompose, setAppStatus, clearAppStatus } from '@/store/app';
import { renderSize } from '@/lib';
import { List, ListItem } from "../common/list"
import Image from 'next/image';
import { socket } from '@/service/socket';
import { getUtilization, getNetwork } from '@/store/sys';
import YAML from 'yaml'


import { InboxOutlined } from '@ant-design/icons';
import { Affix, Divider, Input, Flex, Modal, Tabs, message, Upload, Button, Tooltip, Layout, Drawer } from "antd"
import composerize from 'composerize';
import { DappsterContext } from '@/contexts';


const { Dragger } = Upload;
const { TextArea } = Input
const { Header, Content, Footer, Sider } = Layout;

const statusLabels = {
    "app:install-begin": "Installation is started ",
    "app:install-end": "Installation is completed.",
    "app:uninstall-begin": "Uninstallation is started ",
    "app:uninstall-end": "Uninstallation is completed.",
    "docker:image:pull-begin": "Image is pulling",
    "app:install-progress": "Installation in progress",
    "docker:image:pull-end": "Image is pulled",
    "docker:container:create-begin": "Container is creating",
    "docker:container:create-end": "Container is created.",
    "docker:container:remove-begin": "Container is removing",
    "docker:container:remove-end": "Container is removed.",
    "docker:container:start-begin": "Container is starting",
    "docker:container:start-end": "Container is started.",
    "docker:container:stop-begin": "Container is stopping",
    "docker:container:stop-end": "Container is stopped.",
    "docker:container:create-error": "Container is stopped with error.",
    "app:install-error": "Installation is stopped with error",
}


export function AppCenter(props) {
    const { ctx, setCtx } = useContext(DappsterContext)
    const dispatch = useDispatch();
    const categories = useSelector(state => state.apps.categories);
    const apps = useSelector(state => state.apps.apps);
    const installedApps = useSelector(state => state.apps.installedApps);
    const appStatus = useSelector(state => state.apps.appStatus);
    const settings = useSelector(state => state.user.settings)
    const [currentCategory, setCurrentCategory] = useState("All")
    const [filteredApps, setFilteredApps] = useState([])
    const [keyword, setKeyword] = useState("")
    const [currentApp, setCurrentApp] = useState(null)
    const [refreshAppList, setRefreshAppList] = useState(0)
    const [errorMsg, setErrorMsg] = useState("")
    const [isCustomInstall, setIsCustomInstall] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const onKeywordChange = (evt) => {
        evt.preventDefault();
        setKeyword(evt.target.value)
    }

    const onInstallBegin = (evt) => {
        const [action, state] = evt.Name.split("-")
        dispatch(setAppStatus({ state, type: action, name: evt.Name, app: evt.Properties["app:name"] }))
    }
    const onInstallProgress = (evt) => {
        const [action, state] = evt.Name.split("-")
        dispatch(setAppStatus({ state, type: action, progress: parseInt(evt.Properties["app:progress"]), name: evt.Name, app: evt.Properties["app:name"] }))
    }
    const onInstallEnd = (evt) => {
        const [action, state] = evt.Name.split("-")
        dispatch(setAppStatus({ progress: 100, state, type: action, name: evt.Name, app: evt.Properties["app:name"] }))
        setRefreshAppList(new Date().getTime())
    }

    const onUninstallBegin = (evt) => {
        const [action, state] = evt.Name.split("-")
        dispatch(setAppStatus({ state, type: action, name: evt.Name, app: evt.Properties["app:name"] }))
    }
    const onUninstallProgress = (evt) => {
        const [action, state] = evt.Name.split("-")
        dispatch(setAppStatus({ state, type: action, name: evt.Name, app: evt.Properties["app:name"] }))
    }
    const onInstallError = (evt) => {
        const [action, state] = evt.Name.split("-")
        dispatch(setAppStatus({ state, type: action, name: evt.Name, app: evt.Properties["app:name"], message: evt.Properties["message"], }))
        setRefreshAppList(new Date().getTime())
    }
    const onCreateError = (evt) => {
        const [action, state] = evt.Name.split("-")
        dispatch(setAppStatus({ state, type: action, name: evt.Name, app: evt.Properties["app:name"], message: evt.Properties["message"], }))
        setRefreshAppList(new Date().getTime())
    }
    const onUninstallEnd = (evt) => {
        const [action, state] = evt.Name.split("-")
        dispatch(setAppStatus({ state, type: action, name: evt.Name, app: evt.Properties["app:name"] }))
        setRefreshAppList(new Date().getTime())
    }
    const onConnect = () => {
        socket.io.engine.on("upgrade", (transport) => {
            setTransport(transport.name);
        });
    }

    const onDisconnect = () => {
        console.log("disconnected")
    }


    const onInstall = (app) => {
        dispatch(clearAppStatus())
        dispatch(getAppCompose({ name: app.name })).then(res => {
            const data = res.payload;
            const params = { dry_run: false, check_port_conflict: true }
            dispatch(installAppCompose({ params, data })).then(res => {
                if (res.type == "app/installAppCompose/rejected") {
                    setErrorMsg(res.error.message)
                    console.log({ res, errorMsg, setErrorMsg })
                }
            })
        })
    }

    const onCustomInstall = (app, comps) => {
        setErrorMsg("")
        if (!app) {
        } else {
            setIsCustomInstall(false)
        }
    }
    const onFinish = () => {
        // setIsCustomInstall(false)
    }
    const onError = res => {
        setErrorMsg(res.error.message)
    }

    const onShowCustomInstall = (app) => {
        setIsCustomInstall(true);
        dispatch(clearAppStatus())
        // dispatch(getAppCompose(app.name)).then(res => {
        //     const data = res.payload;
        //     const params = { dry_run: false, check_port_conflict: true }
        // })
    }

    const onUninstall = (app) => {
        dispatch(clearAppStatus())
        const params = { delete_config_folder: true }
        dispatch(unInstallAppCompose({ params, data: app })).then(res => {
            // console.log({ res })
        })
    }

    useEffect(() => {
        socket.connect()
        dispatch(clearAppStatus())
        return () => {
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        dispatch(clearAppStatus())
    }, [currentApp])

    useEffect(() => {
        if (socket.connected) {
            onConnect(socket);
        }
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        socket.on("app:install-begin", onInstallBegin)
        socket.on("app:install-progress", onInstallProgress)

        socket.on("docker:image:pull-begin", onInstallProgress)
        socket.on("docker:image:pull-end", onInstallProgress)
        socket.on("docker:container:create-begin", onInstallProgress)
        socket.on("docker:container:create-end", onInstallProgress)
        socket.on("docker:container:start-begin", onInstallProgress)
        socket.on("docker:container:start-end", onInstallProgress)
        socket.on("app:install-end", onInstallEnd)
        socket.on("app:uninstall-begin", onUninstallBegin)
        socket.on("docker:container:stop-begin", onUninstallProgress)
        socket.on("docker:container:stop-end", onUninstallProgress)
        socket.on("docker:container:remove-begin", onUninstallProgress)
        socket.on("docker:container:remove-end", onUninstallProgress)
        socket.on("app:uninstall-end", onUninstallEnd)
        socket.on("docker:container:create-error", onCreateError)
        socket.on("app:install-error", onInstallError)
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);


            socket.off("app:install-begin", onInstallBegin)
            socket.off("app:install-progress", onInstallProgress)

            socket.off("app:install-end", onInstallEnd)
            socket.off("app:uninstall-begin", onUninstallBegin)
            socket.off("app:uninstall-end", onUninstallEnd)
        };
    }, []);

    useEffect(() => {
        dispatch(getCategories({})).then(res => {
            console.log({ res })
        })
    }, [])
    useEffect(() => {
        const appIndexes = Object.keys(apps)
        let appList = []
        for (let i of appIndexes) {
            if (apps[i].tagline && apps[i].tagline[settings.lang].includes(keyword)) {
                appList = [...appList, apps[i]]
            }
        }
        setFilteredApps(appList)
    }, [keyword, apps])
    useEffect(() => {
        dispatch(getApps(currentCategory == "All" ? {} : { category: currentCategory })).then(res => {
        })
    }, [currentCategory, refreshAppList])


    const renderApps = () => {
        const appIndexes = Object.keys(filteredApps)
        return appIndexes.map(i => <div key={i} className="w-full max-w-sm max-h-60  p-4 flex flex-row bg-white border border-neutral-200 rounded-lg shadow dark:bg-neutral-800 dark:border-neutral-700" onClick={() => { setCurrentApp(filteredApps[i]) }}>
            <button className='!w-20 !h-20 relative '>
                <img className="rounded-t-lg w-16 h-16" src={filteredApps[i].icon} alt="product image" />
                {installedApps.includes(filteredApps[i].name) ? <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                    Installed</span> : null}
            </button>

            <div className="w-2/3 px-5">
                <a href="#">
                    <h5 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">{filteredApps[i].title[settings.lang]}
                    </h5>

                </a>
                <div className='text-neutral-400'>{filteredApps[i].author}</div>
                <span className='text-neutral-400 text-xs text-ellipsis'>{filteredApps[i].tagline ? filteredApps[i].tagline[settings.lang].length > 140 ? filteredApps[i].tagline[settings.lang].slice(0, 140) + "..." : filteredApps[i].tagline[settings.lang] : ""}</span>
                <div className="flex flex-wrap my-2 gap-2">
                    {filteredApps[i].architectures.map(a => <div key={a} className="bg-transparent text-green-800 text-xs font-semibold rounded ">{a}</div>)}
                </div>
                <span className='text-neutral-400'>{filteredApps[i].category}</span>
            </div>
        </div>
        )
    }
    const renderProgressBar = () => {
        if (appStatus) {
            const steps = Object.entries(appStatus)
            console.log(steps, currentApp.name)
            return steps.length ? <ul className="max-w-md space-y-2 text-gray-500 list-inside dark:text-gray-400" >
                {steps.map((s, index) => (
                    s[1]['app'] == currentApp.name ? <li className="flex items-center">
                        {s[1]['state'] !== "end" ? <div role="status">
                            <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                            <span className="sr-only">Loading...</span>
                        </div> : <svg className="w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                        </svg>}
                        {s[1]['message'] || statusLabels[s[0] + "-" + s[1]['state']] || s[0] + "-" + s[1]['state']} {s[1]['state'] !== "end" ? "..." + (s[1]['progress'] ? s[1]['progress'] + "%" : "") : ""}
                    </li> : ""
                ))}
            </ul > : <></>
        }
        else return <></>
    }
    const onSidebarItemSelect = (c) => {
        setDrawerOpen(false)
        setCurrentCategory(c.name);
    }
    const renderSidebar = () => <div className='bg-neutral-800 overflow-y-auto ' >
        <ul className="font-medium">
            {categories.map(c => c.count > 0 ? <li key={c.name}>
                <a href="#" className={`flex items-center p-2 text-neutral-900 rounded-lg dark:text-white hover:bg-neutral-800 group ${currentCategory == c.name ? "bg-blue-700" : ""}`} onClick={() => { onSidebarItemSelect(c) }}>
                    {/* <img src={c.font} alt={c.font} /> */}
                    <span className="flex-1 ml-3 whitespace-nowrap">{c.name}</span>
                </a>
            </li> : null)}
        </ul>
    </div>
    return (<Layout>
        {props.size.width < 600 ? <Drawer
            title="Categories"
            placement={"left"}
            closable={false}
            onClose={() => { setDrawerOpen(false) }}
            open={drawerOpen}
            key={"left"} getContainer={false}
        >
            {renderSidebar()}
        </Drawer> : <Sider
            width={"25%"}
        >
            <Affix offsetTop={34}>
                {renderSidebar()}
            </Affix>
        </Sider>}
        <Content
            style={{
                margin: '24px 16px 0',
                overflow:"scroll"
            }}
        >
            <Affix offsetTop={50}>
                {props.size.width <= 500 ? <Button shape="circle" icon={drawerOpen ? <FaChevronLeft /> : <FaChevronRight />} onClick={() => setDrawerOpen(true)} /> : null}
            </Affix>
            <div className="w-full overflow-y-auto flex flex-col items-center">
                <div className='p-4 text-left flex gap-4'>
                    <div>
                        <label htmlFor="search" className="mb-2 text-sm font-medium text-neutral-900 sr-only dark:text-white">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                : <FaSearch className='text-neutral-500' />
                            </div>
                            <input className="w-full outline-none p-1 ps-10 px-1 context-menu-bg border-2 border-neutral-400 border-opacity-5 rounded text-neutral-400" placeholder="Search" onChange={onKeywordChange} />
                        </div>
                    </div>
                    <button className="py-2 px-4 ms-2 text-sm font-medium text-neutral-900 focus:outline-none bg-white rounded-lg border border-neutral-200 hover:bg-neutral-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-600 dark:hover:text-white dark:hover:bg-neutral-700" onClick={() => onShowCustomInstall({})}>Custom Install</button>
                </div>
                <div className={`${currentApp ? "w-full" : "w-fit"} flex flex-wrap justify-center gap-2`}>
                    {currentApp ? <div className='w-2/3 p-4 px-10 flex flex-col justify-center gap-6'>
                        <button id="dropdownButton" data-dropdown-toggle="dropdown" className="w-8 h-8 inline-block text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:ring-4 focus:outline-none focus:ring-neutral-200 dark:focus:ring-neutral-700 rounded-lg text-sm p-1.5" type="button" onClick={() => setCurrentApp(null)}>
                            <FaChevronLeft />
                        </button>
                        <div className="w-full max-w-md justify-center">
                            <div className='flex flex-row items-center gap-4'>
                                <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src={currentApp.icon} alt="Bonnie image" />
                                <div className="flex flex-col">
                                    <h5 className="mb-1 text-xl font-medium text-neutral-900 dark:text-white">
                                        {currentApp.title[settings.lang]}
                                    </h5>
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400"> {currentApp.author}</span>

                                    <div className='text-neutral-200'>
                                        {currentApp.tagline[settings.lang]}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div className='text-neutral-200'>
                            Image: {currentApp.apps[currentApp.main]["image"]}
                        </div>
                        <hr />
                        <div className="flex mt-2 md:mt-4">
                            {installedApps.includes(currentApp.name) ? <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" onClick={() => onUninstall(currentApp)}>Uninstall</a> : <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => onInstall(currentApp)}>Install</a>}
                            {!installedApps.includes(currentApp.name) ? <a href="#" className="py-2 px-4 ms-2 text-sm font-medium text-neutral-900 focus:outline-none bg-white rounded-lg border border-neutral-200 hover:bg-neutral-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-600 dark:hover:text-white dark:hover:bg-neutral-700" onClick={() => onShowCustomInstall(currentApp)}>Custom</a> : null}
                        </div>
                        {renderProgressBar()}

                        {errorMsg ? <span className='text-red-600'>{errorMsg}</span> : null}
                        <hr />
                        <div>
                            <img src={currentApp.thumbnail} alt={currentApp.thumbnail} />
                        </div>
                        <hr />
                        <div className='text-neutral-200'>
                            <h4 className='mb-4'>Description</h4>
                            {currentApp.description[settings.lang]}

                        </div>
                    </div> :
                        <Flex wrap gap="small" justify={'center'} className='overflow-y-auto'>
                            {renderApps()}
                        </Flex>}
                    {isCustomInstall ? <CustomInstall data={currentApp} onInstall={onCustomInstall} onCancel={() => setIsCustomInstall(false)} onError={onError} onFinish={onFinish} /> : null}
                </div>
            </div>
        </Content>
    </Layout>

    )
}

const CustomInstall = (props) => {
    const { data, onCancel, onInstall, onError, onFinish } = props

    const { hardware, cpu, mem, sys_disk } = useSelector(state => state.sys.hardware)
    const appStatus = useSelector(state => state.apps.appStatus);

    const settings = useSelector(state => state.user.settings)
    const networks = useSelector(state => state.sys.networks)
    const [activeTab, setActiveTab] = useState(0)
    const [isUpload, setUpload] = useState(false)
    const [dockerCLI, setDockerCLI] = useState("");
    const [dockerImage, setDockerImage] = useState("");
    const [title, setTitle] = useState("")
    const [icon, setIcon] = useState("")
    const [scheme, setScheme] = useState("")
    const [port, setPort] = useState("");
    const [url, setUrl] = useState("");
    const [path, setPath] = useState("");
    const [currentNetwork, setCurrentNetwork] = useState("");
    const [ports, setPorts] = useState([]);
    const [volumes, setVolumes] = useState([])
    const [envVars, setEnvVars] = useState([])
    const [devices, setDevices] = useState([])
    const [commands, setCommands] = useState([])
    const [privileges, setPrivileges] = useState(false)
    const [memLimit, setMemLimit] = useState(0)
    const [cpuShares, setCpuShares] = useState("90")
    const [restartPol, setRestartPol] = useState("unless-stopped")
    const [containerCap, setContainerCap] = useState([])
    const [name, setName] = useState("")
    const [composeData, setComposeData] = useState({
        "name": "app",
        "networks": {
            "default": {
                "name": "app_default"
            }
        },
        "services": {
            "app": {
                "command": null,
                "container_name": "app",
                "deploy": {
                    "resources": {
                        "reservations": {
                            "memory": Math.floor(mem?.total * 0.8)
                        }
                    },
                    "placement": {}
                },
                "entrypoint": null,
                "image": "",
                "labels": {
                    "icon": ""
                },
                "network_mode": "bridge",
                "ports": [
                    {
                        "target": 0,
                        "published": "0",
                        "protocol": "tcp"
                    }
                ],
                "restart": "always",
            }
        },
        "x-casaos": {
            "architectures": [
                "amd64",
                "386",
                "arm64",
                "arm"
            ],
            "author": "",
            "category": "",
            "description": {
                "en_us": "Custom Install App",
            },
            "developer": "",
            "icon": "",
            "index": "/",
            "main": "app",
            "port_map": "",
            "screenshot_link": [
            ],
            "tagline": {
                "en_us": "Custom Install App",
            },
            "thumbnail": "",
            "tips": {},
            "title": {
                "en_us": ""
            }
        }
    })
    const [composeYAML, setComposeYAML] = useState("")
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getNetwork()).then(res => {
            console.log(res)
        });
        if (data) {
            dispatch(getAppCompose({ name: data.name, json: true })).then(res => {
                const yamldata = res.payload.data;
                console.log({ yamldata })
                setComposeData(yamldata.compose)
                // dispatch(installAppCompose({ params, data })).then(res => {
                //     if (res.type == "app/installAppCompose/rejected") {
                //         setErrorMsg(res.error.message)
                //         console.log({ res, errorMsg, setErrorMsg })
                //     }
                // })
            })
        }

        dispatch(getUtilization())
    }, [])
    useEffect(() => {
        if (composeData) {
            setCompose(composeData)
        }
    }, [composeData])
    const setCompose = (yamldata) => {
        console.log({ yamldata })
        const params = { dry_run: false, check_port_conflict: true };
        const detailData = yamldata["x-casaos"] || {};
        const appName = Object.keys(yamldata.services).pop()
        const services = yamldata.services[appName];
        setName(yamldata.name)
        setIcon(detailData.icon || "")
        setUrl(detailData.index || "/")
        setPort(detailData.port_map || "0")
        setPorts(services.ports.map(p => {
            if (typeof p == "string") {
                let ps = p.split(":");
                return { target: ps[0], published: ps[1] }
            } else {
                return p
            }
        }) || [])
        setVolumes(services.volumes?.map(v => {
            if (typeof v == "string") {
                let vs = v.split(":");
                return { source: vs[0], target: vs[1], type: "bind" }
            } else {
                return v
            }
        }) || [])
        setEnvVars((Object.entries(services.environment || {})).map(el => ({ key: el[0], value: el[1] })))
        setDevices(Object.entries(services.devices || []).map(el => ({ key: el[0], value: el[1] })))
        setRestartPol(services.restart)
        setPrivileges(services.privileged)
        setCommands(services.command || [])
        setDockerImage(services.image)
        setCurrentNetwork(services.network_mode)
        setMemLimit(services.deploy?.resources?.limits?.memory || mem?.total || 0)
        setContainerCap(services.cap_add || [])
    }
    const onDockerImageChange = e => {
        setDockerImage(e.target.value);
    }
    const onShemeSelect = e => {
        console.log(e.target)
        setScheme(e.target.value)
    }
    const onCurrentNetworkChange = e => {
        setCurrentNetwork(e.target.value)
    }
    const onAddPort = (e) => {
        e.preventDefault();
        setPorts([...ports, { published: "", target: "", protocal: "tcp" }])
    }
    const onChangeHostPort = (id, v) => {
        let ps = [...ports]
        ps.splice(id, 1, { ...ps.at(id), published: v })
        setPorts(ps)
    }
    const onChangeContainerPort = (id, v) => {
        let ps = [...ports]
        ps.splice(id, 1, { ...ps.at(id), target: v })
        setPorts(ps)
    }
    const onAddVol = (e) => {
        e.preventDefault();
        setVolumes([...volumes, { source: "", target: "", type: "bind" }])
    }

    const onVolumeSourceChange = (id, k) => {
        let vs = [...volumes]
        vs.splice(id, 1, { ...vs.at(id), source: k })
        setVolumes(vs)
    }
    const onVolumeTragetChange = (id, v) => {
        let vs = [...volumes]
        vs.splice(id, 1, { ...vs.at(id), value: v })
        setVolumes(vs)
    }
    const onRemoveVal = (id) => {
        setVolumes(volumes.filter((v, index) => index != id))
    }

    const onAddEnvVar = (e) => {
        e.preventDefault();
        setEnvVars([...envVars, { key: "", value: "" }])
    }
    const onEnvVarKeyChange = (id, k) => {
        let envs = [...envVars]
        envs.splice(id, 1, { ...envs.at(id), key: k })
        setEnvVars(envs)
    }
    const onEnvVarValChange = (id, v) => {
        let envs = [...envVars]
        envs.splice(id, 1, { ...envs.at(id), value: v })
        setEnvVars(envs)
    }

    const onRemoveEnvVar = (id) => {
        setEnvVars(envVars.filter((v, index) => index != id))
    }
    const onAddDevice = (e) => {
        e.preventDefault();
        setDevices([...devices, { key: "", value: "" }])
    }

    const onDeviceKeyChange = (id, k) => {
        let devs = [...devices]
        devs.splice(id, 1, { ...devs.at(id), key: k })
        setDevices(devs)
    }
    const onDeviceValChange = (id, v) => {
        let devs = [...devices]
        devs.splice(id, 1, { ...devs.at(id), value: v })
        setDevices(devs)
    }

    const onRemoveDevice = (id) => {
        setDevices(devices.filter((v, index) => index != id))
    }
    const onAddCommand = (e) => {
        e.preventDefault();
        setCommands([...commands, ""])
    }
    const onCommandChange = (id, v) => {
        let cmds = [...commands];
        cmds.splice(id, 1, v);
        setCommands(cmds)
    }
    const onRemoveCommand = (id) => {
        setCommands(commands.filter((v, index) => index != id))
    }
    const onAddContainerCap = (e) => {
        e.preventDefault();
        setContainerCap([...containerCap, ""])
    }
    const onContainerCapChange = (index, v) => {
        let cc = [...containerCap]
        cc.splice(index, 1, v)
        setContainerCap(cc)
    }
    const onRemoveContainerCap = (id) => {
        setContainerCap(containerCap.filter((v, index) => index != id))
    }
    const onChangePrivilege = (e) => {
        setPrivileges(e.target.checked)
    }

    const onNameChange = e => {
        setName(e.target.value || name)
    }
    const onCustomInstall = () => {
        let composeJson = { ...composeData }
        console.log({ composeJson })
        const appName = Object.keys(composeJson.services).pop()
        let services = composeJson.services[appName || "app"]
        console.log({ services })
        let detail = composeJson["x-casaos"]
        services = { ...services, command: commands.length ? commands : null, container_name: name, deploy: { ...services?.deploy, resources: { ...services?.deploy?.resources, limits: { memory: memLimit } } }, image: dockerImage, labels: { ...services.labels, icon: icon }, ports, restart: restartPol, volumes, devices: devices.length > 0 ? devices.map(d => d.key + ":" + d.value) : undefined, cap_add: containerCap.length ? containerCap : undefined, environment: envVars.length > 0 ? envVars.map(v => (v.key + "=" + v.value)) : undefined, network_mode: currentNetwork, privileged: privileges, cpu_shares: cpuShares }
        console.log(services.privileged, privileges)
        detail = { ...detail, icon, port_map: port, index: url, title: { [settings.lang]: title } }

        composeJson = { ...composeJson, services: { [appName || "app"]: services }, "x-casaos": detail }

        if (!data) {
            composeJson.name = name
        }
        // console.log({ composeJson })
        const composeYaml = YAML.stringify(composeJson, { indent: 4 })
        // console.log(composeYaml)

        const params = { dry_run: false, check_port_conflict: true };
        dispatch(installAppCompose({ params, data: composeYaml })).then(res => {
            console.log(res)
            if (res.type == "app/installAppCompose/rejected") {
                // setErrorMsg(res.error.message)
                onError(res)
                console.log({ res })
            }
            onFinish()
        })
        // onInstall(data, composeYaml)

    }

    const renderProgressBar = () => {
        if (appStatus) {
            const steps = Object.entries(appStatus)
            return steps.length ? <ul className="max-w-md space-y-2 text-gray-500 list-inside dark:text-gray-400" >
                {steps.map((s, index) => <li className="flex items-center">
                    {s[1]['state'] !== "end" ? <div role="status">
                        <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                        <span className="sr-only">Loading...</span>
                    </div> : <svg className="w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>}
                    {s[1]['message'] || statusLabels[s[0] + "-" + s[1]['state']] || s[0] + "-" + s[1]['state']} {s[1]['state'] !== "end" ? "..." + (s[1]['progress'] ? s[1]['progress'] + "%" : "") : ""}
                </li>)}
            </ul > : <></>
        }
        else return <></>
    }

    const onImport = () => {
        setUpload(true)
    }
    const onCancelUpload = () => {
        setUpload(false)
    }
    const onUpload = () => {
        if (activeTab == 0) {
            setUpload(false)
        } else {
            const cliYaml = composerize(dockerCLI)
            console.log({ cliYaml })
            const cliCompose = YAML.parse(cliYaml)
            setComposeData(cliCompose)
            setUpload(false)
        }
    }

    const uploadProps = {
        name: 'file',
        multiple: true,
        // action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
            let file = info.fileList[0]?.originFileObj

            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {

                    const yamlData = evt.target.result;
                    setComposeYAML(yamlData)
                    const yamlJSON = YAML.parse(yamlData)
                    setComposeData(yamlJSON)
                    // const params = { dry_run: false, check_port_conflict: true };
                    // dispatch(installAppCompose({ params, data: yamlData })).then(res => {
                    //     console.log(res)
                    //     setUpload(false)
                    //     if (res.type == "app/installAppCompose/rejected") {
                    //         // setErrorMsg(res.error.message)
                    //         onError(res)
                    //         console.log({ res })
                    //     }
                    //     onFinish()
                    // })
                }
                reader.onerror = function (evt) {
                    console.log("error reading file");
                }
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return <div>
        <Modal centered title="Manual Install" onOk={() => { }} onCancel={() => { }} open={true} styles={{ content: { overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' } }} closeIcon={<Tooltip title="Import">
            <FaUpload onClick={onImport} />
        </Tooltip>} footer={[<Button key="back" onClick={onCancel}>
            Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onCustomInstall}>
            Install
        </Button>]} height={500} >
            <div className="grid gap-4 mb-4 grid-cols-2">
                <div className="col-span-2">
                    <label htmlFor="docker-image" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Docker Image*</label>
                    <input type="text" name="docker-image" id="docker-image" className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type docker image" required="" value={dockerImage} onChange={onDockerImageChange} />
                </div>
                <div className="col-span-2">
                    <label htmlFor="title" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Title*</label>
                    <input type="text" name="title" id="title" className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type title" required="" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="col-span-2">
                    <label htmlFor="icon" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Icon URL</label>
                    <div className="flex">
                        <span className="inline-flex items-center text-sm text-gray-900 ">
                            <img src={icon} alt='' width={40} height={40} />
                        </span>
                        <input type="text" name="icon" id="icon" className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="icon" value={icon} onChange={e => setIcon(e.target.value)} />
                    </div>
                </div>
                <div className="col-span-2">
                    <label htmlFor="icon" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Web UI</label>
                    <div className="flex">
                        <select id="scheme" name="scheme" value={scheme} className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-s-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" onChange={e => onShemeSelect(e.target)}>
                            <option value="http://">http://</option>
                            <option value="https://">https://</option>
                        </select>
                        <input type="text" name="url" id="url" className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="localhost" onChange={e => setUrl(e.target.value)} />
                        <input name="port" id="port" className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Ports" value={port} onChange={(e) => setPort(e.target.value)} />
                        <input type="text" name="path" id="path" className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type path url" value={"/"} onChange={e => setPath(e.target.value)} />
                    </div>
                </div>
                <div className="col-span-2">
                    <label htmlFor="network" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Network</label>
                    <select id="network" name='network' value={currentNetwork} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" onChange={onCurrentNetworkChange}>
                        {networks?.map(n => <option value={n.id} key={n.id}>{n.name}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label htmlFor="port" className="flex justify-between mb-2  text-sm font-medium text-neutral-900 dark:text-white"><span>Port</span> <button onClick={onAddPort}>+ Add</button></label>
                    {ports && ports.length ? <div className='col-span-2 flex gap-2 justify-between mb-2 items-center'>
                        <div className='w-full'>
                            <label htmlFor="host_port" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Host</label>
                        </div>
                        <div className='w-full'>
                            <label htmlFor="container_port" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Container</label>
                        </div>

                        <div className='w-full'>
                            <label htmlFor="protocol" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Protocol</label>
                        </div>
                    </div> : null}
                    {ports && ports.length ? ports.map((p, index) => <div className="col-span-2 flex gap-2 justify-between mb-2" key={index}>
                        <div className='w-full'>
                            <input type="number" name="host_port" id="host_port" className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Host" required="" onChange={e => onChangeHostPort(index, e.target.value)} value={p.published} />
                        </div>
                        <div className='w-full'>
                            <input type="number" name="container_port" id="container_port" className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Container" required="" value={p.target} onChange={e => onChangeContainerPort(index, e.target.value)} />
                        </div>

                        <div className='w-full'>
                            <select id="protocol" className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                <option key={"TCP"} value="TCP">TCP</option>
                                <option key={"UDP"} value="UDP">UDP</option>
                                <option key={"TCP+UDP"} value="TCP+UDP">TCP + UDP</option>
                            </select>
                        </div>
                    </div>) : null}
                </div>
                <div className="col-span-2">
                    <label htmlFor="description" className="flex justify-between mb-2 text-sm font-medium text-neutral-900 dark:text-white"><span>Volumes</span> <button onClick={onAddVol}>+ Add</button></label>
                    {volumes && volumes.length ? <div className="col-span-2 flex gap-2 justify-between mb-2 items-center">
                        <div className='w-full'>
                            <label htmlFor="volume_host" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Host</label>
                        </div>
                        <div className='w-full'>
                            <label htmlFor="volume_container" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Container</label>
                        </div>
                    </div> : null}
                    {volumes && volumes.length ? volumes.map((v, index) => <div className="col-span-2 flex gap-2 justify-between mb-2 items-center" key={index}>
                        <div className='w-full'>
                            <input name={"volume_host" + index} id={"volume_host" + index} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Host" required="" value={v.source} onChange={e => onVolumeSourceChange(index, e.target.value)} />
                        </div>
                        <div className='w-full'>
                            <input name={"volume_container" + index} id={"volume_container" + index} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Container" required="" value={v.target} onChange={e => onVolumeTragetChange(index, e.target.value)} />
                        </div>
                        <span className=''>
                            <button type="button" className="inline-flex items-center p-2 ms-2 text-sm rounded-full text-neutral-400 bg-transparent hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-300" onClick={() => onRemoveVal(index)} >
                                <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </span>
                    </div>) : <span className='text-xs text-neutral-400'>Click “+” to add one.</span>}
                </div>
                <div className="col-span-2">
                    <label htmlFor="description" className="flex justify-between mb-2 text-sm font-medium text-neutral-900 dark:text-white">Environment Variables <button onClick={onAddEnvVar}>+ Add</button> </label>
                    {envVars && envVars.length ? <div className="col-span-2 flex gap-2 justify-between items-center mb-2">
                        <div className='w-full'>
                            <label htmlFor="key" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Key</label>
                        </div>
                        <div className='w-full'>
                            <label htmlFor="value" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Value</label>
                        </div>
                    </div> : null}
                    {envVars && envVars.length ? envVars.map((v, index) => (<div className="col-span-2 flex gap-2 justify-between items-center mb-2" key={index}>
                        <div className='w-full'>
                            <input name={"env_key" + index} id={"env_key" + index} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Host" required="" value={v.key} onChange={e => onEnvVarKeyChange(index, e.target.value)} />
                        </div>
                        <div className='w-full'>
                            <input name={"env_value" + index} id={"env_value" + index} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Container" required="" value={v.value} onChange={e => onEnvVarValChange(index, e.target.value)} />
                        </div>
                        <span className=''>
                            <button type="button" className="inline-flex items-center p-2 ms-2 text-sm rounded-full text-neutral-400 bg-transparent hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-300" onClick={() => onRemoveEnvVar(index)} >
                                <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </span>
                    </div>)) : <span className='text-xs text-neutral-400'>Click “+” to add one.</span>}
                </div>
                <div className="col-span-2">
                    <label htmlFor="description" className="flex justify-between mb-2 text-sm font-medium text-neutral-900 dark:text-white">Devices <button onClick={onAddDevice}>+ Add</button> </label>
                    {devices && devices.length ? <div className="col-span-2 flex gap-2 justify-between items-center mb-2">
                        <div className='w-full'>
                            <label htmlFor="key" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Key</label>
                        </div>
                        <div className='w-full'>
                            <label htmlFor="value" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Value</label>
                        </div>
                    </div> : null}
                    {devices && devices.length ? devices.map((v, index) => (<div className="col-span-2 flex gap-2 justify-between items-center mb-2" key={index}>
                        <div className='w-full'>
                            <input name={"device_key" + index} id={"device_key" + index} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Host" required="" value={v.key} onChange={e => onDeviceKeyChange(index, e.target.value)} />
                        </div>
                        <div className='w-full'>
                            <input name={"device_value" + index} id={"device_value" + index} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Container" required="" value={v.value} onChange={e => onDeviceValChange(index, e.target.value)} />
                        </div>
                        <span className=''>
                            <button type="button" className="inline-flex items-center p-2 ms-2 text-sm rounded-full text-neutral-400 bg-transparent hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-300" onClick={() => onRemoveDevice(index)} >
                                <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </span>
                    </div>)) : <span className='text-xs text-neutral-400'>Click “+” to add one.</span>}
                </div>
                <div className="col-span-2">
                    <label htmlFor="command_container" className="flex justify-between mb-2 text-sm font-medium text-neutral-900 dark:text-white">Container Command <button onClick={onAddCommand}>+ Add</button></label>
                    {commands && commands.length ? commands.map((v, index) => (<div className="col-span-2 flex gap-2 justify-between items-center mb-2" key={index}>
                        <input name={"command_container" + index} id={"command_container" + index} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Host" required="" value={v} onChange={e => onCommandChange(index, e.target.value)} />
                        <span className=''>
                            <button type="button" className="inline-flex items-center p-2 ms-2 text-sm rounded-full text-neutral-400 bg-transparent hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-300" onClick={() => onRemoveCommand(index)} >
                                <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </span>
                    </div>
                    )) : null}
                </div>
                <div className="col-span-2">
                    <label htmlFor="priviliage" className="items-center cursor-pointer">
                        <input id="priviliage" name='priviliage' type="checkbox" value="" className="sr-only peer" onChange={onChangePrivilege} {...(privileges ? { "checked": "checked" } : {})} />
                        <span className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Privileges</span>
                        <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>

                    </label>
                </div>
                <div className="col-span-2">
                    <div className="relative mb-6">
                        <label htmlFor="memory_limit" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Memory Limit ({renderSize(memLimit)})</label>
                        <input id="memory_limit" type="range" min="0" max={mem?.total} step={1024 * 1024} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" value={memLimit} onChange={e => setMemLimit(e.target.value)} />
                        <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">Min (256B)</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">{renderSize(mem?.total / 4)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-2/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">{renderSize(mem?.total / 4 * 2)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">{renderSize(mem?.total / 4 * 3)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">Max ({renderSize(mem?.total)})</span>

                    </div>
                </div>
                <div className="col-span-2">
                    <label htmlFor="cpu_shares" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">CPU Shares</label>
                    <select id="cpu_shares" name="cpu_shares" value={cpuShares} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" onChange={e => setCpuShares(e.target.value)}>
                        <option key={10} value="10">Low</option>
                        <option key={50} value="50">Medium</option>
                        <option key={90} value="90">High</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label htmlFor="restart_policy" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Restart Policy</label>
                    <select id="restart_policy" name="restart_policy" value={restartPol} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" onChange={e => setRestartPol(e.target.value)}>
                        <option key={"on-failure"} value="on-failure">On Failure</option>
                        <option key={"always"} value="always">Always</option>
                        <option key={"unless-stopped"} value="unless-stopped">Unless Stop</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label htmlFor="command_container" className="flex justify-between mb-2 text-sm font-medium text-neutral-900 dark:text-white">Container Capabilites(cap-add) <button onClick={onAddContainerCap}>+ Add</button></label>
                    {containerCap && containerCap.length ? containerCap.map((v, index) => (<div className="col-span-2 flex gap-2 justify-between items-center mb-2" key={index}>
                        <input name={"command_container" + index} id={"command_container" + index} className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Host" required="" value={v} onChange={(e) => onContainerCapChange(index, e.target.value)} />
                        <span className=''>
                            <button type="button" className="inline-flex items-center p-2 ms-2 text-sm rounded-full text-neutral-400 bg-transparent hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-300" onClick={() => onRemoveContainerCap(index)} >
                                <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </span>
                    </div>
                    )) : null}
                </div>
                <div className="col-span-2">
                    <label htmlFor="container_name" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">Container Name</label>
                    <div className="flex">
                        <input type="text" name="container_name" id="container_name" className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-neutral-600 dark:border-neutral-500 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="" value={name} onChange={onNameChange} />
                    </div>
                </div>
            </div>
            {renderProgressBar()}
        </Modal>
        <Modal title="Import" open={isUpload} onOk={onUpload} onCancel={onCancelUpload} closeIcon={false}>
            <Tabs
                type="card"
                size='small'
                defaultActiveKey={activeTab}
                onChange={k => setActiveTab(k)}
                items={[{
                    key: 0,
                    label: "Docker Compose",
                    children: <div>
                        <TextArea rows={4} value={composeYAML} />
                        <Divider />
                        <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag Docker YAML file to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                                banned files.
                            </p>
                        </Dragger>
                    </div>
                }, {
                    key: 1,
                    label: "Docker CLI",
                    children: <div>
                        <TextArea rows={4} value={dockerCLI} onChange={v => setDockerCLI(v.target.value)} placeholder='docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx' />
                    </div>
                }]}
            />
        </Modal>
    </div>
}



export default AppCenter


export const displayAppCenter = () => {
    return <AppCenter> </AppCenter>;
}
