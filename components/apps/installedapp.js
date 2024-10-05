import React from 'react'

export default function InstalledApp(props) {
    return (
        <iframe src={props.url || ""} frameBorder="0" title="InstalledApp" className="h-full w-full bg-ub-cool-grey"></iframe>
    )
}

export const displayInstalledApp = (url) => {
    <InstalledApp url={url}> </InstalledApp>
}
