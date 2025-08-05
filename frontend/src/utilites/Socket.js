import BackEndUrl from "./config";
import { io } from "socket.io-client"



const socket = io(BackEndUrl, {
    withCredentials: true,
    transports : ['websocket'],
    reconnection  : true,
})

socket.on( 'connect', () =>{
    console.log('connect to backend using socket');
})

socket.on('disconnect', (reason)=>{
    console.log("dissconnected socket :", reason);
})

export default socket;