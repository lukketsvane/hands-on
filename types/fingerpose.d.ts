declare module 'fingerpose' {
    export class GestureEstimator {
      constructor(gestures: any[]);
      estimate(landmarks: number[][], minConfidence: number): Promise<{
        gestures: { name: string; score: number }[];
      }>;
    }
  
    export class GestureDescription {
      constructor(name: string);
      addCurl(finger: number, curl: number, confidence: number): void;
      addDirection(finger: number, direction: number, confidence: number): void;
    }
  
    export const Finger: {
      Thumb: number;
      Index: number;
      Middle: number;
      Ring: number;
      Pinky: number;
    };
  
    export const FingerCurl: {
      NoCurl: number;
      HalfCurl: number;
      FullCurl: number;
    };
  
    export const FingerDirection: {
      VerticalUp: number;
      VerticalDown: number;
      HorizontalLeft: number;
      HorizontalRight: number;
      DiagonalUpRight: number;
      DiagonalUpLeft: number;
      DiagonalDownRight: number;
      DiagonalDownLeft: number;
    };
  }
  
  