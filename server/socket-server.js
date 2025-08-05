import { Server } from "socket.io";

const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5175", "http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Store the io instance in the app for use in controllers
  // httpServer.app.set("io", io);

  const rooms = new Map();
  // Track connected users interested in bus updates
  const busSubscribers = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle document collaboration
    socket.on("join-room", ({ roomId, username }) => {
      console.log(`${username} joined room ${roomId}`);
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { content: "", users: new Set() });
      }

      const room = rooms.get(roomId);
      room.users.add(username);

      socket.emit("load-document", room.content);

      io.to(roomId).emit("user-count", room.users.size);
    });

    socket.on("send-changes", ({ delta, roomId }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.content = delta;
        socket.broadcast.to(roomId).emit("receive-changes", delta);
      }
    });

    socket.on("draw", ({ drawLine, roomId }) => {
      socket.broadcast.to(roomId).emit("receive-drawing", drawLine);
    });

    // Bus tracking and notifications
    socket.on("subscribe-to-bus", (busId) => {
      console.log(`User subscribed to bus ${busId}`);
      socket.join(`bus-${busId}`);

      if (!busSubscribers.has(busId)) {
        busSubscribers.set(busId, new Set());
      }
      busSubscribers.get(busId).add(socket.id);
    });

    socket.on("unsubscribe-from-bus", (busId) => {
      console.log(`User unsubscribed from bus ${busId}`);
      socket.leave(`bus-${busId}`);

      if (busSubscribers.has(busId)) {
        busSubscribers.get(busId).delete(socket.id);
        if (busSubscribers.get(busId).size === 0) {
          busSubscribers.delete(busId);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");

      // Clean up document rooms
      rooms.forEach((room, roomId) => {
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      });

      // Clean up bus subscribers
      busSubscribers.forEach((subscribers, busId) => {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          busSubscribers.delete(busId);
        }
      });
    });
  });

  return io;
};

export default initializeSocketServer;
