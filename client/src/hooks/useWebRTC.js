import { useEffect } from "react"
import { useState } from "react"
import { useRef, useCallback } from "react"
import axios from 'axios'


const useWebRTC = (socket, currentUser, activeDM) => {

    const [callState, setCallState] = useState('idle')
    //idle, calling, incoming, in_call

    const [incomingCall, setIncomingCall] = useState(null)
    //offer, from, callername

    const [remoteStreamReady, setRemoteStreamReady] = useState(false)
    const [iceConfig, setIceConfig] = useState(null)

    const localVideoRef = useRef(null)

    const peerConnection = useRef(null)
    const localStream = useRef(null)
    const remoteStream = useRef(null)

    const remoteVideoRef = useRef(null)


    useEffect(() => {
        const fetchIceConfig = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/users/ice-config`,
                    { withCredentials: true }
                )
                setIceConfig(res.data)
                
            } catch (error) {
                console.error('Failed to fetch ICE config:', error)
                setIceConfig({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
            }
        }
        fetchIceConfig()
    }, [])


    const setRemoteVideoRef = useCallback((element) => {
        remoteVideoRef.current = element
        if (element && remoteStream.current) {
            element.srcObject = remoteStream.current
        }
    }, [])

    const setLocalVideoRef = useCallback((element) => {
        localVideoRef.current = element
        if (element && localStream.current) {
            element.srcObject = localStream.current
        }
    }, [])

    const getUserMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })

        localStream.current = stream

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
        }
        //this if is used to checkif localVideoRef contains video element or not
        //if this func is run before mounting video element it prevvents null getting srcObject

        return stream
    }

    const createPeer = (targetUserId) => {
        const pc = new RTCPeerConnection(iceConfig || { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })

        pc.oniceconnectionstatechange = () => {
            console.log('ICE state:', pc.iceConnectionState)
        }

        // when we get ICE candidates, send them to the other peer via socket
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit('ice_candidate', {
                    candidate: e.candidate,
                    to: targetUserId
                })
            }
        }

        // when remote stream arrives, attach to remote video element
        pc.ontrack = (e) => {
            remoteStream.current = e.streams[0]
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = e.streams[0]
            }
            setRemoteStreamReady(prev => !prev)
        }

        peerConnection.current = pc
        return pc
    }

    const cleanup = () => {

        //stop all camera mic tracks
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop())
            localStream.current = null
        }

        //close peer connection
        if (peerConnection.current) {
            peerConnection.current.close()
            peerConnection.current = null
        }

        //clear video elements
        if (localVideoRef.current) localVideoRef.current.srcObject = null
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
        remoteStream.current = null

        setRemoteStreamReady(false)
        setCallState('idle')
        setIncomingCall(null)
    }

    // ---caller side---

    const startCall = async () => {
        if (!activeDM) return
        if (!iceConfig) {
            alert('Setting up connection, please try again in a moment')
            return
        }
        try {
            setCallState('calling')

            const stream = await getUserMedia();
            const pc = createPeer(activeDM._id)

            //add localTracks to peer connection
            stream.getTracks().forEach(track => pc.addTrack(track, stream))

            //create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('call_user', {
                offer,
                to: activeDM._id,
                from: currentUser._id,
                callerName: currentUser.name
            })

        } catch (error) {
            console.error('startCall error:', error)
            cleanup()
        }
    }

    //--- callee side ---

    const acceptCall = async () => {
        if (!incomingCall) return
        try {

            const stream = await getUserMedia()
            const pc = createPeer(incomingCall.from)

            stream.getTracks().forEach(track => pc.addTrack(track, stream))

            //set remote description from offer
            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer))

            //create answer
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            socket.emit('call_accepted', {
                answer,
                to: incomingCall.from
            })

            setCallState('in_call')
        } catch (err) {
            console.error('acceptCall error:', err)
            cleanup()
        }
    }

    const rejectCall = () => {
        if (!incomingCall) return
        socket.emit('call_rejected', { to: incomingCall.from })
        cleanup()
    }

    const hangup = () => {
        const targetId = activeDM?._id || incomingCall?.from
        if (targetId) {
            socket.emit('call_ended', { to: targetId })
        }
        cleanup()
    }


    //socket listeneres

    useEffect(() => {
        if (!socket) return

        //b recieves call ffrom a
        socket.on('incoming_call', ({ offer, from, callerName }) => {
            setIncomingCall({ offer, from, callerName })
            setCallState('incoming')
        })

        //a recieves answer from b after b accepted
        socket.on('call_accepted', async ({ answer }) => {
            try {
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer))
                setCallState('in_call')
            } catch (error) {
                console.error('call_accepted error:', error)
            }
        })

        //a reciees rejection from b 
        socket.on('call_rejected', () => {
            cleanup()
            alert('call rejected')
        })

        //either hangs up from other side
        socket.on('call_ended', () => {
            cleanup()
        })

        //both recieve ICE candidate from each other
        socket.on('ice_candidate', async ({ candidate }) => {
            try {
                await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (error) {
                console.log('ice_candidate error:', error)
            }
        })

        return () => {
            socket.off('incoming_call')
            socket.off('call_accepted')
            socket.off('call_rejected')
            socket.off('call_ended')
            socket.off('ice_candidate')
        }
    }, [socket, activeDM])

    return {
        callState, incomingCall, localVideoRef, remoteVideoRef,
        setRemoteVideoRef, setLocalVideoRef,
        startCall, acceptCall, rejectCall, hangup,
        localStream, remoteStream, remoteStreamReady,
        iceConfigReady: iceConfig !== null
    }
}

export default useWebRTC