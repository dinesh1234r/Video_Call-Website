const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://root1:jocker22.dk@cluster01.watow3c.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Meeting Schema
const MeetingSchema = new mongoose.Schema({
  meetingId: String,
  createdAt: { type: Date, default: Date.now },
});

const Meeting = mongoose.model("Meeting", MeetingSchema);

// Create a meeting
app.post("/create-meeting", async (req, res) => {
  const meetingId = uuidv4();
  await Meeting.create({ meetingId });
  res.json({ meetingId });
});

// Join a meeting
app.post("/join-meeting", async (req, res) => {
  const { meetingId } = req.body;
  const meeting = await Meeting.findOne({ meetingId });
  if (meeting) {
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Meeting not found" });
  }
});

// WebSocket Handling
io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("join-room", (meetingId, userId) => {
    socket.join(meetingId);
    socket.broadcast.to(meetingId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.broadcast.to(meetingId).emit("user-disconnected", userId);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
