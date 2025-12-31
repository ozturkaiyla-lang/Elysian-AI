
export enum SessionMode {
  FAST = 'FAST',
  DEEP = 'DEEP',
  VOICE = 'VOICE'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: string;
  isAudio?: boolean;
}

export interface AdviceCategory {
  title: string;
  icon: string;
  description: string;
  prompt: string;
}

export interface UserProfile {
  name?: string;
  context?: string;
  mainFocus?: string;
}
