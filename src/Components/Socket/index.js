import { io } from 'socket.io-client'


export const socketInit = () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket']
    }
    return io('https://audiocall.backend.babycode.org',options)
    // return io('http://localhost:5000', options)
}