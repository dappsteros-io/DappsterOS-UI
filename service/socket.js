import io from "socket.io-client";
import { wsURL } from "@/store/service";

export const socket = io(wsURL, {
    transports: ['websocket', 'polling', "webtransport"],
    path: `/v2/message_bus/socket.io/`,
    autoConnect: false,
    addTrailingSlash:true,
});
 