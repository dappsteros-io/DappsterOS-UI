import React, { useContext, useEffect, useRef, useState } from 'react';
import { Affix, Button, Layout, Drawer, Breadcrumb, Empty, Spin, Flex, Menu } from "antd"
import $ from 'jquery';
import { FaChevronLeft, FaChevronRight, } from "react-icons/fa"
import { useDispatch, useSelector } from 'react-redux';
import { getFolderList, getRootFolderList } from '@/store/file';
import { LoadingOutlined } from '@ant-design/icons';
import mime from 'mime';
import { mimetypes } from '@/lib/mimetypes';
import ExplorerMenu from '../context_menus/explorer-menu';
import FileMenu from '../context_menus/file-menu';
import FolderMenu from '../context_menus/folder-menu';
import { ExplorerContext } from '@/contexts';
const { Header, Content, Footer, Sider } = Layout;

export function Explorer(props) {
    const explorerRef = useRef(null)
    const dispatch = useDispatch()
    const [isEmpty, setIsEmpty] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentPath, setCurrentPath] = useState("/")
    const [currentItem, setCurrentItem] = useState("")
    const [refresh, setRefresh] = useState(0)
    const [copieds, setCopieds] = useState([])

    const { folders, dataFolders } = useSelector(state => state.files)
    console.log({ folders, dataFolders })
    useEffect(() => {
        let wasEmpty = localStorage.getItem("trash-empty");
        if (wasEmpty !== null && wasEmpty !== undefined) {
            if (wasEmpty === "true") setIsEmpty(true)
        }
        dispatch(getRootFolderList()).then(res => {
            setLoading(false)
        })
    }, [])
    useEffect(() => {
        setLoading(true)
        dispatch(getFolderList(currentPath)).then(res => {
            setLoading(false)
        })

    }, [currentPath, refresh])
    useEffect(() => {
        if (explorerRef.current) {
            explorerRef.current.addEventListener("contextmenu", function (e) {
                // console.log(e)
                if (e.target.dataset.path) {
                    setCurrentItem(folders.find(f => f.path == e.target.dataset.path))
                }
                checkContextMenu(e)
            })
            explorerRef.current.addEventListener('click', hideAllContextMenu);
        }
    }, [folders])
    const onRefresh = () => {
        setRefresh(new Date().getTime())
    }
    const focusFile = (e) => {
        e.target.classList.toggle("bg-neutral-700");
    }

    const { explorerCtx: contextMenus, setExplorerCtx: setContextMenus } = useContext(ExplorerContext)
    const getMenuPosition = (e) => {
        const rect = e.target.getBoundingClientRect();
        var posx = rect.left + e.offsetX;
        var posy = rect.top + e.offsetY - 34;
        return {
            posx, posy
        }
    }
    const hideAllContextMenu = () => {
        let menus = { ...contextMenus };
        Object.keys(menus).forEach(key => {
            menus[key] = false;
        });
        setContextMenus(menus)
    }

    const checkContextMenu = (e) => {
        e.preventDefault();
        hideAllContextMenu();
        switch (e.target.dataset.context) {
            case "explorer":
            case "folder":
            case "file":
                showContextMenu(e, e.target.dataset.context);
                break;
            default:
                break;
        }
    }

    const showContextMenu = (e, menuName /* context menu name */) => {
        let { posx, posy } = getMenuPosition(e);
        let contextMenu = document.getElementById(`${menuName}-menu`);
        if (posx + $(contextMenu).width() > explorerRef.current.offsetWidth) posx -= $(contextMenu).width();
        if (posy + $(contextMenu).height() > explorerRef.current.offsetHeight) posy -= $(contextMenu).height();

        posx = posx.toString() + "px";
        posy = posy.toString() + "px";
        contextMenu.style.left = posx;
        contextMenu.style.top = posy;
        setContextMenus({ ...contextMenus, [menuName]: true })
    }
    const emptyTrash = () => {
        setIsEmpty(true)
        localStorage.setItem("trash-empty", true);
    };

    const emptyScreen = () => {
        return (
            <Empty />
        );
    }
    const onSetCurrentPath = (item) => {
        if (item.is_dir) {
            setCurrentPath(item.path)
        }
    }
    const generateIcon = (item) => {
        if (!item.is_dir) {
            const t = mime.getType(item.name)?.replace("/", "-");
            return "/themes/Yaru/mimetypes/" + (mimetypes[t] || "unknown.png");
        } else {
            return "/themes/Yaru/system/folder.png"
        }
    }
    const showItems = () => {
        return loading ? <Spin indicator={<LoadingOutlined spin />} size="small" /> : (
            <div className={`flex-grow flex flex-wrap items-start content-start justify-start overflow-y-auto explorerRef.currentMainScreen`} data-context={"explorer"} style={{ height: props.size.height - 100 }}>
                {
                    folders.map((item, index) => {
                        return (
                            <div key={index} data-context={item.is_dir ? "folder" : "file"} tabIndex="1" onFocus={focusFile} onBlur={focusFile} onDoubleClick={() => { onSetCurrentPath(item); setCurrentItem(item) }} onTouchEnd={() => { onSetCurrentPath(item); setCurrentItem(item) }} className="flex flex-col items-center text-sm outline-none w-16 my-2 mx-4 hover:bg-neutral-600 rounded-md py-2 relative">
                                <div className='absolute w-full h-24' data-path={item.path} data-context={item.is_dir ? "folder" : "file"}></div>
                                <div className="w-16 h-16 flex items-center justify-center">
                                    <img src={generateIcon(item)} alt="Ubuntu File Icons" />
                                </div>
                                <span className="text-center rounded px-0.5 break-words break-all">{item.name}</span>
                            </div>
                        )
                    })
                }
            </div>
        );
    }

    const onSidebarItemSelect = (v) => {
        setDrawerOpen(false)
        setCurrentPath(v.key)
    }
    const renderSidebar = () => <Menu
        onClick={(v) => { onSidebarItemSelect(v) }}
        style={{
            // width: 256,
        }}
        defaultSelectedKeys={[]}
        defaultOpenKeys={[]}
        mode="inline"
        items={dataFolders.map(d => ({ title: d.name, label: d.name, key: d.path, icon: <img src={generateIcon(d)} width={16} height={16} /> }))}
    />

    const itemRender = (currentRoute, params, items, paths) => {
        const isLast = currentRoute?.path === items[items.length - 1]?.path;
        return isLast ? (
            <div className='px-1 py-0.5'>{currentRoute.title}</div>
        ) : (
            <Button size='small' ghost onClick={() => { setCurrentPath(currentRoute.path) }} type="text">{currentRoute.title}</Button>
        );
    }

    const generateItems = () => {
        const pathString = currentPath;
        const pathParts = pathString.split("/").filter(part => part); // Split and filter out empty parts
        const breadcrumb = [];
        breadcrumb.push({ title: "ROOT", path: "/" })
        breadcrumb.push({ type: 'separator' });
        let currPath = "";

        pathParts.forEach((part, index) => {
            currPath += `/${part}`;
            breadcrumb.push({ title: part, path: currPath });

            // Add a separator except after the last part
            if (index < pathParts.length - 1) {
                breadcrumb.push({ type: 'separator' });
            }
        });
        return breadcrumb
    }

    const onCopy = (item) => {
        if(item){
            setCopieds([{ from: item.path }])
        }else{
            setCopieds([])
        }
    }
    return (
        <Layout data-context="explorer" ref={explorerRef}>
            {props.size.width < 550 ? <Drawer
                title="Files"
                placement={"left"}
                closable={false}
                onClose={() => { setDrawerOpen(false) }}
                open={drawerOpen}
                key={"left"} getContainer={false}
                className='!bg-antd-menu-dark p-0'
            >
                {renderSidebar()}
            </Drawer> : <Sider
                width={"25%"} className='!bg-antd-menu-dark'
            >
                <Affix offsetTop={34}>
                    <span>Files</span>
                    {renderSidebar()}
                </Affix>
            </Sider>}
            <Content
                style={{
                    padding: '8px 0px 0',
                }}
                className='w-full h-full bg-ub-grey'
            >
                {/* <div className="flex items-center justify-between w-full bg-ub-warm-grey bg-opacity-40 text-sm">
                <span className="font-bold ml-2">Trash</span>
                <div className="flex">
                    <div className="border border-black bg-black bg-opacity-50 px-3 py-1 my-1 mx-1 rounded text-gray-300">Restore</div>
                    <div onClick={emptyTrash} className="border border-black bg-black bg-opacity-50 px-3 py-1 my-1 mx-1 rounded hover:bg-opacity-80">Empty</div>
                </div>
            </div> */}
                <Affix offsetTop={10}>
                    <div className='flex items-center gap-2 ml-2'>
                        {props.size.width <= 550 ? <Button shape="circle" icon={drawerOpen ? <FaChevronLeft /> : <FaChevronRight />} onClick={() => setDrawerOpen(true)} /> : null} <Breadcrumb
                            separator=""
                            itemRender={itemRender}
                            items={generateItems()}
                        />
                    </div>
                </Affix>
                <Flex gap="middle">
                    {
                        (isEmpty
                            ? emptyScreen()
                            : showItems()
                        )
                    }
                </Flex>
            </Content>
            <ExplorerMenu active={contextMenus.explorer} item={currentItem} currentPath={currentPath} refresh={onRefresh} copy={onCopy} copieds={copieds} />
            <FileMenu active={contextMenus.file} item={currentItem} refresh={onRefresh} copy={onCopy} copieds={copieds} />
            <FolderMenu active={contextMenus.folder} item={currentItem} refresh={onRefresh} copy={onCopy} copieds={copieds}/>
        </Layout>
    )
}

export default Explorer;

export const displayExplorer = () => {
    return <Explorer></Explorer>;
}
