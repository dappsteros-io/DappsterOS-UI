import React from 'react'

export default function Spotify(props) {
    console.log({ props })
    return (
        <iframe src="https://open.spotify.com/embed/playlist/37i9dQZEVXbLZ52XmnySJg" frameBorder="0" title="Spotify" className="h-full w-full bg-ub-cool-grey"></iframe>
    )
}

// export const displaySpotify = (data) => {
//     <Spotify data={data}> </Spotify>
// }
