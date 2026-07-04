import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://oibsip-2uvp.vercel.app'
  ];

  if (process.env.FRONTEND_URL) {
    const envOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim());
    envOrigins.forEach(origin => {
      if (origin && !allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    });
  }

  ioInstance = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[SOCKET] Socket Client connected: ${socket.id}`);

    // Join a room for a specific order's status tracking
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`[SOCKET] Socket ${socket.id} joined room: order_${orderId}`);
    });

    // Leave tracking room
    socket.on('leave_order', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`[SOCKET] Socket ${socket.id} left room: order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Socket Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const emitOrderUpdate = (orderId, status) => {
  if (ioInstance) {
    ioInstance.to(`order_${orderId}`).emit('order_status_updated', {
      orderId,
      status,
      timestamp: new Date(),
    });
    
    // Broadcast message to general admin dashboard to refresh statistics
    ioInstance.emit('admin_dashboard_refresh', {
      type: 'order_status_updated',
      orderId,
      status,
    });
    
    console.log(`[SOCKET] Emitted order status updated: order_${orderId} -> ${status}`);
  } else {
    console.warn(`[SOCKET] Could not emit socket update for order ${orderId} because Socket.IO is not initialized.`);
  }
};

export const emitNewOrderAlert = (order) => {
  if (ioInstance) {
    ioInstance.emit('admin_new_order', {
      order,
    });
    console.log(`[SOCKET] Broadcasted new order alert to admin channel: ${order._id}`);
  }
};
