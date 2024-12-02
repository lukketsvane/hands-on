import React, { useRef, useState, useEffect } from "react";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "../components/handposeutil";
import * as fp from "fingerpose";
import HandSigns from "../components/handsigns";
import {
  Box,
  Text,
  Flex,
  Image,
  Progress,
  VStack,
  Button,
  Tooltip,
  Heading,
  Container,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { Info } from 'lucide-react';
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
  const [learnedLetters, setLearnedLetters] = useState([]);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const loadHandposeModel = async () => {
      const model = await handpose.load();
      setNet(model);
      console.log("Handpose model loaded.");
      const knownGestures = Object.values(HandSigns);
      GE.current = new fp.GestureEstimator(knownGestures);
    };

    loadHandposeModel();
  }, []);

  useEffect(() => {
    let animationFrameId;
  
    const detect = async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4 && net) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
  
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
  
        const hand = await net.estimateHands(video);
  
        if (hand.length > 0) {
          const estimatedGestures = await GE.current.estimate(hand[0].landmarks, 7.5);
  
          if (estimatedGestures.gestures && estimatedGestures.gestures.length > 0) {
            const confidence = estimatedGestures.gestures.map((p) => p.confidence || p.score);
            const maxConfidence = confidence.indexOf(Math.max(...confidence));
  
            if (maxConfidence !== -1 && estimatedGestures.gestures[maxConfidence]) {
              const detectedSign = estimatedGestures.gestures[maxConfidence].name;
              setCurrentSign(detectedSign);
  
              if (gameState === 'playing') {
                if (detectedSign.toLowerCase() === currentLetter.toLowerCase()) {
                  if (!correctSignStartTime) {
                    setCorrectSignStartTime(Date.now());
                    setHoldProgress(0);
                  } else {
                    const elapsedTime = Date.now() - correctSignStartTime;
                    const progress = (elapsedTime / 2000) * 100;
                    setHoldProgress(progress);
                    if (elapsedTime >= 2000) {
                      setLearnedLetters((prev) => [...prev, currentLetter]);
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
              setCurrentSign('?');
              setCorrectSignStartTime(null);
              setHoldProgress(0);
            }
          } else {
            setCurrentSign('?');
            setCorrectSignStartTime(null);
            setHoldProgress(0);
          }
  
          const ctx = canvasRef.current.getContext('2d');
          drawHand(hand, ctx);
        } else {
          setCurrentSign('?');
          setCorrectSignStartTime(null);
          setHoldProgress(0);
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
  
      animationFrameId = requestAnimationFrame(detect);
    };
  
    detect();
  
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [net, gameState, currentLetter]);
  
  const restartGame = () => {
    setGameState("playing");
    setCurrentLetter("A");
    setHoldProgress(0);
    setCorrectSignStartTime(null);
    setLearnedLetters([]);
  };

  return (
    <>
      <Metatags />
      <Box bg="gray.900" color="white" minHeight="100vh" position="relative">
        <Box
          id="webcam-container"
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          zIndex="0"
        >
          <Webcam
            id="webcam"
            ref={webcamRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <canvas
            id="gesture-canvas"
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </Box>

        <Container maxW="container.xl" py={8} position="relative" zIndex="1">
          {gameState === "playing" && (
            <VStack spacing={8} align="stretch">
              <Heading as="h1" size="2xl" textAlign="center" color="brand.200">
                Learn ASL: Letter {currentLetter}
              </Heading>
              <Grid templateColumns={["1fr", "1fr", "1fr 1fr"]} gap={8}>
                <GridItem>
                  <Box
                    border="2px solid"
                    borderColor="brand.500"
                    bg="rgba(0, 0, 0, 0.8)"
                    h="full"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="lg"
                  >
                    <Tooltip label={`This is the ASL sign for the letter ${currentLetter}`} placement="top-start">
                      <Box position="absolute" top={4} left={4} cursor="pointer">
                        <Info size={24} color="#4FD1C5" />
                      </Box>
                    </Tooltip>
                    <Image
                      src={`/images/asl_${currentLetter}.png`}
                      alt={`Hand sign for ${currentLetter}`}
                      maxH="300px"
                      objectFit="contain"
                    />
                  </Box>
                </GridItem>
                <GridItem>
                  <Box
                    bg="rgba(0, 0, 0, 0.8)"
                    border="2px solid"
                    borderColor="brand.500"
                    p={6}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    h="full"
                    borderRadius="lg"
                    boxShadow="lg"
                  >
                    <Text fontSize="xl" mb={4} textAlign="center" color="brand.100">
                      {signDescriptions[currentLetter]}
                    </Text>
                    <Text fontSize="7xl" fontWeight="bold" textAlign="center" mb={6} color="brand.300">
                      {currentSign}
                    </Text>
                    <Box w="100%" bg="gray.700" borderRadius="full" overflow="hidden">
                      <Progress
                        value={holdProgress}
                        colorScheme="brand"
                        height="8px"
                      />
                    </Box>
                    <Flex alignItems="center" mt={4}>
                      <Text fontSize="sm" textAlign="center" mr={2} color="gray.300">
                        Hold the correct sign
                      </Text>
                      <Tooltip label="Hold the sign for 2 seconds to proceed" hasArrow>
                        <span>
                          <Info size={18} color="#4FD1C5" />
                        </span>
                      </Tooltip>
                    </Flex>
                  </Box>
                </GridItem>
              </Grid>
            </VStack>
          )}

          {gameState === "finished" && (
            <VStack spacing={6} bg="rgba(0, 0, 0, 0.8)" p={8} borderRadius="lg" border="2px solid" borderColor="brand.500" boxShadow="lg">
              <Heading as="h2" size="3xl" color="brand.300">
                Congratulations!
              </Heading>
              <Text fontSize="xl" color="brand.100">You've learned all the letters!</Text>
              <Button
                onClick={restartGame}
                colorScheme="brand"
                size="lg"
                mt={4}
                fontWeight="bold"
              >
                Start Over
              </Button>
            </VStack>
          )}
        </Container>
      </Box>
    </>
  );
}

export default function Home() {
  return <GestureGame />;
}

