'use client' // if you use app dir, don't forget this line
import React, { useEffect, useState } from 'react';
import { FaHdd, FaInfo, } from "react-icons/fa"
import { GrDashboard } from "react-icons/gr";
import { useDispatch, useSelector } from 'react-redux';
import { getUtilization, getStorageList, getHardwareUsage } from '@/store/sys';
import { renderSize } from '@/lib';
import { List, ListItem } from "../common/list"
import Image from 'next/image';
import dynamic from "next/dynamic";
import { socket } from '@/service/socket';
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


export function Monitor(props) {
    useEffect(() => {
        if (window.HSStaticMethods)
            window.HSStaticMethods.autoInit();
    }, [])
    const sideMenu = [{
        title: "Process",
        name: "process",
        icon: FaHdd
    }, {
        title: "Resources",
        name: "resource",
        icon: GrDashboard
    }, {
        title: "File System",
        name: "fs",
        icon: FaInfo
    }]
    const [currentTab, setCurrentTab] = useState(props.tab || "resource")

    return (
        <div className={"w-full h-full flex flex-col z-20 items-center  windowMainScreen select-none bg-ub-cool-grey gap-0"}>
            <div className='bg-neutral-800 w-full justify-center' >
                <div className="px-3 py-4 overflow-y-auto bg-opacity-25  w-full justify-center">
                    <ul className="font-medium  flex flex-row  w-full justify-center">
                        {sideMenu.map(m => <li key={m.name}>
                            <a href="#" className={`flex items-center px-2 border border-neutral-500 text-gray-900 rounded-sm dark:text-white hover:bg-neutral-700 group ${currentTab == m.name ? "bg-neutral-600" : ""}`} onClick={() => setCurrentTab(m.name)}>
                                <m.icon></m.icon>
                                <span className="flex-1 ml-3 whitespace-nowrap">{m.title}</span>
                            </a>
                        </li>)}
                    </ul>
                </div>
            </div>
            <div className="w-full bg-neutral-800 px-4">
                <div className={`${currentTab == "resource" ? "" : "hidden"} w-full justify-center`}>
                    <ResourceChart />
                </div>
                <div className={`${currentTab == "fs" ? "" : "hidden"}`}>
                    <StorageDetail />
                </div>
                <div className={`${currentTab == "process" ? "" : "hidden"}`}>
                    <AboutDetail />
                </div>
            </div>

        </div>
    )
}

export default Monitor



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
        dispatch(getHardwareUsage()).then(res=>{
            console.log(res)
        })
    }, []);
    return hardware ? <div className='p-8'>
        <div className="w-full text-center flex-shrink-0 group block mb-6">
            <div className="flex items-center justify-center">
                <Image className="inline-block flex-shrink-0 size-[62px] rounded-full" src="./images/dapp/logo.svg" alt="Image Description" width={62} height={62} />
                <div className="ms-3">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Dappster.io</h3>
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

// charts.tsx/jsx


export function ResourceChart() {
    const [cpuUsage, setCpuUsage] = useState(0)
    const [memUsage, setMemUsage] = useState(0)
    const [networkUsage, setNetworkUsage] = useState([0, 0])
    const [cpuSeries, setCpuSeries] = useState([])
    const [memSeries, setMemSeries] = useState([])
    const [networkSeries, setNetworkSeries] = useState([])
    const [data, setData] = useState([])
    useEffect(() => {
        socket.connect()
        return () => {
            socket.disconnect()
        }
    }, [])
    useEffect(() => {
        if (socket.connected) {
            onConnect(socket);
        }
        socket.on("casaos:system:utilization", onUpdateInfo)
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        const pId = setInterval(() => performanceTrack(), 1000)
        return () => {
            setTimeout(() => clearInterval(pId), 1000)
            socket.off("casaos:system:utilization", onUpdateInfo)
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [data]);

    const onConnect = () => {
        socket.io.engine.on("upgrade", (transport) => {
            setTransport(transport.name);
        });
    }

    const onDisconnect = () => {
        console.log("disconnected")
    }
    const performanceTrack = () => {
        let cpus = cpuSeries
        if (cpus[0]) {
            cpus[0].data.push(cpuUsage)
            let d = cpus[0].data
            if (d.length > 60) d = d.slice(d.length - 60, d.length)
            cpus[0] = {
                name: 'CPU ' + 0,
                data: d
            }
        } else {
            cpus[0] = {
                name: 'CPU ' + 0,
                data: [...Array(59).fill(0), cpuUsage]
            }
        }
        setCpuSeries(cpus)

        ApexCharts.exec('realtime-cpu', 'updateSeries', [{
            data: cpus[0]["data"]
        }])

        let mems = memSeries

        if (mems[0]) {
            mems[0].data.push(memUsage)
            let m = mems[0].data
            if (m.length > 60) m = m.slice(m.length - 60, m.length)
            mems[0] = {
                name: 'Mem ' + 0,
                data: m
            }
        } else {
            mems[0] = {
                name: 'Mem ' + 0,
                data: [...Array(59).fill(0), memUsage]
            }
        }
        setMemSeries(mems)
        ApexCharts.exec('realtime-mem', 'updateSeries', [{
            data: mems[0]["data"]
        }])

        let nets = networkSeries

        if (nets[0]) {
            nets[0].data.push(networkUsage[0])
            let m = nets[0].data
            if (m.length > 60) m = m.slice(m.length - 60, m.length)
            nets[0] = {
                name: 'ByteSent',
                data: m
            }
        } else {
            nets[0] = {
                name: 'ByteSent',
                data: [...Array(59).fill(0), networkUsage[0]]
            }
        }


        if (nets[1]) {
            nets[1].data.push(networkUsage[1])
            let m = nets[1].data
            if (m.length > 60) m = m.slice(m.length - 60, m.length)
            nets[1] = {
                name: 'ByteReceived',
                data: m
            }
        } else {
            nets[1] = {
                name: 'ByteReceived',
                data: [...Array(59).fill(0), networkUsage[1]]
            }
        }
        setNetworkSeries(nets)
        ApexCharts.exec('realtime-net', 'updateSeries', [{
            name: "ByteSent",
            data: nets[0]["data"]
        }, {
            name: "ByteReceived",
            data: nets[1]["data"]
        }])
    }
    const onUpdateInfo = (res) => {
        let data = res.Properties;
        setData(data)
        let cpu = JSON.parse(data.sys_cpu);
        setCpuUsage(cpu.percent)
        let mem = JSON.parse(data.sys_mem);
        setMemUsage(mem.usedPercent)
        let net = JSON.parse(data.sys_net);
        setNetworkUsage([parseInt(net[0]['bytesSent'] / (1024 * 1024)), parseInt(net[0]['bytesRecv'] / (1024 * 1024))])
    }
    const cpuOptions = {
        series: cpuSeries,
        chart: {
            id: 'realtime-cpu',
            toolbar: {
                show: false,
            },
            height: 350,
            type: 'line',
            animations: {
                enabled: false,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000
                }
            },
        },
        colors: ['#FF0000'],
        legend: {
            show: true,
            labels: {
                colors: cpuSeries.map(c => "#fff")
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 1,
        },
        xaxis: {
            type: 'string',
            categories: ["1 min", ...Array(9).fill(""), "50 secs", ...Array(9).fill(""), "40 secs", ...Array(9).fill(""), "30 secs", ...Array(9).fill(""), "20 secs", ...Array(9).fill(""), "10 secs", ""],
            labels: {
                show: true,
                style: {
                    colors: "#fff"
                }
            }
        },
        yaxis: {
            categories: ["100%", "80%", "30%", "40%", "20%", ""],
            opposite: true,
            min: 0,
            max: 100,
            labels: {
                align: "right",
                style: {
                    colors: "#fff"
                }
            }
        },
    };

    const memoryOptions = {
        series: memSeries,
        chart: {
            id: 'realtime-mem',
            toolbar: {
                show: false,
            },
            animations: {
                enabled: false,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000
                }
            },
            height: 350,
            type: 'line',
        },
        legend: {
            show: true,
            labels: {
                colors: cpuSeries.map(c => "#fff")
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 1,
        },
        xaxis: {
            type: 'string',
            categories: ["1 min", ...Array(9).fill(""), "50 secs", ...Array(9).fill(""), "40 secs", ...Array(9).fill(""), "30 secs", ...Array(9).fill(""), "20 secs", ...Array(9).fill(""), "10 secs", ""],
            labels: {
                show: true,
                style: {
                    colors: "#fff"
                }
            }
        },

        yaxis: {
            categories: ["100%", "80%", "60%", "40%", "20%", ""],
            opposite: true,
            min: 0,
            max: 100,
            labels: {
                align: "right",
                style: {
                    colors: "#fff"
                }
            },
        },
    };
    const networkOptions = {
        series: networkSeries,
        chart: {
            id: 'realtime-net',
            toolbar: {
                show: false,
            },
            animations: {
                enabled: false,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000
                }
            },
            height: 350,
            type: 'line',
        },
        legend: {
            show: true,
            labels: {
                colors: "#fff"
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 1,
        },
        xaxis: {
            type: 'string',
            categories: ["1 min", ...Array(9).fill(""), "50 secs", ...Array(9).fill(""), "40 secs", ...Array(9).fill(""), "30 secs", ...Array(9).fill(""), "20 secs", ...Array(9).fill(""), "10 secs", ""],
            labels: {
                show: true,
                style: {
                    colors: "#fff"
                }
            }
        },

        yaxis: {
            // categories: ["100%", "80%", "60%", "40%", "20%", ""],
            opposite: true,
            // min: 0,
            // max: 100,
            labels: {
                align: "right",
                style: {
                    colors: "#fff"
                }
            },
        },
    };
    const donutOptions = {
        series: [70],
        chart: {
            height: 280,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',

                    dataLabels: {
                        show: true,
                        name: {
                            show: false,
                        },
                        value: {
                            fontSize: "10px",
                            show: true
                        }
                    }
                }
            },
        },
        labels: ['Memory'],
    };
    return (
        <>
            <div className='flex justify-center'>
                <div className=''>
                    <h3 className='text-white'>CPU</h3>
                    <ApexChart type="area" options={cpuOptions} series={cpuOptions.series} height={150} width={500} />
                </div>
            </div>
            <div className='flex justify-center'>
                <div className=''>
                    <h3 className='text-white'>Memory</h3>
                    <ApexChart type="area" options={memoryOptions} series={memoryOptions.series} height={150} width={500} />

                 {/*    <div className='flex flex-row gap-4'>
                        <ApexChart type="radialBar" options={donutOptions} series={donutOptions.series} height={75} width={150} />
                        <ApexChart type="radialBar" options={donutOptions} series={donutOptions.series} height={75} width={150} />
                    </div>
 */}
                </div>
            </div>
            <div className='flex justify-center'>
                <div className=''>
                    <h3 className='text-white'>Network</h3>
                    <ApexChart type="line" options={networkOptions} series={networkOptions.series} height={150} width={500} />
                </div>
            </div>{/* 
            <div className='flex justify-center'>
                <div className=''>
                    <h3 className='text-white'>Disk</h3>
                    <ApexChart type="line" options={memoryOptions} series={memoryOptions.series} height={150} width={500} />
                </div>
            </div> */}
        </>
    )

}


export const displayMonitor = () => {
    return <Monitor> </Monitor>;
}
