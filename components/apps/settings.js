import React, { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import { FaUser, FaHdd, FaInfo, FaNetworkWired, FaChevronLeft, FaChevronRight, } from "react-icons/fa"
import { FaDisplay } from "react-icons/fa6"
import { IoIosColorPalette } from "react-icons/io";
import { BsHddNetwork } from "react-icons/bs";
import { useDispatch, useSelector } from 'react-redux';
import users from '@/store/user/api';
import { changePassword } from '@/store/user/actions';
import { baseURL } from '@/store/service';
import { getUtilization, getStorageList } from '@/store/sys';
import { renderSize } from '@/lib';
import { List, ListItem } from "../common/list"
import Image from 'next/image';
import { Drawer, Affix, Layout, Button } from 'antd';

const { Content, Sider } = Layout


export function Settings(props) {
    console.log(props)
    useEffect(() => {
        if (window.HSStaticMethods)
            window.HSStaticMethods.autoInit();
    }, [])
    const sideMenu = [{
        title: "Network",
        name: "network",
        icon: BsHddNetwork
    }, {
        title: "Storage",
        name: "storage",
        icon: FaHdd
    }, /* {
        title: "Display",
        name: "display",
        icon: FaDisplay
    }, */ {
        title: "Appearance",
        name: "appearance",
        icon: IoIosColorPalette
    }, {
        title: "Users",
        name: "users",
        icon: FaUser
    }, {
        title: "About",
        name: "about",
        icon: FaInfo
    }]
    const [currentTab, setCurrentTab] = useState(props.tab || "network")

    const [drawerOpen, setDrawerOpen] = useState(false)
    let changeBackgroundImage = (e) => {
        props.changeBackgroundImage($(e.target).data("path"));
    }
    const renderSidebar = () => <div className="px-3 py-4 overflow-y-auto bg-opacity-25">
        <ul className="space-y-2 font-medium">
            {sideMenu.map(m => <li key={m.name}>
                <a href="#" className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-800 group ${currentTab == m.name ? "bg-blue-700" : ""}`} onClick={() => setCurrentTab(m.name)}>
                    <m.icon></m.icon>
                    <span className="flex-1 ml-3 whitespace-nowrap">{m.title}</span>
                </a>
            </li>)}
        </ul>
    </div>
    return (<Layout>
        {props.size.width < 600 ? <Drawer title="Categories"
            placement={"left"}
            closable={false}
            onClose={() => { setDrawerOpen(false) }}
            open={drawerOpen}
            key={"left"} getContainer={false}
        >
            {renderSidebar()}
        </Drawer> : <Sider width={"25%"}>

            <Affix offsetTop={34}>
                {renderSidebar()}
            </Affix>
        </Sider>}
        <Content
            style={{
                margin: '24px 16px 0',
            }}
        >
        <Affix offsetTop={50}>
            {props.size.width <= 500 ? <Button shape="circle" icon={drawerOpen ? <FaChevronLeft /> : <FaChevronRight />} onClick={() => setDrawerOpen(true)} /> : null}
        </Affix>
            <div className="w-full">
                <div className={`${currentTab == "network" ? "" : "hidden"}`}>
                    <NetworkDetail />
                </div>
                <div className={`${currentTab == "users" ? "" : "hidden"}`}>
                    <UserDetail />
                </div>
                <div className={`${currentTab == "storage" ? "" : "hidden"}`}>
                    <StorageDetail />
                </div>
                <div className={`${currentTab == "display" ? "" : "hidden"}`}>
                </div>
                <div className={`h-full ${currentTab == "appearance" ? "" : "hidden"}`}>
                    <AppearanceDetail changeBackgroundImage={changeBackgroundImage} currBgImgName={props.currBgImgName} />
                </div>
                <div className={`${currentTab == "about" ? "" : "hidden"}`}>
                    <AboutDetail />
                </div>
            </div>
        </Content>
    </Layout>
    )
}

export default Settings

const NetworkDetail = () => {
    const dispatch = useDispatch()
    const net = useSelector(state => state.sys.net)
    useEffect(() => {
        dispatch(getUtilization())
    }, [])
    return <div className="w-full flow-root p-6">
        <List>
            {net && net.length ? net.map(n => <ListItem key={n.name} className="py-3 sm:py-4">
                <div className="flex w-full items-center">
                    <div className="flex-shrink-0">
                        <FaNetworkWired />
                    </div>
                    <div className="flex-1 min-w-0 ms-4">
                        <p className="font-medium text-gray-900 truncate dark:text-white">
                            {n.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {n.state}
                        </p>
                    </div>
                    <div className="items-center text-base font-semibold text-gray-900 dark:text-white">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {renderSize(n.bytesRecv)} Received
                        </p>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400 text-right">
                            {renderSize(n.bytesSent)} Sent
                        </p>
                    </div>
                </div>
            </ListItem>) : ""}
        </List>
    </div>
}


const avatarUrlPrefix = "/v1/users/avatar?token=";

const UserDetail = () => {
    const user = useSelector((state) => state.user.user)
    const token = useSelector((state) => state.user.token)
    const avatarURL = baseURL + avatarUrlPrefix + token.access_token
    const dispatch = useDispatch()
    const currentRef = useRef()
    const newRef = useRef()
    const confirmRef = useRef()

    const [isPassword, setIsPassword] = useState(false)
    const [isLanguage, setIsLanguage] = useState(false)

    const renderPasswordModal = () => {
        let updatePassword = () => {
            const currentPassword = currentRef.current.value;
            const newPassword = newRef.current.value;
            const confirmPassword = confirmRef.current.value;
            console.log({ currentPassword, newPassword, confirmPassword })
            dispatch(changePassword({ old_password: currentPassword, password: newPassword })).then(res => {
                console.log({ res })
                setIsPassword(false)
            }).catch(err => {
                console.log({ err })
            })
        }

        let cancelPassword = () => {
            setIsPassword(false)
        }

        return (
            <div className="absolute rounded-md top-1/2 left-1/2 text-center text-white font-light text-sm bg-ub-cool-grey transform -translate-y-1/2 -translate-x-1/2 sm:w-96 w-3/4 z-50">
                <div className="relative z-0 w-full flex flex-col px-8 mb-8 group text-left">
                    <div className="relative z-0 mb-5 group text-left">
                        <input type="password" name="current_password" id="current_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " role="presentation" autoComplete="current-password" required ref={currentRef} />
                        <label htmlFor="current_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Current Password</label>
                    </div>
                    <div className="relative z-0 mb-5 group text-left">
                        <input type="password" name="new_password" id="new_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " role="presentation" autoComplete="new-password" required ref={newRef} />
                        <label htmlFor="new_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">New Password</label>
                    </div>
                    <div className="relative z-0 mb-5 group text-left">
                        <input type="password" name="confirm_password" id="confirm_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " role="presentation" autoComplete="confirm-password" required ref={confirmRef} />
                        <label htmlFor="confirm_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm Password</label>
                    </div>
                </div>
                <div className="flex">


                    <div onClick={updatePassword} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 border-r-0 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50">Update</div>
                    <div onClick={cancelPassword} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50">Cancel</div>
                </div>
            </div>
        );
    }
    const renderLanguageModal = () => {
        let updateLanguage = () => {
        }

        let cancelLanguage = () => {
            setIsLanguage(false)
        }

        return (
            <div className="absolute rounded-md top-1/2 left-1/2 text-center text-white font-light text-sm bg-ub-cool-grey transform -translate-y-1/2 -translate-x-1/2 sm:w-96 w-3/4 z-50">
                <div className="relative z-0 w-full flex flex-col px-8 mb-8 group text-left">
                    <div className="relative z-0 mb-5 group text-left">
                        <input type="password" name="current_password" id="current_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " role="presentation" autoComplete="current-password" required ref={currentRef} />
                        <label htmlFor="current_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Current Password</label>
                    </div>
                    <div className="relative z-0 mb-5 group text-left">
                        <input type="password" name="new_password" id="new_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " role="presentation" autoComplete="new-password" required ref={newRef} />
                        <label htmlFor="new_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">New Password</label>
                    </div>
                    <div className="relative z-0 mb-5 group text-left">
                        <input type="password" name="confirm_password" id="confirm_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " role="presentation" autoComplete="confirm-password" required ref={confirmRef} />
                        <label htmlFor="confirm_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm Password</label>
                    </div>
                </div>
                <div className="flex">


                    <div onClick={updateLanguage} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 border-r-0 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50">Update</div>
                    <div onClick={cancelLanguage} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50">Cancel</div>
                </div>
            </div>
        );
    }
    return <div className="w-full p-4">
        {isPassword ? renderPasswordModal() : ""}
        {isLanguage ? renderLanguageModal() : ""}
        <div className="flex flex-col items-center pb-10 gap-2">
            <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src={avatarURL} alt="Avatar" />
            <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{user.username}</h5>
            <span className="text-sm text-gray-500 dark:text-gray-400">{user.role}</span>

            <List className="mb-4">
                <ListItem label={"Name"} floating>
                    {user.username}
                </ListItem>
                <ListItem onClick={() => {
                    setIsPassword(true);
                    setIsLanguage(false)
                }}>
                    Password
                </ListItem>
                <ListItem onClick={() => { setIsLanguage(true); setIsPassword(false) }} >
                    Language
                </ListItem>
            </List>
        </div>
    </div>
}

const AppearanceDetail = (props) => {
    const wallpapers = useSelector(state => state.user.wallpapers)
    return <div className='p-4 h-full overflow-y-auto'>
        <h4 className='text-white mb-4'>Background</h4>
        <div className="flex flex-wrap justify-center rounded-lg items-center bg-neutral-800 p-2">
            {
                Object.keys(wallpapers).map((name, index) => {
                    return (
                        <div key={index} tabIndex="1" onFocus={props.changeBackgroundImage} data-path={name} className={((name === props.currBgImgName) ? " border-yellow-700 " : " border-transparent ") + " md:px-24 md:py-20 md:m-4 m-2 px-14 py-10 outline-none border-4 border-opacity-80"} style={{ backgroundImage: `url(${wallpapers[name]})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center center" }}></div>
                    );
                })
            }
        </div>
    </div>
}


const StorageDetail = () => {
    const dispatch = useDispatch()
    const storages = useSelector(state => state.sys.storages)
    useEffect(() => {
        dispatch(getStorageList({ system: "show" }))
    }, [])
    return <div className="w-full flow-root p-6">
        <List>
            {storages ? storages.map(storage => storage.children ? storage.children.map(s => <ListItem key={s.uuid} className="py-3 sm:py-4">
                <div className="flex w-full items-center">
                    <div className="flex-shrink-0">
                        <img className="w-16 h-16 rounded-full" src="/themes/Yaru/devices/drive-harddisk.png" alt="Neil image" />
                    </div>
                    <div className="flex-1 min-w-0 ms-4">
                        <p className="font-medium text-gray-900 truncate dark:text-white">
                            {s.label}
                        </p>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {s.path}
                        </p>
                    </div>
                    <div className="items-center text-right text-base font-semibold text-gray-900 dark:text-white">
                        <p className="text-sm font-medium text-right  text-gray-900 truncate dark:text-white">
                            {renderSize(s.avail)} Available
                        </p>
                        <p className="text-sm text-gray-500 text-right  truncate dark:text-gray-400">

                            {renderSize(s.size)} Total
                        </p>
                    </div>
                </div>
            </ListItem>) : <ListItem key={storage.path} className="py-3 sm:py-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <img className="w-16 h-16 rounded-full" src="/themes/Yaru/devices/drive-harddisk.png" alt="Neil image" />
                    </div>
                    <div className="flex-1 min-w-0 ms-4">
                        <p className="font-medium text-gray-900 truncate dark:text-white">
                            {storage.disk_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {storage.path}
                        </p>
                    </div>
                    <div className="items-center text-base font-semibold text-gray-900 dark:text-white">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {renderSize(storage.size)}
                        </p>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {storage.type}
                        </p>
                    </div>
                </div>
            </ListItem>) : ""}
        </List>
    </div>
}


const AboutDetail = () => {
    const dispatch = useDispatch()

    const { hardware, cpu, mem, sys_disk } = useSelector(state => state.sys.hardware)
    useEffect(() => {
        dispatch(getUtilization())
    }, []);
    return hardware ? <div className='p-8'>
        <div class="w-full text-center flex-shrink-0 group block mb-6">
            <div class="flex items-center justify-center">
                <Image className="inline-block flex-shrink-0 size-[62px] rounded-full" src="./images/dapp/logo.svg" alt="Image Description" width={62} height={62} />
                <div class="ms-3">
                    <h3 class="font-semibold text-gray-800 dark:text-white">Dappster.io</h3>
                </div>
            </div>
        </div>
        <List className="mb-4">
            <ListItem label={"Device Name"} floating>
                {hardware.device_name}
            </ListItem>
        </List>
        <List>
            <ListItem label={"OS"}>
                Dappster {hardware.os_version}
            </ListItem>
            <ListItem label={"Processer"} >
                {cpu.modelName}
            </ListItem>
            <ListItem label={"Memory"}>
                {renderSize(mem.total)}
            </ListItem>
            <ListItem label={"Disk Capacity"}>
                {renderSize(sys_disk.size)}
            </ListItem>
        </List>
    </div> : "Loading..."
}



export const displaySettings = () => {
    return <Settings> </Settings>;
}
