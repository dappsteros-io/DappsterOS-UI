import React, { Component, useContext, useEffect, useState } from 'react';
import BackgroundImage from '../util_components/background-image';
import SideBar from './side_bar';
import apps from '../../apps.config';
import Window from '../base/window';
import UbuntuApp from '../base/ubuntu_app';
import AllApplications from '../screen/all-applications'
import DesktopMenu from '../context_menus/desktop-menu';
import DefaultMenu from '../context_menus/default';
import $ from 'jquery';
import ReactGA from 'react-ga4';
import { useDispatch, useSelector } from 'react-redux';
import { getApps, getAppsGrid } from '@/store/app';
import InstalledApp from '../apps/installedapp';
import ExplorerMenu from '../context_menus/explorer-menu';
import FileMenu from '../context_menus/file-menu';
import FolderMenu from '../context_menus/folder-menu';
import { DappsterContext } from '@/contexts';

const Desktop = (props) => {
    const [appStack, setAppStack] = useState([]);
    const [initFavourite, setInitFavourite] = useState({});
    const [allWindowClosed, setAllWindowClosed] = useState(false);
    const [focusedWindows, setFocusedWindows] = useState({})
    const [closedWindows, setClosedWindows] = useState({})
    const [allAppsView, setAllAppsView] = useState(false);
    const [overlappedWindows, setOverlappedWindows] = useState({})
    const [disabledApps, setDisabledApps] = useState({})
    const [favouriteApps, setFavouriteApps] = useState({})
    const [hiddenSideBar, setHiddenSideBar] = useState(false);
    const [minimizedWindows, setMinimizedWindows] = useState({})
    const [desktopApps, setDesktopApps] = useState([])
    const { ctx: contextMenus, setCtx: setContextMenus } = useContext(DappsterContext) //useState({ desktop: false, default: false, explorer: false, file: false, folder: false })
    const [showNameBar, setShowNameBar] = useState(false);
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getApps())
        dispatch(getAppsGrid())
    }, [allAppsView])
    const appGrid = useSelector(state => state.apps.appGrid || []);
    const installedAppList = appGrid.filter(ag => ag.app_type == "v2app").map(ag => ({
        id: `installed-app-${ag.store_app_id}`,
        title: ag.title["en_us"],
        icon: ag.icon,
        disabled: false,
        favourite: false,
        desktop_shortcut: false,
        screen: () => <InstalledApp url={`${ag.scheme}://${ag.hostname || window.location.hostname}:${ag.port}${ag.index || "/"}`} />

    }))
    installedAppList.map(l => {
        let i = apps.findIndex(a => a.id == l.id)
        if (i > -1) {
            apps.splice(i, 1, l)
        } else {
            apps.push(l)
        }
    })
    const checkForNewFolders = () => {
        var new_folders = localStorage.getItem('new_folders');
        if (new_folders === null && new_folders !== undefined) {
            localStorage.setItem("new_folders", JSON.stringify([]));
        }
        else {
            new_folders = JSON.parse(new_folders);
            new_folders.forEach(folder => {
                apps.push({
                    id: `new-folder-${folder.id}`,
                    title: folder.name,
                    icon: '/themes/Yaru/system/folder.png',
                    disabled: true,
                    favourite: false,
                    desktop_shortcut: true,
                    screen: () => { },
                });
            });
            updateAppsData();
        }
    }

    const setEventListeners = () => {
        document.getElementById("open-settings").addEventListener("click", () => {
            openApp("settings");
        });
    }

    const setContextListeners = () => {
        document.addEventListener('contextmenu', checkContextMenu);
        // on click, anywhere, hide all menusappStack
        document.addEventListener('click', hideAllContextMenu);
    }

    const removeContextListeners = () => {
        document.removeEventListener("contextmenu", checkContextMenu);
        document.removeEventListener("click", hideAllContextMenu);
    }

    const checkContextMenu = (e) => {
        e.preventDefault();
        hideAllContextMenu();
        // console.log(e.target)
        switch (e.target.dataset.context) {
            case "desktop-area":
                ReactGA.event({
                    category: `Context Menu`,
                    action: `Opened Desktop Context Menu`
                });
                showContextMenu(e, "desktop");
                break;
            // case "explorer":
            // case "file":
            // case "folder":
            //     ReactGA.event({
            //         category: `Context Menu`,
            //         action: `Opened Desktop Context Menu`
            //     });
            //     showContextMenu(e, e.target.dataset.context);
            //     break;
            default:
                ReactGA.event({
                    category: `Context Menu`,
                    action: `Opened Default Context Menu`
                });
            // showContextMenu(e, "default");
        }
    }

    const showContextMenu = (e, menuName /* context menu name */) => {
        let { posx, posy } = getMenuPosition(e);
        let contextMenu = document.getElementById(`${menuName}-menu`);

        if (posx + $(contextMenu).width() > window.innerWidth) posx -= $(contextMenu).width();
        if (posy + $(contextMenu).height() > window.innerHeight) posy -= $(contextMenu).height();

        posx = posx.toString() + "px";
        posy = posy.toString() + "px";

        contextMenu.style.left = posx;
        contextMenu.style.top = posy;
        setContextMenus({ ...contextMenus, [menuName]: true })
    }

    const hideAllContextMenu = () => {
        let menus = { ...contextMenus };
        Object.keys(menus).forEach(key => {
            menus[key] = false;
        });
        setContextMenus(menus)
    }

    const getMenuPosition = (e) => {
        var posx = 0;
        var posy = 0;

        if (!e) e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }
        return {
            posx, posy
        }
    }

    const fetchAppsData = () => {
        let focused_windows = {}, closed_windows = {}, disabled_apps = {}, favourite_apps = {}, overlapped_windows = {}, minimized_windows = {};
        let desktop_apps = [];
        apps.forEach((app) => {
            focused_windows = {
                ...focused_windows,
                [app.id]: false,
            };
            closed_windows = {
                ...closed_windows,
                [app.id]: true,
            };
            disabled_apps = {
                ...disabled_apps,
                [app.id]: app.disabled,
            };
            favourite_apps = {
                ...favourite_apps,
                [app.id]: app.favourite,
            };
            overlapped_windows = {
                ...overlapped_windows,
                [app.id]: false,
            };
            minimized_windows = {
                ...minimized_windows,
                [app.id]: false,
            }
            if (app.desktop_shortcut) desktop_apps.push(app.id);
        });

        setFocusedWindows(focused_windows);
        setClosedWindows(closed_windows);
        setDisabledApps(disabled_apps);
        setMinimizedWindows(minimized_windows);
        setFavouriteApps(favourite_apps);
        setDesktopApps(desktop_apps);
        setInitFavourite({ ...favourite_apps })
    }

    const updateAppsData = () => {
        let focused_windows = {}, closed_windows = {}, favourite_apps = {}, minimized_windows = {}, disabled_apps = {};
        let desktop_apps = [];
        apps.forEach((app) => {
            focused_windows = {
                ...focused_windows,
                [app.id]: ((focusedWindows[app.id] !== undefined || focusedWindows[app.id] !== null) ? focusedWindows[app.id] : false),
            };
            minimized_windows = {
                ...minimized_windows,
                [app.id]: ((minimizedWindows[app.id] !== undefined || minimizedWindows[app.id] !== null) ? minimizedWindows[app.id] : false)
            };
            disabled_apps = {
                ...disabled_apps,
                [app.id]: app.disabled
            };
            closed_windows = {
                ...closed_windows,
                [app.id]: ((closedWindows[app.id] !== undefined || closedWindows[app.id] !== null) ? closedWindows[app.id] : true)
            };
            favourite_apps = {
                ...favourite_apps,
                [app.id]: app.favourite
            }
            if (app.desktop_shortcut) desktop_apps.push(app.id);
        });

        setFocusedWindows(focused_windows);
        setClosedWindows(closed_windows);
        setDisabledApps(disabled_apps);
        setMinimizedWindows(minimized_windows);
        setFavouriteApps(favourite_apps);
        setDesktopApps(desktop_apps);
        setInitFavourite({ ...favourite_apps })
    }

    const renderDesktopApps = () => {
        if (Object.keys(closedWindows).length === 0) return;
        let appsJsx = [];
        apps.forEach((app, index) => {
            if (desktopApps.includes(app.id)) {

                const props = {
                    name: app.title,
                    id: app.id,
                    icon: app.icon,
                    openApp: openApp
                }

                appsJsx.push(
                    <UbuntuApp key={index} {...props} />
                );
            }
        });
        return appsJsx;
    }

    const renderWindows = () => {
        let windowsJsx = [];
        apps.forEach((app, index) => {
            if (closedWindows[app.id] === false) {

                const appProps = {
                    title: app.title,
                    id: app.id,
                    screen: app.screen,
                    addFolder: addToDesktop,
                    closed: closeApp,
                    openApp: openApp,
                    focus: focus,
                    isFocused: focusedWindows[app.id],
                    hideSideBar: hideSideBar,
                    hasMinimised: hasMinimised,
                    minimized: minimizedWindows[app.id],
                    changeBackgroundImage: props.changeBackgroundImage,
                    bg_image_name: props.bg_image_name,
                }

                windowsJsx.push(
                    <Window key={index} {...appProps} />
                )
            }
        });
        return windowsJsx;
    }

    const hideSideBar = (objId, hide) => {
        if (hide === hiddenSideBar) return;

        if (objId === null) {
            if (hide === false) {
                setHiddenSideBar(false)
            }
            else {
                for (const key in overlappedWindows) {
                    if (overlappedWindows[key]) {
                        setHiddenSideBar(true)
                        return;
                    }  // if any window is overlapped then hide the SideBar
                }
            }
            return;
        }

        if (hide === false) {
            for (const key in overlappedWindows) {
                if (overlappedWindows[key] && key !== objId) return; // if any window is overlapped then don't show the SideBar
            }
        }

        let overlapped_windows = { ...overlappedWindows };
        overlapped_windows[objId] = hide;
        setHiddenSideBar(hide);
        setOverlappedWindows(overlapped_windows)
    }

    const hasMinimised = (objId) => {
        let minimized_windows = { ...minimizedWindows };
        var focused_windows = { ...focusedWindows };

        // remove focus and minimise this window
        minimized_windows[objId] = true;
        focused_windows[objId] = false;
        setMinimizedWindows(minimized_windows);
        setFocusedWindows(focusedWindows);
        hideSideBar(null, false);

        giveFocusToLastApp();
    }

    const giveFocusToLastApp = () => {
        // if there is atleast one app opened, give it focus
        if (!checkAllMinimised()) {
            for (const index in appStack) {
                if (!minimizedWindows[appStack[index]]) {
                    focus(appStack[index]);
                    break;
                }
            }
        }
    }

    const checkAllMinimised = () => {
        let result = true;
        for (const key in minimizedWindows) {
            if (!closedWindows[key]) { // if app is opened
                result = result & minimizedWindows[key];
            }
        }
        return result;
    }

    const openApp = (objId) => {

        // google analytics
        ReactGA.event({
            category: `Open App`,
            action: `Opened ${objId} window`
        });
        // if the app is disabled
        if (disabledApps[objId]) return;

        if (minimizedWindows[objId]) {
            // focus this app's window
            focus(objId);

            // set window's last position
            var r = document.querySelector("#" + objId);
            r.style.transform = `translate(${r.style.getPropertyValue("--window-transform-x")},${r.style.getPropertyValue("--window-transform-y")}) scale(1)`;

            // tell childs that his app has been not minimised
            let minimized_windows = { ...minimizedWindows }
            minimized_windows[objId] = false;
            setMinimizedWindows(minimized_windows)
            return;
        }

        //if app is already opened
        if (appStack.includes(objId)) focus(objId);
        else {
            let closed_windows = { ...closedWindows };
            let favourite_apps = { ...favouriteApps };
            var frequentApps = localStorage.getItem('frequentApps') ? JSON.parse(localStorage.getItem('frequentApps')) : [];
            var currentApp = frequentApps.find(app => app.id === objId);
            if (currentApp) {
                frequentApps.forEach((app) => {
                    if (app.id === currentApp.id) {
                        app.frequency += 1; // increase the frequency if app is found 
                    }
                });
            } else {
                frequentApps.push({ id: objId, frequency: 1 }); // new app opened
            }

            frequentApps.sort((a, b) => {
                if (a.frequency < b.frequency) {
                    return 1;
                }
                if (a.frequency > b.frequency) {
                    return -1;
                }
                return 0; // sort according to decreasing frequencies
            });

            localStorage.setItem("frequentApps", JSON.stringify(frequentApps));

            setTimeout(() => {
                favourite_apps[objId] = true; // adds opened app to sideBar
                closed_windows[objId] = false; // openes app's window
                setClosedWindows(closed_windows);
                setFavouriteApps(favourite_apps);
                setAllAppsView(false);
                focus(objId);
                setAppStack([...appStack, objId]);
            }, 200);
        }
    }

    const closeApp = (objId) => {
        console.log({ objId })
        // remove app from the app stack
        let app_stack = [...appStack]
        app_stack.splice(app_stack.indexOf(objId), 1);
        setAppStack(app_stack);
        giveFocusToLastApp();

        hideSideBar(null, false);

        // close window
        let closed_windows = { ...closedWindows };
        let favourite_apps = { ...favouriteApps };

        if (!initFavourite[objId]) favourite_apps[objId] = false; // if user default app is not favourite, remove from sidebar
        closed_windows[objId] = true; // closes the app's window
        setClosedWindows(closed_windows);
        setFavouriteApps(favourite_apps);
    }

    const focus = (objId) => {
        // removes focus from all window and 
        // gives focus to window with 'id = objId'
        var focused_windows = { ...focusedWindows }
        focused_windows[objId] = true;
        for (let key in focused_windows) {
            if (focused_windows.hasOwnProperty(key)) {
                if (key !== objId) {
                    focused_windows[key] = false;
                }
            }
        }

        setFocusedWindows(focused_windows)
    }

    const addNewFolder = () => {
        setShowNameBar(true);

    }

    const addToDesktop = (folder_name) => {
        folder_name = folder_name.trim();
        let folder_id = folder_name.replace(/\s+/g, '-').toLowerCase();

        apps.push({
            id: `new-folder-${folder_id}`,
            title: folder_name,
            icon: '/themes/Yaru/system/folder.png',
            disabled: true,
            favourite: false,
            desktop_shortcut: true,
            screen: () => { },
        });
        // store in local storage
        var new_folders = JSON.parse(localStorage.getItem('new_folders'));
        new_folders.push({ id: `new-folder-${folder_id}`, name: folder_name });
        localStorage.setItem("new_folders", JSON.stringify(new_folders));
        setShowNameBar(false)
        updateAppsData()
    }

    const showAllApps = () => { setAllAppsView(!allAppsView) }

    const renderNameBar = () => {
        let addFolder = () => {
            let folder_name = document.getElementById("folder-name-input").value;
            addToDesktop(folder_name);
        }

        let removeCard = () => {
            setShowNameBar(false);
        }

        return (
            <div className="absolute rounded-md top-1/2 left-1/2 text-center text-white font-light text-sm bg-ub-cool-grey transform -translate-y-1/2 -translate-x-1/2 sm:w-96 w-3/4 z-50">
                <div className="w-full flex flex-col justify-around items-start pl-6 pb-8 pt-6">
                    <span>New folder name</span>
                    <input className="outline-none mt-5 px-1 w-10/12  context-menu-bg border-2 border-yellow-700 rounded py-0.5" id="folder-name-input" type="text" autoComplete="off" spellCheck="false" autoFocus={true} />
                </div>
                <div className="flex">
                    <div onClick={addFolder} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 border-r-0 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50">Create</div>
                    <div onClick={removeCard} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50">Cancel</div>
                </div>
            </div>
        );
    }

    useEffect(() => {

        ReactGA.send({ hitType: "pageview", page: "/desktop", title: "Custom Title" });
        fetchAppsData();
        setContextListeners();
        setEventListeners();
        checkForNewFolders();
        return () => {
            removeContextListeners()
        }
    }, [])

    return (
        <div className={" h-full w-full flex flex-col items-end justify-start content-start flex-wrap-reverse pt-8 bg-transparent relative overflow-hidden overscroll-none window-parent"}>

            {/* Window Area */}
            <div className="absolute h-full w-full bg-transparent" data-context="desktop-area">
                {renderWindows()}
            </div>

            {/* Background Image */}
            <BackgroundImage img={props.bg_image_name} />

            {/* Ubuntu Side Menu Bar */}
            <SideBar apps={apps}
                hide={hiddenSideBar}
                hideSideBar={hideSideBar}
                favourite_apps={favouriteApps}
                showAllApps={showAllApps}
                allAppsView={allAppsView}
                closed_windows={closedWindows}
                focused_windows={focusedWindows}
                isMinimized={minimizedWindows}
                openAppByAppId={openApp} />

            {/* Desktop Apps */}
            {renderDesktopApps()}

            {/* Context Menus */}
            <DesktopMenu active={contextMenus.desktop} openApp={openApp} addNewFolder={addNewFolder} />
            {/*  <ExplorerMenu active={contextMenus.explorer}  openApp={openApp} addNewFolder={addNewFolder}  />
            <FileMenu active={contextMenus.file}  openApp={openApp}  addNewFolder={addNewFolder} />
            <FolderMenu active={contextMenus.folder}  openApp={openApp} addNewFolder={addNewFolder}  />
        */}
            {/* <DefaultMenu active={contextMenus.default} /> */}

            {/* Folder Input Name Bar */}
            {
                (showNameBar
                    ? renderNameBar()
                    : null
                )
            }

            {allAppsView ?
                <AllApplications apps={apps}
                    recentApps={appStack}
                    openApp={openApp} /> : null}

        </div>
    )
}

export default Desktop