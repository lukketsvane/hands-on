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
import { Sun, Moon } from 'lucide-react'
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
  const [isDimmed, setIsDimmed] = useState(true)
  const [flash, setFlash] = useState(false)
  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: "user"
  });

  const GE = useRef<GestureEstimator | null>(null)
  const correctSignStart = useRef<number | null>(null)
  const lastCorrectTime = useRef<number | null>(null)
  const isTransitioning = useRef(false)

  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await handpose.load();
        setNet(model);
        GE.current = new GestureEstimator(Object.values(Handsigns));
        console.log("Handpose model loaded.");
      } catch (error) {
        console.error("Error loading Handpose model:", error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    setVideoConstraints({
      width: { ideal: window.innerWidth },
      height: { ideal: window.innerHeight },
      facingMode: "user"
    });
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
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, videoWidth, videoHeight);
      
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      
      if (isDimmed) {
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(0, 0, videoWidth, videoHeight);
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
          drawHand(hands, ctx);
        }
      } catch (error) {
        console.error("Error during hand estimation:", error);
      }

      ctx.restore();
    }
    requestAnimationFrame(detect);
  }, [net, isDimmed, handleSignDetection]);

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
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <Webcam
          ref={webcamRef}
          mirrored
          audio={false}
          videoConstraints={videoConstraints}
          className={`absolute w-full h-full object-cover ${isDimmed ? 'invisible' : ''}`}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
      <div className="absolute inset-x-0 top-0 z-10">
        {gameState === "playing" ? (
          <Card className="m-4 bg-background/80 backdrop-blur-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-6">
                <img
                  src={`/images/asl_${currentLetter}.png`}
                  alt={`Sign for letter ${currentLetter}`}
                  className="w-48 h-48 object-contain bg-foreground"
                />
                <div>
                  <h2 className="text-6xl font-bold mb-2">{currentLetter}</h2>
                  <p className="text-xl text-muted-foreground">
                    {signDescriptions[currentLetter as keyof typeof signDescriptions]}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-8xl font-bold mb-4">{currentSign}</span>
                <Progress value={holdProgress} className="w-64 h-3" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="m-4 bg-background/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center p-6">
              <h2 className="text-5xl font-bold mb-4">Congratulations!</h2>
              <p className="text-2xl text-center mb-6">
                You've learned all the letters in the alphabet!
              </p>
              <Button onClick={restartGame} className="text-xl px-8 py-4">Start Over</Button>
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
              className="absolute top-4 right-4 z-20 bg-background/50 hover:bg-background/70"
              onClick={() => setIsDimmed(!isDimmed)}
            >
              {isDimmed ? <Moon className="h-8 w-8" /> : <Sun className="h-8 w-8" />}
              <span className="sr-only">{isDimmed ? 'Show video feed' : 'Hide video feed'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isDimmed ? 'Show video feed' : 'Hide video feed'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {flash && (
        <div className="absolute inset-0 bg-green-500 opacity-50 animate-flash" />
      )}
    </div>
  )
}

export default GestureGame

