import React, { useEffect, useRef, useState } from "react";
import { ChakraProvider, Box, VStack, HStack, Input, Button, IconButton, Text } from "@chakra-ui/react";
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaVideo, FaVideoSlash } from "react-icons/fa";
import { Peer } from "peerjs";

const VideoCall = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setPeerId(id);
    });

    newPeer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
    });

    return () => newPeer.destroy();
  }, []);

  const callPeer = (remoteId) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;
      const call = peer.call(remoteId, stream);
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
      remoteVideoRef.current.srcObject = null;
    }
  };

  return (
    <ChakraProvider>
      <Box w="100vw" h="100vh" bg="gray.900" color="white" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        
        {/* Video Section */}
        <HStack w="80%" h="70%" spacing={4} justify="center">
          <Box flex="1" bg="black" position="relative" borderRadius="lg" overflow="hidden">
            <video ref={localVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%" }}></video>
            <Box position="absolute" bottom="2" left="2" bg="blackAlpha.600" p={2} borderRadius="md" fontSize="sm">
              You
            </Box>
          </Box>

          <Box flex="1" bg="black" position="relative" borderRadius="lg" overflow="hidden">
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%" }}></video>
            <Box position="absolute" bottom="2" left="2" bg="blackAlpha.600" p={2} borderRadius="md" fontSize="sm">
              Remote User
            </Box>
          </Box>
        </HStack>

        {/* Input and Call Button */}
        <VStack spacing={3} mt={4} mb={40}>
          <Text>Your ID: {peerId}</Text>
          <HStack>
            <Input
              placeholder="Enter remote peer ID"
              value={remotePeerId}
              onChange={(e) => setRemotePeerId(e.target.value)}
              bg="gray.700"
              color="white"
              border="none"
              _placeholder={{ color: "gray.400" }}
            />
            <Button colorScheme="blue" onClick={() => callPeer(remotePeerId)}>
              Call
            </Button>
          </HStack>
        </VStack>

        {/* Control Buttons */}
        <HStack position="absolute" bottom="4" bg="blackAlpha.700" p={4} borderRadius="md" spacing={4}>
          <IconButton icon={isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />} onClick={toggleMute} aria-label="Mute" colorScheme="gray" />
          <IconButton icon={isVideoOn ? <FaVideo /> : <FaVideoSlash />} onClick={toggleVideo} aria-label="Toggle Video" colorScheme="gray" />
          <IconButton icon={<FaPhone />} onClick={endCall} aria-label="End Call" colorScheme="red" />
        </HStack>
      </Box>
    </ChakraProvider>
  );
};

export default VideoCall;
