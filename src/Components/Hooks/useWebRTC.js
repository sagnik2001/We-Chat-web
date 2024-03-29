import React, { useState, useRef, useEffect, useCallback } from "react";
import { useStateWithCallback } from "./useStateWithCallBack";
import { socketInit } from "../Socket";
import { ACTIONS } from "../Actions/Actions";
import freeice from "freeice";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Providers/ContextProvider";

const users = [
  {
    id: 1,
    name: "Sagnik",
  },
  {
    id: 2,
    name: "Akash",
  },
];

export const useWebRTC = (roomId, user, localMediaStream) => {
  const [clients, setClients] = useStateWithCallback([]);
  const audioElements = useRef({});
  const connections = useRef({});
  const socket = useRef(null);
  const clientsRef = useRef(null);
  const navigate = useNavigate()
  const { audioMediaRefOfUsers, setAudioMediaRefUpdated } = useAuth()

  const addNewClient = useCallback(
    (newClient, cb) => {
      const lookingFor = clients.find((client) => client.id === newClient.id);
      console.log(newClient, "new Client")
      console.log(clients, 'clients');

      if (lookingFor === undefined) {
        setClients((existingClients) => [...existingClients, newClient], cb);
      }
    },
    [clients, setClients]
  );

  console.log(clients, "clients")

  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);



  useEffect(() => {
    const initChat = async () => {
      socket.current = socketInit();
      console.log(socket.current, "socket");



      addNewClient({ ...user, muted: false }, () => {
        console.log(audioElements)
        const localElement = audioElements.current[user.id];
        console.log(localElement);
        console.log(localMediaStream)
        if (localElement && localMediaStream.current) {
          localElement.volume = 0;
          localElement.srcObject = localMediaStream.current;
        }
      });
      socket.current.on(ACTIONS.MUTE_INFO, ({ userId, isMute }) => {
        handleSetMute(isMute, userId);
      });

      socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
      socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
      socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
      socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
      socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
        handleSetMute(true, userId);
      });
      socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
        handleSetMute(false, userId);
      });
      socket.current.emit(ACTIONS.JOIN, {
        roomId,
        user,
      });
    }



    async function handleNewPeer({ peerId, createOffer, user: remoteUser }) {
      console.log("Enter", remoteUser)
      if (peerId in connections.current) {
        return console.log(
          `You are already connected with ${peerId} (${user.name})`
        );
      }
      console.log(freeice(), "peerId,freeIce")

      // Store it to connections
      connections.current[peerId] = new RTCPeerConnection({
        iceServers: freeice(),
      });

      // Handle new ice candidate on this peer connection
      connections.current[peerId].onicecandidate = (event) => {
        socket.current.emit(ACTIONS.RELAY_ICE, {
          peerId,
          icecandidate: event.candidate,
        });
      };

      console.log(connections.current[peerId], "li")
      addNewClient({ ...remoteUser, muted: false }, () => {
        // get current users mute info
        const currentUser = clientsRef.current.find(
          (client) => client.id === user.id
        );
        if (currentUser) {
          socket.current.emit(ACTIONS.MUTE_INFO, {
            userId: user.id,
            roomId,
            isMute: currentUser.muted,
          });
        }
      });


      // Handle on track event on this connection
      if (localMediaStream.current) {
        connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
          console.log(remoteStream, "pup");

          if (audioElements.current[remoteUser.id]) {
            audioElements.current[remoteUser.id].srcObject = remoteStream;
            audioMediaRefOfUsers.current[remoteUser.id] = remoteStream;
            setAudioMediaRefUpdated(prevValue => prevValue + 1);

          } else {
            let settled = false;
            const interval = setInterval(() => {
              if (audioElements.current[remoteUser.id]) {
                audioElements.current[remoteUser.id].srcObject = remoteStream;
                audioMediaRefOfUsers.current[remoteUser.id] = remoteStream;
                setAudioMediaRefUpdated(prevValue => prevValue + 1);
                settled = true;
              }

              if (settled) {
                clearInterval(interval);
              }
            }, 300);
          }

        };
      }
      // Add connection to peer connections track
      if (localMediaStream.current) {
        localMediaStream.current.getTracks().forEach((track) => {
          console.log(track, 'track')
          connections.current[peerId].addTrack(track, localMediaStream.current);
        });
      }

      // Create an offer if required
      if (createOffer) {
        const offer = await connections.current[peerId].createOffer();

        // Set as local description
        await connections.current[peerId].setLocalDescription(offer);

        // send offer to the server
        socket.current.emit(ACTIONS.RELAY_SDP, {
          peerId,
          sessionDescription: offer,
        });
      }
    }
    async function handleRemovePeer({ peerId, userId }) {
      // Correction: peerID to peerId
      if (connections.current[peerId]) {
        connections.current[peerId].close();
      }

      delete connections.current[peerId];
      delete audioElements.current[peerId];
      setClients([]);
      navigate("/endCall")
    }
    async function handleIceCandidate({ peerId, icecandidate }) {
      if (icecandidate) {
        connections.current[peerId].addIceCandidate(icecandidate);
      }
    }
    async function setRemoteMedia({
      peerId,
      sessionDescription: remoteSessionDescription,
    }) {
      connections.current[peerId].setRemoteDescription(
        new RTCSessionDescription(remoteSessionDescription)
      );

      // If session descrition is offer then create an answer
      if (remoteSessionDescription.type === "offer") {
        const connection = connections.current[peerId];

        const answer = await connection.createAnswer();
        connection.setLocalDescription(answer);

        socket.current.emit(ACTIONS.RELAY_SDP, {
          peerId,
          sessionDescription: answer,
        });
      }
    }
    async function handleSetMute(mute, userId) {
      const clientIdx = clientsRef.current
        .map((client) => client.id)
        .indexOf(userId);
      const allConnectedClients = JSON.parse(
        JSON.stringify(clientsRef.current)
      );
      console.log(allConnectedClients, "all");
      if (clientIdx > -1) {
        allConnectedClients[clientIdx].muted = mute;
        // setClients(allConnectedClients);
        setClients((prevClients) => {
          // Make a copy of the previous state
          const updatedClients = [...prevClients];


          updatedClients[clientIdx] = {
            ...updatedClients[clientIdx],
            muted: mute,
          };

          // Return the updated state
          return updatedClients;
        });
      }

    };

    initChat();
    return () => {
      console.log(localMediaStream.current);
      if (localMediaStream.current) localMediaStream.current.getTracks().forEach((track) => track.stop());
      socket.current.emit(ACTIONS.LEAVE, { roomId });
      for (let peerId in connections.current) {
        connections.current[peerId].close();
        delete connections.current[peerId];
        delete audioElements.current[peerId];
      }
      // socket.current.off(ACTIONS.ADD_PEER);
      socket.current.off(ACTIONS.REMOVE_PEER);
      socket.current.off(ACTIONS.ICE_CANDIDATE);
      socket.current.off(ACTIONS.SESSION_DESCRIPTION);
      socket.current.off(ACTIONS.MUTE);
      socket.current.off(ACTIONS.UNMUTE);
    };
  }, []);

  const provideRef = (instance, userId) => {
    audioElements.current[userId] = instance;
  };

  const handleMute = (isMute, userId) => {
    let settled = false;

    if (userId === user.id) {
      let interval = setInterval(() => {
        if (localMediaStream.current) {
          localMediaStream.current.getTracks()[0].enabled = !isMute;
          if (isMute) {
            socket.current.emit(ACTIONS.MUTE, {
              roomId,
              userId: user.id,
            });
          } else {
            socket.current.emit(ACTIONS.UNMUTE, {
              roomId,
              userId: user.id,
            });
          }
          settled = true;
        }
        else {
          // localMediaStream.current.getTracks()[0].enabled = !isMute;
          // if (isMute) {
          //   socket.current.emit(ACTIONS.MUTE, {
          //     roomId,
          //     userId: user.id,
          //   });
          // } else {
          //   socket.current.emit(ACTIONS.UNMUTE, {
          //     roomId,
          //     userId: user.id,
          //   });
          // }
          // settled = true;
          // console.log(localMediaStream,"pi")
        }
        if (settled) {
          clearInterval(interval);
        }
      }, 200);
    }
  };
  return {
    clients,
    provideRef,
    handleMute,
    audioElements
  };
};
