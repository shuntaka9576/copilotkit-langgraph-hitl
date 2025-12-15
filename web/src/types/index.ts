export interface Pin {
  id: string;
  timestamp: number;
  thumbnail: string;
  note: string;
}

export interface FrameAnalysis {
  frameIndex: number;
  timestamp: string;
  tags: string[];
}

export interface AnalysisResult {
  frames: FrameAnalysis[];
  summary: string;
}
