import { useEffect } from 'react'
import '../styles/VideoCall.css'

const VideoCall = ({ localVideoRef, remoteVideoRef, setRemoteVideoRef, incomingCall, callState, activeDM, hangup, localStream, remoteStream, remoteStreamReady }) => {
    
    useEffect(() => {
        // attaching streams after the video component mounts on videoRef
        if(remoteVideoRef.current && remoteStream?.current) {
            remoteVideoRef.current.srcObject = remoteStream.current
        }

        if(localVideoRef.current && localStream?.current){
            localVideoRef.current.srcObject = localStream.current
        }
    },[callState, remoteStreamReady])

    if(callState !== 'calling' && callState !== 'in_call') return null
    const otherName = activeDM?.name || incomingCall?.callerName || 'User'

    return (
        <div className="call-overlay">
            <div className="call-modal">
                <h3 className="call-title">
                    {callState === 'calling' ? `Calling ${otherName}...` : `In call with ${otherName}`}
                </h3>

                <div className="call-videos">

                    <div className="remote-video-wrapper">
                        <video 
                            ref={setRemoteVideoRef}
                            autoPlay
                            playsInline
                            className="remote-video"
                        />

                        {callState === 'calling' && (
                            <div className="calling-placeholder">
                                <div className="calling-avatar">
                                    {otherName[0]?.toUpperCase()}
                                </div>

                                <p>Ringing....</p>
                            </div>
                        )}
                    </div>


                    <div className="local-video-wrapper">
                        <video
                            ref={localVideoRef}
                            autoPlay 
                            playsInline
                            muted
                            className="local-video"
                        />
                    </div>

                    <button className="hangup-btn" onClick={hangup}>
                        End Call
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VideoCall