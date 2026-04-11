let socket = null;
const listeners = new Set();

export const initWebSocket = () => {
    if (socket) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//localhost:8000/ws`;
    socket = new WebSocket(socketUrl);
    socket.onopen = () => console.log('WebSocket Connected');
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        listeners.forEach(listener => listener(data));
    };
    socket.onclose = () => {
        console.log('WebSocket Disconnected. Reconnecting...');
        socket = null;
        setTimeout(initWebSocket, 3000);
    };
    socket.onerror = (error) => console.error('WebSocket Error:', error);
};

export const addWSListener = (listener) => listeners.add(listener);
export const removeWSListener = (listener) => listeners.delete(listener);

export default { initWebSocket, addWSListener, removeWSListener };
