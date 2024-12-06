'use client'

import React, { useRef, useState, useEffect, useCallback } from "react"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { GestureEstimator } from "fingerpose"
import { drawHand } from "@/lib/handposeutil"
import Handsigns from "@/components/handsigns"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Video, Hand, EyeOff } from 'lucide-react'
import signDescriptions from "@/components/signDescriptions"
import "@tensorflow/tfjs-backend-webgl"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const HOLD_DURATION = 2000 // 2 seconds
const JITTER_THRESHOLD = 300 // 300ms
const TRANSITION_DELAY = 500 // 500ms

const GestureGame: React.FC = () => {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentLetter, setCurrentLetter] = useState("A")
  const [currentSign, setCurrentSign] = useState("?")
  const [gameState, setGameState] = useState<"playing" | "finished">("playing")
  const [holdProgress, setHoldProgress] = useState(0)
  const [net, setNet] = useState<handpose.HandPose | null>(null)
  const [displayMode, setDisplayMode] = useState<'full' | 'skeleton' | 'dimmed'>('dimmed')
  const [flash, setFlash] = useState(false)
  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  });
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added error state

  const GE = useRef<GestureEstimator | null>(null)
  const correctSignStart = useRef<number | null>(null)
  const lastCorrectTime = useRef<number | null>(null)
  const isTransitioning = useRef(false)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVideoConstraints({
        facingMode: "user",
        width: { ideal: window.innerWidth },
        height: { ideal: window.innerHeight },
      });
    }
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await handpose.load();
        setNet(model);
        GE.current = new GestureEstimator(Object.values(Handsigns));
        console.log("Handpose model loaded.");
      } catch (error) {
        console.error("Error loading Handpose model:", error);
        setError("Failed to load the hand detection model. Please try again later."); // Updated error handling
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setVideoConstraints({
          facingMode: "user",
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight },
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSignDetection = useCallback(
    (sign: string) => {
      if (isTransitioning.current) return
      const now = Date.now()
      const isCorrect = sign.toLowerCase() === currentLetter.toLowerCase()

      if (isCorrect) {
        lastCorrectTime.current = now
        if (!correctSignStart.current) {
          correctSignStart.current = now
          setHoldProgress(0)
        } else {
          const elapsed = now - correctSignStart.current
          const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100)
          setHoldProgress(progress)
          if (progress >= 100) {
            isTransitioning.current = true
            setFlash(true)
            setCurrentSign("?")
            setHoldProgress(0)
            correctSignStart.current = null
            lastCorrectTime.current = null

            setTimeout(() => {
              const nextIdx = ALPHABET.indexOf(currentLetter) + 1
              if (nextIdx < ALPHABET.length) {
                setCurrentLetter(ALPHABET[nextIdx])
              } else {
                setGameState("finished")
              }
              setTimeout(() => {
                isTransitioning.current = false
              }, 200)
            }, TRANSITION_DELAY)

            setTimeout(() => setFlash(false), 500)
          }
        }
      } else {
        if (now - (lastCorrectTime.current || 0) > JITTER_THRESHOLD) {
          correctSignStart.current = null
          lastCorrectTime.current = null
          setHoldProgress(0)
        }
      }
    },
    [currentLetter]
  );

  const detect = useCallback(async () => {
    if (
      webcamRef.current?.video?.readyState === 4 &&
      net &&
      canvasRef.current &&
      !isTransitioning.current
    ) {
      const video = webcamRef.current.video;
      const { videoWidth, videoHeight } = video;
      const canvasWidth = window.innerWidth;
      const canvasHeight = (canvasWidth / videoWidth) * videoHeight;
      canvasRef.current.width = canvasWidth;
      canvasRef.current.height = canvasHeight;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        setError("Failed to get canvas context. Please refresh the page."); // Updated error handling
        return;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvasWidth, 0);

      if (displayMode === 'full') {
        ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
      }

      if (displayMode === 'dimmed') {
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      try {
        const hands = await net.estimateHands(video);
        if (hands.length > 0) {
          const result = await GE.current!.estimate(hands[0].landmarks, 7.5);
          if (result.gestures.length > 0) {
            const gesture = result.gestures.reduce((p, c) => 
              p.score > c.score ? p : c
            );
            setCurrentSign(gesture.name);
            handleSignDetection(gesture.name);
          } else {
            setCurrentSign("?");
          }
          if (displayMode !== 'full') {
            await drawHand(hands, ctx);
          }
        }
      } catch (error) {
        console.error("Error during hand estimation:", error);
        setError("An error occurred during hand detection. Please try again."); // Updated error handling
      }

      ctx.restore();
    }
    requestAnimationFrame(detect);
  }, [net, displayMode, handleSignDetection]);

  useEffect(() => {
    const animationId = requestAnimationFrame(detect)
    return () => cancelAnimationFrame(animationId)
  }, [detect])

  const restartGame = () => {
    isTransitioning.current = false
    setGameState("playing")
    setCurrentLetter("A")
    setHoldProgress(0)
    correctSignStart.current = null
    lastCorrectTime.current = null
    setFlash(false)
    setError(null); // Reset error on restart
  }

  const cycleDisplayMode = () => {
    setDisplayMode(current => {
      switch (current) {
        case 'full': return 'skeleton';
        case 'skeleton': return 'dimmed';
        case 'dimmed': return 'full';
      }
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <Webcam
        ref={webcamRef}
        mirrored
        audio={false}
        videoConstraints={videoConstraints}
        className={`absolute inset-0 w-full h-full object-cover ${displayMode !== 'full' ? 'invisible' : ''}`}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="absolute inset-x-0 top-0 z-10 p-2 sm:p-4">
        {gameState === "playing" ? (
          <Card className="bg-black/60 backdrop-blur-sm border-white/10">
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={`/images/asl_${currentLetter}.png`}
                    alt={`Sign for letter ${currentLetter}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain bg-foreground"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">{currentLetter}</h2>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                      {signDescriptions[currentLetter as keyof typeof signDescriptions]}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-end mt-2 sm:mt-0">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-bold">{currentSign}</span>
                  <Progress value={holdProgress} className="w-32 sm:w-48 h-2 mt-2 bg-white/20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-black/60 backdrop-blur-sm border-white/10">
            <CardContent className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Congratulations!</h2>
              <p className="text-lg sm:text-xl md:text-2xl mb-6">
                You've learned all the letters in the alphabet!
              </p>
              <Button onClick={restartGame} className="text-lg sm:text-xl px-6 sm:px-8 py-2 sm:py-4">Start Over</Button>
            </CardContent>
          </Card>
        )}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-4 right-4 z-20 bg-white/10 hover:bg-white/20 border-white/20"
              onClick={cycleDisplayMode}
            >
              {displayMode === 'full' ? (
                <Video className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : displayMode === 'skeleton' ? (
                <Hand className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
              <span className="sr-only">
                {displayMode === 'full' ? 'Show hand skeleton' : displayMode === 'skeleton' ? 'Hide video feed' : 'Show full video'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{displayMode === 'full' ? 'Show hand skeleton' : displayMode === 'skeleton' ? 'Hide video feed' : 'Show full video'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {flash && (
        <div className="absolute inset-0 bg-white opacity-50 animate-flash" />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md mx-4">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="text-sm">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default GestureGame

