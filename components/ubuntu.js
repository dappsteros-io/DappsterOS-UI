import React, { useEffect, useState, Component } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BootingScreen from './screen/booting_screen';
import Desktop from './screen/desktop';
import LockScreen from './screen/lock_screen';
import Navbar from './screen/navbar';
import { isEmpty } from "../lib"
import { getUserInfo, logOut } from '@/store/user/actions';
import PrelineScript from './SEO/Preline';


const Ubuntu = () => {
	const [screenLocked, setScreenLocked] = useState(false);
	const [bgImage, setBgImage] = useState('wall-2');
	const [bootingScreen, setBootingScreen] = useState(true);
	const [shutdownScreen, setShutdownScreen] = useState(true);
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user.user)
	useEffect(() => {
		if (isEmpty(user)) {
			setScreenLocked(true)
		}
	}, [user])
	useEffect(() => {
		getLocalData();
	}, [])

	const setTimeOutBootScreen = () => {
		setTimeout(() => {
			setBootingScreen(false);
		}, 2000);
	};

	const getLocalData = () => {
		dispatch(getUserInfo()).then(res => {
			if (res.payload) {
				if (res.payload.success == 200) {
					turnOn()
					unLockScreen()
				}
			}
		})
		// Get Previously selected Background Image
		let bg_image_name = localStorage.getItem('bg-image');
		if (bg_image_name !== null && bg_image_name !== undefined) {
			setBootingScreen(bg_image_name);
		}

		let booting_screen = localStorage.getItem('booting_screen');
		if (booting_screen !== null && booting_screen !== undefined) {
			// user has visited site before
			setBootingScreen(false);
		} else {
			// user is visiting site for the first time
			localStorage.setItem('booting_screen', false);
			setTimeOutBootScreen();
		}

		// get shutdown state
		let shut_down = localStorage.getItem('shut-down');
		if (shut_down !== null && shut_down !== undefined && shut_down === 'true') shutDown();
		else {
			// Get previous lock screen state
			let screen_locked = localStorage.getItem('screen-locked')
			if (screen_locked !== null && screen_locked !== undefined) {
				// setScreenLocked(screen_locked === 'true' ? true : false);

			}
		}
	};

	const lockScreen = () => {
		document.getElementById('status-bar').blur();
		setTimeout(() => {
			setScreenLocked(true)
			dispatch(logOut())
		}, 100); // waiting for all windows to close (transition-duration)
		localStorage.setItem('screen-locked', true);

	};

	const unLockScreen = () => {
		window.removeEventListener('click', unLockScreen);
		window.removeEventListener('keypress', unLockScreen);

		setScreenLocked(false);
		localStorage.setItem('screen-locked', false);
	};

	const changeBackgroundImage = (img_name) => {
		setBgImage(img_name);
		localStorage.setItem('bg-image', img_name);
	};

	const shutDown = () => {
		document.getElementById('status-bar').blur();
		setShutdownScreen(true);
		localStorage.setItem('shut-down', true);
	};

	const turnOn = () => {
		setShutdownScreen(false)
		setBootingScreen(true);
		setTimeOutBootScreen();
		localStorage.setItem('shut-down', false);
	};

	return (
		<div className="w-screen h-screen overflow-hidden" id="monitor-screen">
			<LockScreen
				isLocked={screenLocked}
				bgImgName={bgImage}
				unLockScreen={unLockScreen}
			/>
			<BootingScreen
				visible={bootingScreen}
				isShutDown={shutdownScreen}
				turnOn={turnOn}
			/>
			<Navbar lockScreen={lockScreen} shutDown={shutDown} />
			<Desktop bg_image_name={bgImage} changeBackgroundImage={changeBackgroundImage} />
			<PrelineScript />
		</div>
	);
}

export default Ubuntu;