import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function CallPage() {
  const { id: callId } = useParams();
  const { user, isLoaded } = useUser();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData.token || !user || !callId) return;

      try {
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: user.id,
            name: user.fullName,
            image: user.imageUrl,
          },
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.log("Error starting a call", error);
        toast.error("Cannot connect to the call.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, user, callId]);

  if (isConnecting || !isLoaded) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="p-8 rounded-2xl bg-white/10 text-white shadow-xl backdrop-blur-md text-center animate-pulse">
          <p className="text-xl font-semibold">📞 Connecting to call...</p>
          <p className="text-sm opacity-80 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="relative w-full mx-auto max-w-4xl">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="p-6 rounded-2xl bg-white/10 text-white shadow-xl backdrop-blur-md max-w-md text-center">
              <p className="text-lg font-semibold">
                ❌ Could not initialize call
              </p>
              <p className="text-sm opacity-80 mt-2">
                Please refresh or try again later
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) {
    return navigate("/");
  }
  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
