import React, { useState, useEffect, useRef } from 'react';
import Clock from '../util_components/clock';
import { useDispatch, useSelector } from 'react-redux';
import { logIn, signUp } from '@/store/user/actions';
export default function LockScreen(props) {
    const usernameRef = useRef()
    const passwordRef = useRef()
    const password2Ref = useRef()
    const [isLogin, setLogin] = useState(true)
    const [err, setErr] = useState("")
    const dispatch = useDispatch()
    const wallpapers = useSelector(state => state.user.wallpapers)

    const onEnter = (evt) => {

        if (props.isLocked) {
            if (evt.key == "Enter") {
                const username = (usernameRef.current.value)
                const password = (passwordRef.current.value)
                if (isLogin) {
                    dispatch(logIn({ username, password })).then(res => {
                        if (res.payload) {
                            if (res.payload.success == 200) {
                                props.unLockScreen()
                            }
                        } else {
                            if (res.error) {
                                setErr(res.error.message)
                            }
                        }
                    })
                } else {
                    const password2 = (password2Ref.current.value)
                    dispatch(signUp({ username, password, key: password2 })).then(res => {
                    })
                }
            }
        }
    }

    return (
        <div id="ubuntu-lock-screen" style={{ zIndex: "100" }} className={(props.isLocked ? " visible translate-y-0 " : " invisible -translate-y-full ") + " absolute outline-none bg-black bg-opacity-90 transform duration-500 select-none top-0 right-0 overflow-hidden m-0 p-0 h-screen w-screen"}>
            <div style={{ backgroundImage: `url(${wallpapers[props.bgImgName]})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPositionX: "center" }} className="absolute top-0 left-0 w-full h-full transform z-20 blur-md "></div>
            <div className="w-full h-full z-50 overflow-hidden relative flex flex-col justify-center items-center text-white">
                <div className="text-7xl">
                    <Clock onlyTime={true} />
                </div>
                <div className="mt-4 text-xl font-medium">
                    <Clock onlyDay={true} />
                </div>
                {isLogin ?
                    <div className="mt-16 text-base flex flex-col">
                        <input className="outline-none mt-5 px-1 context-menu-bg border-2 border-gray-400 border-opacity-5 rounded py-0.5" id="username" type="text" autoComplete="off" spellCheck="false" autoFocus={true} placeholder='Username' ref={usernameRef} onKeyUp={onEnter} />
                        <input className="outline-none mt-5 px-1 context-menu-bg border-2 border-gray-400 border-opacity-5 rounded py-0.5" id="password" type="password" autoComplete="off" spellCheck="false" autoFocus={true} placeholder='Password' ref={passwordRef} onKeyUp={onEnter} />
                        {err ? <label className='text-yellow-700 mt-4'>{err}</label> : ""}
                    </div> : <div className=" mt-16 text-base flex flex-col">
                        <input className="outline-none mt-5 px-1 context-menu-bg border-2 border-gray-400 border-opacity-5 rounded py-0.5" id="username" type="text" autoComplete="off" spellCheck="false" autoFocus={true} placeholder='Username' ref={usernameRef} onKeyUp={onEnter} />
                        <input className="outline-none mt-5 px-1 context-menu-bg border-2 border-gray-400 border-opacity-5 rounded py-0.5" id="password" type="password" autoComplete="off" spellCheck="false" autoFocus={true} placeholder='Password' ref={passwordRef} onKeyUp={onEnter} />
                        <input className="outline-none mt-5 px-1 context-menu-bg border-2 border-gray-400 border-opacity-5 rounded py-0.5" id="password2" type="password" autoComplete="off" spellCheck="false" autoFocus={true} placeholder='Password' ref={password2Ref} onKeyUp={onEnter} />
                        {err ? <label className='text-yellow-700 mt-4'>{err}</label> : ""}
                    </div>}
            </div>
        </div>
    )
}
