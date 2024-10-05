import { deleteFiles, downloadFile, renameFolder } from '@/store/file'
import { Button, Card, Image, Input, Menu, Modal, Typography } from 'antd'
import React, { useState, useEffect } from 'react'
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useDispatch } from 'react-redux'
import { List, ListItem } from '../common/list';
import mime from "mime"
import { mimetypes } from '@/lib/mimetypes';

function FileMenu(props) {
    const { item, refresh } = props
    const [renameModalOpen, setRenameModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [propertyModalOpen, setPropertyModalOpen] = useState(false)
    const [name, setName] = useState(item?.name)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
        setName(item?.name)
    }, [item])


    const onRenameModalShow = () => {
        setRenameModalOpen(true)
    }
    const onRename = () => {
        setRenameModalOpen(false)
        let segs = item.path.split("/").slice(0, -1)
        segs.push(name)
        setLoading(true)
        dispatch(renameFolder({ old_path: item.path, new_path: segs.join("/") })).then(res => {
            setLoading(false)
            refresh()
        })

    }
    const onDownload = () => {
        setLoading(true)
        dispatch(downloadFile(item.path)).then(res => {
            setLoading(false)
        })
    }

    const onDelete = () => {
        setLoading(true)
        dispatch(deleteFiles([item.path])).then(res => {
            setLoading(false)
            setDeleteModalOpen(false)
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
    return (
        <>
            <div id="file-menu" className={(props.active ? " block " : " hidden ") + " cursor-default w-52  text-left font-light border-gray-900 rounded text-white  absolute z-50 text-sm"}>
                <Menu selectable={false} className='!border-none'>
                    <Menu.Item className='!h-8 !leading-8' onClick={onDownload}>Download</Menu.Item>
                    <Menu.Divider></Menu.Divider>
                    <Menu.Item className='!h-8 !leading-8'>Copy</Menu.Item>
                    <Menu.Item className='!h-8 !leading-8'>Paste</Menu.Item>
                    <Menu.Item className='!h-8 !leading-8' onClick={() => setDeleteModalOpen(true)}>Delete</Menu.Item>
                    <Menu.Divider></Menu.Divider>
                    <Menu.Item className='!h-8 !leading-8' onClick={onRenameModalShow}>Rename</Menu.Item>
                    <Menu.Divider></Menu.Divider>
                    <Menu.Item className='!h-8 !leading-8' onClick={() => setPropertyModalOpen(true)}>Properties</Menu.Item>
                </Menu>
            </div>
            <Modal
                title={`Rename [ ${item?.name} ]`}
                open={renameModalOpen}
                onOk={() => onRename()}
                onCancel={() => setRenameModalOpen(false)}
                footer={
                    [
                        <Button loading={loading} key="submit" type="primary" onClick={onRename}>
                            Rename
                        </Button>
                    ]}
            >
                <Input value={name} onChange={e => setName(e.target.value)} />
            </Modal>
            <Modal
                title={`Delete "${item?.name}"?`}
                open={deleteModalOpen}
                onOk={() => onDelete()}
                onCancel={() => setDeleteModalOpen(false)}
                footer={[
                    <Button loading={loading} key="cancel" onClick={() => setDeleteModalOpen(false)}>
                        Cancel
                    </Button>,
                    <Button loading={loading} key="submit" type='primary' danger onClick={onDelete}>
                        Delete
                    </Button>
                ]}
            >
                <p>Deleted items can not be restored.</p>
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


export default FileMenu
