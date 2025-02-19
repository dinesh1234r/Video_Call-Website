import React, { useEffect, useRef, useState } from "react"; import { ChakraProvider, Button, Input, VStack, HStack } from "@chakra-ui/react"; import { Peer } from "peerjs";

const VideoCall = () => { const [peerId, setPeerId] = useState(""); const [remotePeerIdValue, setRemotePeerIdValue] = useState(""); const [peer, setPeer] = useState(null); const localVideoRef = useRef(null); const remoteVideoRef = useRef(null);

useEffect(() => { const newPeer = new Peer(); setPeer(newPeer);

newPeer.on("open", (id) => {
  setPeerId(id);
});

newPeer.on("call", (call) => {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
    localVideoRef.current.srcObject = stream;
    call.answer(stream);
    call.on("stream", (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
    });
  });
});

return () => newPeer.destroy();

}, []);

const callPeer = (remoteId) => { navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => { localVideoRef.current.srcObject = stream; const call = peer.call(remoteId, stream); call.on("stream", (remoteStream) => { remoteVideoRef.current.srcObject = remoteStream; }); }); };

return ( <ChakraProvider> <VStack spacing={4} p={5}> <p>Your ID: {peerId}</p> <Input placeholder="Enter remote peer ID" value={remotePeerIdValue} onChange={(e) => setRemotePeerIdValue(e.target.value)} /> <Button onClick={() => callPeer(remotePeerIdValue)}>Call</Button> <HStack spacing={4}> <video ref={localVideoRef} autoPlay playsInline style={{ width: "300px", border: "1px solid black" }}></video> <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px", border: "1px solid black" }}></video> </HStack> </VStack> </ChakraProvider> ); };

export default VideoCall;