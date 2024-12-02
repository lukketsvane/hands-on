import React, { useRef, useState, useEffect, useCallback } from "react";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "../components/handposeutil";
import * as fp from "fingerpose";
import Handsigns from "../components/handsigns"
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
import { Info, Sun, Moon } from 'lucide-react';
import Metatags from "../components/metatags";
import signDescriptions from "../components/signDescriptions.json";
import '@tensorflow/tfjs-backend-webgl';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const HOLD_DURATION = 2000; // 2 seconds in milliseconds
const JITTER_THRESHOLD = 300; // 300ms threshold for ignoring brief interruptions
const TRANSITION_DELAY = 500; // 500ms delay between letters

function GestureGame() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentSign, setCurrentSign] = useState("?");
  const [currentLetter, setCurrentLetter] = useState("A");
  const [gameState, setGameState] = useState("playing");
  const [holdProgress, setHoldProgress] = useState(0);
  const [net, setNet] = useState(null);
  const GE = useRef(null);
  const [isDimmed, setIsDimmed] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  
  const correctSignStartTimeRef = useRef(null);
  const lastCorrectTimeRef = useRef(null);
  const rafIdRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Preload images on mount
  useEffect(() => {
    const loadImages = async () => {
      const loadPromises = ALPHABET.map((letter) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = `/images/${letter}.png`;
        });
      });

      try {
        await Promise.all(loadPromises);
        setImagesPreloaded(true);
        console.log("All sign images preloaded successfully");
      } catch (error) {
        console.error("Error preloading images:", error);
        setImagesPreloaded(true); // Continue anyway to not block the app
      }
    };

    loadImages();
  }, []);

  // Load handpose model
  useEffect(() => {
    const loadHandposeModel = async () => {
      const model = await handpose.load();
      setNet(model);
      console.log("Handpose model loaded.");
      const knownGestures = Object.values(Handsigns);
      GE.current = new fp.GestureEstimator(knownGestures);
    };

    loadHandposeModel();
  }, []);

  // Handle sign detection with jitter protection
  const handleSignDetection = useCallback((detectedSign) => {
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
          
          // Reset current state
          setCurrentSign("?");
          setHoldProgress(0);
          correctSignStartTimeRef.current = null;
          lastCorrectTimeRef.current = null;

          // Delay the transition to next letter
          setTimeout(() => {
            const nextIndex = ALPHABET.indexOf(currentLetter) + 1;
            if (nextIndex < ALPHABET.length) {
              setCurrentLetter(ALPHABET[nextIndex]);
            } else {
              setGameState("finished");
            }
            
            // Allow new detections after a brief pause
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 200);
          }, TRANSITION_DELAY);
        }
      }
    } else {
      // Only reset if we've exceeded the jitter threshold
      const timeSinceLastCorrect = lastCorrectTimeRef.current ? now - lastCorrectTimeRef.current : Infinity;
      
      if (timeSinceLastCorrect > JITTER_THRESHOLD) {
        correctSignStartTimeRef.current = null;
        lastCorrectTimeRef.current = null;
        setHoldProgress(0);
      }
    }
  }, [currentLetter]);

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

      // Calculate the scaling factor to fit the video within the canvas
      const scale = Math.min(
        canvasRef.current.width / videoWidth,
        canvasRef.current.height / videoHeight
      );
      const scaledWidth = videoWidth * scale;
      const scaledHeight = videoHeight * scale;

      // Center the video on the canvas
      const offsetX = (canvasRef.current.width - scaledWidth) / 2;
      const offsetY = (canvasRef.current.height - scaledHeight) / 2;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      if (isDimmed) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, videoWidth, videoHeight);
      }

      const hand = await net.estimateHands(video);

      if (hand.length > 0) {
        const estimatedGestures = await GE.current.estimate(hand[0].landmarks, 7.5);

        if (estimatedGestures.gestures && estimatedGestures.gestures.length > 0) {
          const confidence = estimatedGestures.gestures.map(
            (p) => p.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );

          if (!isTransitioningRef.current) {
            const detectedSign = estimatedGestures.gestures[maxConfidence].name;
            setCurrentSign(detectedSign);
            handleSignDetection(detectedSign);
          }
        } else {
          // Only handle as no sign if we haven't seen a correct sign recently
          const now = Date.now();
          const timeSinceLastCorrect = lastCorrectTimeRef.current ? now - lastCorrectTimeRef.current : Infinity;
          
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
        // Same jitter protection for when hand disappears
        const now = Date.now();
        const timeSinceLastCorrect = lastCorrectTimeRef.current ? now - lastCorrectTimeRef.current : Infinity;
        
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
  }, [net, isDimmed, handleSignDetection]);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(detect);
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [detect]);

  const restartGame = useCallback(() => {
    isTransitioningRef.current = false;
    setGameState("playing");
    setCurrentLetter("A");
    setHoldProgress(0);
    correctSignStartTimeRef.current = null;
    lastCorrectTimeRef.current = null;
  }, []);

  return (
    <>
      <Metatags />
      {/* Hidden preload container */}
      <Box position="absolute" width="1px" height="1px" overflow="hidden" opacity="0" pointerEvents="none">
        {ALPHABET.map((letter) => (
          <Image
            key={letter}
            src={`/images/${letter}.png`}
            alt={`Preload ${letter}`}
            width="1px"
            height="1px"
          />
        ))}
      </Box>

      <Box
        bg="black"
        color="white"
        minHeight="100vh"
        width="100vw"
        overflow="hidden"
        position="relative"
        fontSize="sm"
      >
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          zIndex="0"
          overflow="hidden"
        >
          <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: "scaleX(-1)",
            }}
            videoConstraints={{
              facingMode: "user",
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: "scaleX(-1)",
            }}
          />
        </Box>

        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          zIndex="1"
          p={4}
        >
          {gameState === "playing" && (
            <VStack spacing={4} align="stretch">
              <Grid templateColumns={["1fr", "1fr 2fr"]} gap={4}>
                <GridItem h="full">
                  <Box
                    border="1px solid"
                    borderColor="white"
                    bg="rgba(0, 0, 0, 0.9)"
                    p={4}
                    display="flex"
                    alignItems="center"
                    position="relative"
                    h="full"
                  >
                    <Tooltip
                      label={`This is the ASL sign for the letter ${currentLetter}`}
                      placement="top-start"
                      fontSize="xs"
                    >
                      <Box position="absolute" top={2} left={2} cursor="pointer">
                        <Info size={14} color="white" />
                      </Box>
                    </Tooltip>
                    <Tooltip
                      label={isDimmed ? "Brighten Video" : "Dim Video"}
                      placement="top-start"
                      fontSize="xs"
                    >
                      <Box
                        position="absolute"
                        top={2}
                        right={2}
                        cursor="pointer"
                        onClick={() => setIsDimmed(!isDimmed)}
                      >
                        {isDimmed ? (
                          <Sun size={14} color="white" />
                        ) : (
                          <Moon size={14} color="white" />
                        )}
                      </Box>
                    </Tooltip>
                    <Flex alignItems="center" w="100%" position="relative">
                      {ALPHABET.map((letter) => (
                        <Image
                          key={letter}
                          src={`/images/${letter}.png`}
                          alt={`Hand sign for ${letter}`}
                          maxH="150px"
                          objectFit="contain"
                          flex="2"
                          position="absolute"
                          top="0"
                          left="0"
                          opacity={currentLetter === letter ? 1 : 0}
                          transition="opacity 0.3s ease-in-out"
                        />
                      ))}
                    </Flex>
                  </Box>
                </GridItem>
                <GridItem h="full">
                  <Box
                    bg="rgba(0, 0, 0, 0.9)"
                    border="1px solid"
                    borderColor="white"
                    p={4}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    h="full"
                  >
                    <Text
                      fontSize="xs"
                      mb={2}
                      textAlign="center"
                      color="white"
                    >
                      {signDescriptions[currentLetter]}
                    </Text>
                    <Text
                      fontSize="4xl"
                      fontWeight="bold"
                      textAlign="center"
                      mb={3}
                    >
                      {currentSign.toUpperCase()}
                    </Text>
                    <Box w="100%" bg="gray.800" overflow="hidden">
                      <Progress
                        value={holdProgress}
                        colorScheme="green"
                        height="4px"
                        transition="all 0.2s ease-in-out"
                        sx={{
                          '& > div:first-child': {
                            transitionProperty: 'width',
                          },
                        }}
                      />
                    </Box>
                    <Flex alignItems="center" mt={2}>
                      <Text fontSize="xs" mr={1} color="gray.300">
                        Hold the correct sign
                      </Text>
                      <Tooltip
                        label="Hold the sign for 2 seconds to proceed"
                        hasArrow
                        fontSize="xs"
                      >
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
            <VStack
              spacing={3}
              bg="rgba(0, 0, 0, 0.9)"
              p={4}
              border="1px solid"
              borderColor="white"
            >
              <Heading as="h2" size="md" color="white">
                Congratulations!
              </Heading>
              <Text fontSize="sm" color="gray.300">
                You've learned all the letters!
              </Text>
              <Button
                onClick={restartGame}
                colorScheme="whiteAlpha"
                size="sm"
                mt={2}
              >
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