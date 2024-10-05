import { deleteFiles, getDownloadLink, renameFolder, task } from '@/store/file';
import { Button, Image, Menu, Modal, Typography, Input } from 'antd';
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import mime from "mime"
import { mimetypes } from '@/lib/mimetypes';
import { List, ListItem } from '../common/list';

function FolderMenu(props) {
    const { item, refresh, copy, copieds } = props
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [propertyModalOpen, setPropertyModalOpen] = useState(false)
    const [renameModalOpen, setRenameModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(item?.name)
    const dispatch = useDispatch()
    useEffect(() => {
        setName(item?.name)
    }, [item])



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
        console.log("download")
        dispatch(getDownloadLink(item.path)).then(res => {
            setLoading(false)
            location.href = res.payload;
        })
    }
    const onPaste = () => {
        setLoading(true)
        dispatch(task({ item: copieds, type: "copy", style: "overwrite", to: item.path })).then(res => {
            setLoading(false)
            refresh()
            copy()
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
    return (<>
        <div id="folder-menu" className={(props.active ? " block " : " hidden ") + " cursor-default w-52  text-left font-light border-gray-900 rounded text-white absolute z-50 text-sm"}>
            <Menu selectable={false} className='!border-none'>
                <Menu.Item className='!h-8 !leading-8' onClick={onDownload}>Download</Menu.Item>
                <Menu.Divider></Menu.Divider>
                <Menu.Item className='!h-8 !leading-8' onClick={() => copy(item)}>Copy</Menu.Item>
                <Menu.Item className='!h-8 !leading-8' disabled={!(copieds && copieds.length)} onClick={onPaste}>Paste</Menu.Item>
                <Menu.Item className='!h-8 !leading-8' onClick={() => setDeleteModalOpen(true)}>Delete</Menu.Item>
                <Menu.Divider></Menu.Divider>
                <Menu.Item className='!h-8 !leading-8' onClick={() => setRenameModalOpen(true)}>Rename</Menu.Item>
                <Menu.Divider></Menu.Divider>
                <Menu.Item className='!h-8 !leading-8'>Open in Terminal</Menu.Item>
                <Menu.Item className='!h-8 !leading-8' onClick={() => setPropertyModalOpen(true)}>Properties</Menu.Item>
            </Menu>
        </div>
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
            title={`Rename "${item?.name}"?`}
            open={renameModalOpen}
            onOk={() => onRename()}
            onCancel={() => setRenameModalOpen(false)}
            footer={[
                <Button loading={loading} key="submit" type='primary' onClick={onRename}>
                    Rename
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
                {/* <Typography.Text>{item?.size}</Typography.Text> */}
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


export default FolderMenu
