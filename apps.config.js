import Spotify from './components/apps/spotify';
import VsCode from './components/apps/vscode';
import { displayTerminal } from './components/apps/terminal';
import Settings from './components/apps/settings';
import { displayChrome } from './components/apps/chrome';
import { displayGedit } from './components/apps/gedit';
import AppCenter from './components/apps/appcenter';
import Explorer from './components/apps/explorer';
import { displayAppCenter } from './components/apps/appcenter';
import { displayAboutVivek } from './components/apps/vivek';
import { displayTerminalCalc } from './components/apps/calc';
import { displayMonitor } from './components/apps/monitor';

const apps = [
    {
        id: "chrome",
        title: "Google Chrome",
        icon: '/themes/Yaru/apps/chrome.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayChrome,
    },
    {
        id: "calc",
        title: "Calc",
        icon: '/themes/Yaru/apps/calc.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displayTerminalCalc,
    },
    /* {
        id: "about-vivek",
        title: "About Vivek",
        icon: '/themes/Yaru/system/user-home.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: true,
        screen: displayAboutVivek,
    }, */
    {
        id: "vscode",
        title: "Visual Studio Code",
        icon: '/themes/Yaru/apps/vscode.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: VsCode,
    },
    {
        id: "terminal",
        title: "Terminal",
        icon: '/themes/Yaru/apps/bash.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: displayTerminal,
    },
    {
        id: "spotify",
        title: "Spotify",
        icon: '/themes/Yaru/apps/spotify.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: () => <Spotify data={{ data: true }} />
    },
    {
        id: "settings",
        title: "Settings",
        icon: '/themes/Yaru/apps/gnome-control-center.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: (props) => <Settings {...props}></Settings>,
    },
    {
        id: "explorer",
        title: "Explorer",
        icon: '/themes/Yaru/apps/file-manager.png',
        disabled: false,
        favourite: false,
        desktop_shortcut: true,
        screen: (props) => <Explorer {...props} />
    },
    /*
     {
         id: "gedit",
         title: "Contact Me",
         icon: '/themes/Yaru/apps/gedit.png',
         disabled: false,
         favourite: false,
         desktop_shortcut: true,
         screen: displayGedit,
     }, */

    {
        id: "appstore",
        title: "App Center",
        icon: '/themes/Yaru/apps/software-store.png',
        disabled: false,
        favourite: true,
        desktop_shortcut: false,
        screen: (props) => <AppCenter {...props}></AppCenter>,
    },
    {
        id: "monitor",
        title: "System Monitor",
        icon: '/themes/Yaru/apps/gnome-system-monitor.png',
        disabled: false,
        favourite: false,
        desktop_shortcut: true,
        screen: displayMonitor,
    },
]

export default apps;