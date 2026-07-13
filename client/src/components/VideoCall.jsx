import '../styles/VideoCall.css'

const VideoCall = ({ localVideoRef, remoteVideoRef, callState, activeDM, hangup }) => {
    if(callState !== 'calling' && callState !== 'in_call') return null

    return (
        <div className="call-overlay">
            <div className="call-modal">
                <h3 className="call-title">
                    {callState === 'calling' ? `Calling ${activeDM?.name}...` : `In call with ${activeDM?.name}`}
                </h3>

                <div className="call-videos">

                    <div className="remote-video-wrapper">
                        <video 
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="remote-video"
                        />

                        {callState === 'calling' && (
                            <div className="calling-placeholder">
                                <div className="calling-avatar">
                                    {activeDM?.name?.[0]?.toUpperCase()}
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