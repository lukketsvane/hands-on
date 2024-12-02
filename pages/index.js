import React, { useRef, useState, useEffect, useCallback } from "react";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "../components/handposeutil";
import * as fp from "fingerpose";
import Handsigns from "../components/handsigns";
import {
  Box,
  Text,
  Flex,
  Image,
  Progress,
  VStack,
  Button,
  Tooltip,
  Grid,
  GridItem,
  Heading,
} from "@chakra-ui/react";
import { Info, Sun, Moon } from "lucide-react";
import Metatags from "../components/metatags";
import signDescriptions from "../components/signDescriptions.json";
import "@tensorflow/tfjs-backend-webgl";
import { Global, keyframes } from "@emotion/react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const HOLD_DURATION = 2000;
const JITTER_THRESHOLD = 300;
const TRANSITION_DELAY = 500;
const MILESTONES = ["E", "J", "O", "T", "Y"];

const dropBalloon = keyframes`
  0% { transform: translateY(-100px); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

const sway = keyframes`
  0% { transform: translateX(0px); }
  50% { transform: translateX(20px); }
  100% { transform: translateX(0px); }
`;

function GestureGame() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentSign, setCurrentSign] = useState("?");
  const [currentLetter, setCurrentLetter] = useState("A");
  const [gameState, setGameState] = useState("welcome");
  const [holdProgress, setHoldProgress] = useState(0);
  const [net, setNet] = useState(null);
  const GE = useRef(null);
  const [isDimmed, setIsDimmed] = useState(true);
  const [flash, setFlash] = useState(false);
  const [balloons, setBalloons] = useState([]);

  const correctSignStartTimeRef = useRef(null);
  const lastCorrectTimeRef = useRef(null);
  const rafIdRef = useRef(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const loadImages = async () => {
      const loadPromises = ALPHABET.map((letter) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = `/images/${letter}.png`;
        })
      );
      await Promise.all(loadPromises);
    };
    loadImages();
  }, []);

  useEffect(() => {
    const loadHandposeModel = async () => {
      const model = await handpose.load();
      setNet(model);
      GE.current = new fp.GestureEstimator(Object.values(Handsigns));
      const thumbsUp = new fp.GestureDescription("thumbs_up");
      thumbsUp.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
      thumbsUp.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 0.75);
      thumbsUp.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpLeft, 0.5);
      thumbsUp.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpRight, 0.5);
      [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky].forEach(
        (finger) => {
          thumbsUp.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
          thumbsUp.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
        }
      );
      GE.current.addGesture(thumbsUp);
    };
    loadHandposeModel();
  }, []);

  const handleSignDetection = useCallback(
    (detectedSign) => {
      if (isTransitioningRef.current) return;
      const now = Date.now();
      const isCorrectSign = detectedSign.toLowerCase() === currentLetter.toLowerCase();
      if (isCorrectSign) {
        lastCorrectTimeRef.current = now;
        if (!correctSignStartTimeRef.current) {
          correctSignStartTimeRef.current = now;
          setHoldProgress(0);
        } else {
          const elapsedTime = now - correctSignStartTimeRef.current;
          const progress = Math.min((elapsedTime / HOLD_DURATION) * 100, 100);
          setHoldProgress(progress);
          if (progress >= 100 && !isTransitioningRef.current) {
            isTransitioningRef.current = true;
            setFlash(true);
            setCurrentSign("?");
            setHoldProgress(0);
            correctSignStartTimeRef.current = null;
            lastCorrectTimeRef.current = null;
            if (MILESTONES.includes(currentLetter)) {
              const newBalloons = Array.from({ length: 20 }).map(() => ({
                id: Math.random().toString(36).substr(2, 9),
                left: Math.random() * 100,
                delay: Math.random() * 2,
              }));
              setBalloons(newBalloons);
              setTimeout(() => setBalloons([]), 5000);
            }
            setTimeout(() => {
              const nextIndex = ALPHABET.indexOf(currentLetter) + 1;
              if (nextIndex < ALPHABET.length) {
                setCurrentLetter(ALPHABET[nextIndex]);
              } else {
                setGameState("finished");
              }
              setTimeout(() => {
                isTransitioningRef.current = false;
              }, 200);
            }, TRANSITION_DELAY);
            setTimeout(() => setFlash(false), 500);
          }
        }
      } else {
        const timeSinceLastCorrect = lastCorrectTimeRef.current
          ? now - lastCorrectTimeRef.current
          : Infinity;
        if (timeSinceLastCorrect > JITTER_THRESHOLD) {
          correctSignStartTimeRef.current = null;
          lastCorrectTimeRef.current = null;
          setHoldProgress(0);
        }
      }
    },
    [currentLetter]
  );

  const detect = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      net &&
      canvasRef.current &&
      !isTransitioningRef.current
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, videoWidth, videoHeight);
      ctx.save();
      ctx.scale(-1, 1);
      if (isDimmed) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, videoWidth, videoHeight);
      }
      const hand = await net.estimateHands(video);
      if (hand.length > 0) {
        const estimatedGestures = await GE.current.estimate(hand[0].landmarks, 7.5);
        if (estimatedGestures.gestures && estimatedGestures.gestures.length > 0) {
          const maxConfidence = estimatedGestures.gestures
            .map((p) => p.confidence)
            .indexOf(Math.max(...estimatedGestures.gestures.map((p) => p.confidence)));
          const detectedSign = estimatedGestures.gestures[maxConfidence].name;
          setCurrentSign(detectedSign);
          handleSignDetection(detectedSign);
          if (gameState === "welcome" && detectedSign === "thumbs_up") {
            setGameState("playing");
          }
        } else {
          const now = Date.now();
          const timeSinceLastCorrect = lastCorrectTimeRef.current
            ? now - lastCorrectTimeRef.current
            : Infinity;
          if (timeSinceLastCorrect > JITTER_THRESHOLD) {
            setCurrentSign("?");
            if (!isTransitioningRef.current) {
              correctSignStartTimeRef.current = null;
              lastCorrectTimeRef.current = null;
              setHoldProgress(0);
            }
          }
        }
        drawHand(hand, ctx);
      } else {
        const now = Date.now();
        const timeSinceLastCorrect = lastCorrectTimeRef.current
          ? now - lastCorrectTimeRef.current
          : Infinity;
        if (timeSinceLastCorrect > JITTER_THRESHOLD) {
          setCurrentSign("?");
          if (!isTransitioningRef.current) {
            correctSignStartTimeRef.current = null;
            lastCorrectTimeRef.current = null;
            setHoldProgress(0);
          }
        }
      }
      ctx.restore();
    }
    rafIdRef.current = requestAnimationFrame(detect);
  }, [net, isDimmed, handleSignDetection, gameState, GE]);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(detect);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (webcamRef.current && webcamRef.current.video) {
        webcamRef.current.video.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [detect]);

  const restartGame = useCallback(() => {
    isTransitioningRef.current = false;
    setGameState("welcome");
    setCurrentLetter("A");
    setHoldProgress(0);
    correctSignStartTimeRef.current = null;
    lastCorrectTimeRef.current = null;
    setFlash(false);
    setBalloons([]);
  }, []);

  return (
    <>
      <Metatags />
      <Global
        styles={`
          @keyframes flash {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes dropBalloon {
            0% { transform: translateY(-100px); opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes sway {
            0% { transform: translateX(0px); }
            50% { transform: translateX(20px); }
            100% { transform: translateX(0px); }
          }
        `}
      />
      <Box
        position="absolute"
        width="1px"
        height="1px"
        overflow="hidden"
        opacity="0"
        pointerEvents="none"
      >
        {ALPHABET.map((letter) => (
          <Image
            key={letter}
            src={`/images/${letter}.png`}
            alt={`Preload ${letter}`}
            width="1px"
            height="1px"
          />
        ))}
        <Image src="/images/thumbs_up.png" alt="Preload Thumbs Up" width="1px" height="1px" />
      </Box>
      <Box bg="black" color="white" minHeight="100vh" width="100vw" overflow="hidden" position="relative" fontSize="sm">
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="white"
          opacity={flash ? 1 : 0}
          pointerEvents="none"
          zIndex="1000"
          animation={flash ? "flash 0.5s ease-out forwards" : "none"}
        />
        {balloons.map((balloon) => (
          <Box
            key={balloon.id}
            position="fixed"
            top="-100px"
            left={`${balloon.left}%`}
            width="40px"
            height="60px"
            bgGradient="linear(to-b, pink.300, pink.500)"
            borderRadius="full  full 0 0"
            zIndex="999"
            animation={`${dropBalloon} 5s linear forwards, ${sway} 3s ease-in-out infinite`}
            animationDelay={`${balloon.delay}s`}
          >
            <Box position="absolute" bottom="-10px" left="50%" transform="translateX(-50%)" width="2px" height="20px" bg="gray.500" />
          </Box>
        ))}
        <Box position="fixed" top="0" left="0" width="100%" height="100%" zIndex="0" overflow="hidden">
          <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
            }}
            videoConstraints={{ facingMode: "user" }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
            }}
          />
        </Box>
        <Box position="absolute" top="0" left="0" width="100%" zIndex="1" p={4}>
          {gameState === "welcome" && (
            <VStack spacing={4} align="center" justify="center" minH="100vh">
              <Box bg="rgba(0, 0, 0, 0.8)" p={6} borderRadius="md" textAlign="center" boxShadow="lg">
                <Heading as="h1" size="lg" mb={4}>
                  Welcome to ASL Gesture Game
                </Heading>
                <Text fontSize="md" mb={4}>
                  Please perform a <strong>thumbs up</strong> gesture to start.
                </Text>
                <Box display="flex" justifyContent="center" alignItems="center" height="150px">
                  <Image src="/images/thumbs_up.png" alt="Thumbs Up Gesture" objectFit="contain" maxHeight="100%" />
                </Box>
              </Box>
            </VStack>
          )}
          {gameState === "playing" && (
            <VStack spacing={4} align="stretch">
              <Grid templateColumns={["1fr", "1fr 2fr"]} gap={4}>
                <GridItem h="full">
                  <Box border="1px solid" borderColor="white" bg="rgba(0, 0, 0, 0.9)" p={4} display="flex" alignItems="center" position="relative" h="full" borderRadius="md">
                    <Tooltip label={`ASL sign for ${currentLetter}`} placement="top-start" fontSize="xs" aria-label={`ASL sign for ${currentLetter}`}>
                      <Box position="absolute" top={2} left={2} cursor="pointer">
                        <Info size={14} color="white" />
                      </Box>
                    </Tooltip>
                    <Tooltip label={isDimmed ? "Brighten Video" : "Dim Video"} placement="top-start" fontSize="xs" aria-label={isDimmed ? "Brighten Video" : "Dim Video"}>
                      <Box position="absolute" top={2} right={2} cursor="pointer" onClick={() => setIsDimmed(!isDimmed)}>
                        {isDimmed ? <Sun size={14} color="white" /> : <Moon size={14} color="white" />}
                      </Box>
                    </Tooltip>
                    <Flex alignItems="center" w="100%" position="relative" justifyContent="center" height="100px">
                      {ALPHABET.map((letter) => (
                        <Image
                          key={letter}
                          src={`/images/${letter}.png`}
                          alt={`Hand sign for ${letter}`}
                          objectFit="contain"
                          position="absolute"
                          top="0"
                          left="0"
                          opacity={currentLetter === letter ? 1 : 0}
                          transition="opacity 0.3s ease-in-out"
                          style={{ transformOrigin: "center center" }}
                          maxHeight="60px"
                        />
                      ))}
                    </Flex>
                  </Box>
                </GridItem>
                <GridItem h="full">
                  <Box bg="rgba(0, 0, 0, 0.9)" border="1px solid" borderColor="white" p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center" h="full" borderRadius="md">
                    <Text fontSize="xs" mb={2} textAlign="center" color="white">
                      {signDescriptions[currentLetter]}
                    </Text>
                    <Text
                      fontSize="4xl"
                      fontWeight="bold"
                      textAlign="center"
                      mb={3}
                      transition="transform 0.2s ease-in-out"
                      transform={`scale(${1 + (holdProgress / 100) * 2})`}
                      style={{ transformOrigin: "center center" }}
                      aria-label={`Detected sign: ${currentSign.toUpperCase()}`}
                    >
                      {currentSign.toUpperCase()}
                    </Text>
                    <Box w="100%" bg="gray.800" overflow="hidden" position="relative" borderRadius="md">
                      <Progress
                        value={holdProgress}
                        colorScheme="green"
                        height="4px"
                        transition="all 0.2s ease-in-out"
                        sx={{
                          "& > div:first-child": {
                            transitionProperty: "width",
                            background: holdProgress === 100 ? "linear-gradient(90deg, #68D391 0%, #9AE6B4 50%, #68D391 100%)" : undefined,
                            backgroundSize: "200% 100%",
                            animation: holdProgress === 100 ? "progressPulse 1s ease-in-out infinite" : "none",
                          },
                          "@keyframes progressPulse": {
                            "0%": { backgroundPosition: "100% 0" },
                            "100%": { backgroundPosition: "-100% 0" },
                          },
                        }}
                      />
                      {holdProgress === 100 && (
                        <Box
                          position="absolute"
                          top="0"
                          left="0"
                          right="0"
                          bottom="0"
                          animation="progressFlash 0.5s ease-out"
                          sx={{
                            "@keyframes progressFlash": {
                              "0%": { backgroundColor: "rgba(255, 255, 255, 0.8)", boxShadow: "0 0 20px #68D391" },
                              "100%": { backgroundColor: "rgba(255, 255, 255, 0)", boxShadow: "0 0 0px #68D391" },
                            },
                          }}
                        />
                      )}
                    </Box>
                    <Flex alignItems="center" mt={2}>
                      <Text fontSize="xs" mr={1} color="gray.300">
                        Hold the correct sign
                      </Text>
                      <Tooltip label="Hold the sign for 2 seconds to proceed" hasArrow fontSize="xs">
                        <span>
                          <Info size={12} color="gray.300" />
                        </span>
                      </Tooltip>
                    </Flex>
                  </Box>
                </GridItem>
              </Grid>
            </VStack>
          )}
          {gameState === "finished" && (
            <VStack spacing={3} bg="rgba(0, 0, 0, 0.9)" p={4} border="1px solid" borderColor="white" borderRadius="md" align="center" justify="center" minH="100vh">
              <Heading as="h2" size="md" color="white">
                Congratulations!
              </Heading>
              <Text fontSize="sm" color="gray.300">
                You've learned all the letters!
              </Text>
              <Button onClick={restartGame} colorScheme="green" size="md" mt={4}>
                Start Over
              </Button>
            </VStack>
          )}
        </Box>
      </Box>
    </>
  );
}

export default GestureGame;
