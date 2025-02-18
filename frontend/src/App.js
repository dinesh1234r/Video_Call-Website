import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Input, VStack, Text, Flex, Heading } from "@chakra-ui/react";
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
    <Box h="100vh" w="100vw" bg="gray.900" color="white">
      {!joined ? (
        <Flex direction="column" align="center" justify="center" h="100%">
          <VStack spacing={6} p={8} bg="gray.800" borderRadius="lg" boxShadow="lg">
            <Heading size="lg" color="teal.400">Video Call App</Heading>
            <Button onClick={startMeeting} colorScheme="teal" w="full">
              Create Meeting
            </Button>
            <Input
              placeholder="Enter Meeting ID"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              textAlign="center"
              borderColor="gray.600"
              focusBorderColor="teal.400"
              bg="gray.700"
              color="white"
            />
            <Button onClick={() => joinMeeting(meetingId)} colorScheme="blue" w="full">
              Join Meeting
            </Button>
          </VStack>
        </Flex>
      ) : (
        <Flex direction="column" w="100%" h="100%">
          {/* Meeting ID Display */}
          <Box textAlign="center" py={3} bg="gray.800" color="teal.300" fontSize="lg" fontWeight="bold">
            Meeting ID: {meetingId}
          </Box>
          
          {/* Video Call Area */}
          <Flex w="100%" h="100%">
            <Box
              w="50%"
              h="100%"
              bg="black"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRight="2px solid gray"
            >
              <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            <Box
              w="50%"
              h="100%"
              bg="black"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <video ref={peerVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default App;
