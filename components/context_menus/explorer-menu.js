import { createFile, createFolder, task } from '@/store/file';
import { Button, Image, Input, Menu, Modal, Typography } from 'antd';
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import mime from "mime"
import { mimetypes } from '@/lib/mimetypes';
import { List, ListItem } from '../common/list';

function ExplorerMenu(props) {
    const { item, refresh, copy, copieds, currentPath } = props
    const [newFileModal, setNewFileModalOpen] = useState(false)
    const [newFolderModal, setNewFolderModalOpen] = useState(false)
    const [propertyModalOpen, setPropertyModalOpen] = useState(false)
    const [name, setName] = useState("newfile")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
    }, [])


    const onCreate = () => {
        if (!name) return;
        setLoading(true)
        dispatch(createFile(item.path + "/" + name)).then(res => {
            setNewFileModalOpen(false)
            setLoading(false)
            refresh()
        })
    }
    const onNewFolder = () => {
        if (!name) return;
        setLoading(true)
        dispatch(createFolder(item.path + "/" + name)).then(res => {
            setNewFolderModalOpen(false)
            setLoading(false)
            refresh()
        })
    }
    const onPaste = () => {
        setLoading(true)
        dispatch(task({ item: copieds, type: "copy", style: "overwrite", to: currentPath })).then(res => {
            setLoading(false)
            copy()
            refresh()
        })
    }


    const generateIcon = (item) => {
        if (item) {

            if (!item.is_dir) {
                const t = mime.getType(item.name)?.replace("/", "-");
                return "/themes/Yaru/mimetypes/" + (mimetypes[t] || "unknown.png");
            } else {
                return "/themes/Yaru/system/folder.png"
            }
        } else {
            return "/themes/Yaru/mimetypes/unknown.png"
        }
    }

    return (<>
        <div id="explorer-menu" className={(props.active ? " block " : " hidden ") + " cursor-default w-52  text-left font-light border-gray-900 rounded text-white absolute z-50 text-sm"}>
            <Menu selectable={false} className='!border-none'>
                <Menu.Item className='!h-8 !leading-8' onClick={() => setNewFileModalOpen(true)}>New File</Menu.Item>
                <Menu.Item className='!h-8 !leading-8' onClick={() => setNewFolderModalOpen(true)} >New Folder</Menu.Item>
                <Menu.Divider></Menu.Divider>
                <Menu.Item className='!h-8 !leading-8' >Upload File</Menu.Item>
                <Menu.Divider></Menu.Divider>
                <Menu.Item className='!h-8 !leading-8' disabled={!(copieds && copieds.length)} onClick={onPaste} >Paste</Menu.Item>
                <Menu.Divider></Menu.Divider>
                <Menu.Item className='!h-8 !leading-8' onClick={() => setPropertyModalOpen(true)}>Properties</Menu.Item>
            </Menu>
        </div>
        <Modal
            title={`New file`}
            open={newFileModal}
            onOk={() => onCreate()}
            onCancel={() => setNewFileModalOpen(false)}
            footer={
                [
                    <Button loading={loading} key="submit" type="primary" onClick={onCreate}>
                        Create
                    </Button>
                ]}
        >
            <Input value={name} onChange={e => setName(e.target.value)} />
        </Modal>
        <Modal
            title={`New folder`}
            open={newFolderModal}
            onOk={() => onNewFolder()}
            onCancel={() => setNewFolderModalOpen(false)}
            footer={
                [
                    <Button loading={loading} key="submit" type="primary" onClick={onNewFolder}>
                        Create
                    </Button>
                ]}
        >
            <Input value={name} onChange={e => setName(e.target.value)} />
        </Modal>

        <Modal
            title={`Property "${item?.name}"`}
            open={propertyModalOpen}
            onOk={() => { }}
            onCancel={() => setPropertyModalOpen(false)}
            footer={[]}
        >
            <div className='w-full flex flex-col items-center justify-center'>

                <Image
                    width={200}
                    height={200}
                    src={generateIcon(item)}
                    fallback=""
                />
                <Typography.Title level={4}>{item?.name}</Typography.Title>
            </div>
            <List className="mb-2">
                <ListItem label={"Parent Folder"} floating>{item?.path}</ListItem>
            </List>
            <List>
                <ListItem label={"Modified"} floating>{item?.modified}</ListItem>
                <ListItem label={"Created"} floating>{item?.date}</ListItem>
            </List>
        </Modal>
    </>
    )
}

function Devider() {
    return (
        <div className="flex justify-center w-full">
            <div className=" border-t border-gray-900 py-1 w-2/5"></div>
        </div>
    );
}


export default ExplorerMenu
