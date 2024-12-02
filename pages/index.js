import React, { useRef, useState, useEffect } from "react";
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

function GestureGame() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentSign, setCurrentSign] = useState("?");
  const [currentLetter, setCurrentLetter] = useState("A");
  const [gameState, setGameState] = useState("playing");
  const [holdProgress, setHoldProgress] = useState(0);
  const [net, setNet] = useState(null);
  const GE = useRef(null);
  const [correctSignStartTime, setCorrectSignStartTime] = useState(null);
  const [isDimmed, setIsDimmed] = useState(true);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

  useEffect(() => {
    let animationFrameId;

    const detect = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video.readyState === 4 &&
        net
      ) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const hand = await net.estimateHands(video);

        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        
        // Apply dimming effect
        if (isDimmed) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(0, 0, videoWidth, videoHeight);
        }

        if (hand.length > 0) {
          const estimatedGestures = await GE.current.estimate(
            hand[0].landmarks,
            7.5
          );

          if (
            estimatedGestures.gestures &&
            estimatedGestures.gestures.length > 0
          ) {
            const confidence = estimatedGestures.gestures.map(
              (p) => p.confidence || p.score
            );
            const maxConfidence = confidence.indexOf(Math.max(...confidence));

            if (
              maxConfidence !== -1 &&
              estimatedGestures.gestures[maxConfidence]
            ) {
              const detectedSign =
                estimatedGestures.gestures[maxConfidence].name;
              setCurrentSign(detectedSign);

              if (gameState === "playing") {
                if (detectedSign.toLowerCase() === currentLetter.toLowerCase()) {
                  if (!correctSignStartTime) {
                    setCorrectSignStartTime(Date.now());
                    setHoldProgress(0);
                  } else {
                    const elapsedTime = Date.now() - correctSignStartTime;
                    const progress = Math.min((elapsedTime / 2000) * 100, 100);
                    setHoldProgress(progress);
                    if (progress >= 100) {
                      const nextIndex = alphabet.indexOf(currentLetter) + 1;
                      if (nextIndex < alphabet.length) {
                        setCurrentLetter(alphabet[nextIndex]);
                      } else {
                        setGameState("finished");
                      }
                      setCorrectSignStartTime(null);
                      setHoldProgress(0);
                    }
                  }
                } else {
                  setCorrectSignStartTime(null);
                  setHoldProgress(0);
                }
              }
            } else {
              setCurrentSign("?");
              setCorrectSignStartTime(null);
              setHoldProgress(0);
            }
          } else {
            setCurrentSign("?");
            setCorrectSignStartTime(null);
            setHoldProgress(0);
          }

          drawHand(hand, ctx);
        } else {
          setCurrentSign("?");
          setCorrectSignStartTime(null);
          setHoldProgress(0);
        }
      }

      animationFrameId = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [net, gameState, currentLetter, isDimmed, correctSignStartTime]);

  const restartGame = () => {
    setGameState("playing");
    setCurrentLetter("A");
    setHoldProgress(0);
    setCorrectSignStartTime(null);
  };

  return (
    <>
      <Metatags />
      <Box
        bg="black"
        color="white"
        minHeight="100vh"
        width="100vw"
        overflow="hidden"
        position="relative"
        fontSize="sm"
      >
        {/* Video Stream */}
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
              objectFit: "cover",
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
              transform: "scaleX(-1)",
            }}
          />
        </Box>

        {/* Components Overlaid on Top */}
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
                    <Flex alignItems="center" w="100%">
                      <Image
                        src={`/images/${currentLetter}.png`}
                        alt={`Hand sign for ${currentLetter}`}
                        maxH="150px"
                        objectFit="contain"
                        flex="2"
                      />

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
                    <Box w="100%" bg="gray.800">
                      <Progress
                        value={holdProgress}
                        colorScheme="whiteAlpha"
                        height="4px"
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

