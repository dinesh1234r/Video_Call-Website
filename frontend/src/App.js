import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Input, VStack, Text } from "@chakra-ui/react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const socket = io("https://video-call-website-backend.onrender.com");

const App = () => {
  const [meetingId, setMeetingId] = useState("");
  const [joined, setJoined] = useState(false);
  const [peerId, setPeerId] = useState("");
  const videoRef = useRef(null);
  const peerVideoRef = useRef(null);

  useEffect(() => {
    socket.on("user-connected", (id) => {
      console.log("User connected:", id);
      callUser(id);
    });

    socket.on("user-disconnected", () => {
      console.log("User disconnected");
      if (peerVideoRef.current) peerVideoRef.current.srcObject = null;
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startMeeting = async () => {
    const response = await fetch("https://video-call-website-backend.onrender.com/create-meeting", {
      method: "POST",
    });
    const data = await response.json();
    setMeetingId(data.meetingId);
    joinMeeting(data.meetingId);
  };

  const joinMeeting = async (id) => {
    const response = await fetch("https://video-call-website-backend.onrender.com/join-meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId: id }),
    });
    if (response.ok) {
      setMeetingId(id);
      setJoined(true);
      const newPeerId = uuidv4();
      setPeerId(newPeerId);
      socket.emit("join-room", id, newPeerId);
      startVideo();
    } else {
      alert("Invalid Meeting ID");
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const callUser = async (id) => {
    console.log("Calling user:", id);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Simulating a simple P2P call
    peerVideoRef.current.srcObject = stream;
  };

  return (
    <VStack spacing={4} p={8}>
      {!joined ? (
        <>
          <Button onClick={startMeeting} colorScheme="teal">
            Create Meeting
          </Button>
          <Input
            placeholder="Enter Meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
          <Button onClick={() => joinMeeting(meetingId)} colorScheme="blue">
            Join Meeting
          </Button>
        </>
      ) : (
        <>
          <Text fontSize="lg">Meeting ID: {meetingId}</Text>
          <Box>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "300px", border: "2px solid teal" }} />
            <video ref={peerVideoRef} autoPlay playsInline style={{ width: "300px", border: "2px solid blue" }} />
          </Box>
        </>
      )}
    </VStack>
  );
};

export default App;
