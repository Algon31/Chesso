import BackEndUrl from "./config";
import { io } from "socket.io-client"



const Socket = io(BackEndUrl, {
    withCredentials: true,
    transports : ['websocket'],
    reconnection  : true,
    autoConnect : false
})

Socket.on( 'connect', () =>{
    console.log('connect to backend using socket');
})

Socket.on('disconnect', (reason)=>{
    console.log("dissconnected socket :", reason);
})

export default Socket;