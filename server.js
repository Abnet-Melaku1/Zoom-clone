const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
//set default engine
app.set("view engine", "ejs");
//use static pages
app.use(express.static("public"));

app.use("/peerjs", peerServer);
//Home page route
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    // console.log(`someone connected..on room: ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});
server.listen(process.env.PORT || 3000);
