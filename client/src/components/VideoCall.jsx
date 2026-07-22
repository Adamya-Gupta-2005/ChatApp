import { useEffect } from 'react'
import '../styles/VideoCall.css'

const VideoCall = ({ setLocalVideoRef, setRemoteVideoRef, incomingCall, callState, activeDM, hangup, remoteStream, localStream, remoteStreamReady }) => {

    useEffect(() => {
        const el = document.querySelector('.remote-video')
        if (el && remoteStream?.current && !el.srcObject) {
            el.srcObject = remoteStream.current
        }
    }, [remoteStreamReady, callState])


    if (callState !== 'calling' && callState !== 'in_call') return null
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

                        <div className="local-video-wrapper">
                            <video
                                ref={setLocalVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="local-video"
                            />
                        </div>

                        {callState === 'calling' && (
                            <div className="calling-placeholder">
                                <div className="calling-avatar">
                                    {otherName[0]?.toUpperCase()}
                                </div>

                                <p>Ringing....</p>
                            </div>
                        )}
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