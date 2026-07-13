import '../styles/IncomingCall.css'

const IncomingCall = ({ incomingCall, callState, acceptCall, rejectCall }) => {

    if (callState !== 'incoming') return null

    return (
    <div className='call-overlay'>
      <div className='incoming-call-modal'>

        <div className='incoming-avatar'>
          {incomingCall?.callerName?.[0]?.toUpperCase()}
        </div>

        <h3>{incomingCall?.callerName}</h3>
        <p>Incoming video call...</p>

        <div className='incoming-call-actions'>
          <button className='accept-btn' onClick={acceptCall}>
            Accept
          </button>
          <button className='reject-btn' onClick={rejectCall}>
            Decline
          </button>
        </div>

      </div>
    </div>
  )
}

export default IncomingCall