export type CreatorType =
  | "podcaster"
  | "streamer"
  | "tiktokyoutube"
  | "musician"
  | "liveseller"
  | "coach"
  | "other";

export type UseCase =
  | "live_callins"
  | "fan_questions"
  | "topic_ideas"
  | "vip_fans"
  | "collabs";

export type LineStatus =
  | "Open"
  | "Closed"
  | "Live Now"
  | "VIP Only"
  | "Collect Only"
  | "Quiet Hours";

export type MessageTag =
  | "Question"
  | "Topic Idea"
  | "Story"
  | "Fan Love"
  | "Collab"
  | "VIP"
  | "Weird"
  | "Needs Reply";

export type CollabTag = "Sponsor" | "Guest" | "Brand" | "Collab" | "Press";

export type CollabStatus = "New" | "Interested" | "Replied" | "Archived";

export type BackstageMode = "Closed" | "VIP Only" | "Quiet Hours";

export interface FanMessage {
  id: string;
  sender: string;
  handle?: string;
  content: string;
  timestamp: string;
  tags: MessageTag[];
  isPinned: boolean;
  isSaved: boolean;
  isVIP: boolean;
  isBlocked: boolean;
  reply?: string;
  line: "fanmail" | "liveline" | "backstage";
}

export interface CollabMessage {
  id: string;
  sender: string;
  company?: string;
  content: string;
  timestamp: string;
  tags: CollabTag[];
  status: CollabStatus;
  email?: string;
}

export interface LiveQueueItem {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isPinned: boolean;
  inQueue: boolean;
  isAnswered: boolean;
  isVIP?: boolean;
}

export interface VIPContact {
  id: string;
  name: string;
  handle: string;
  since: string;
  messages: number;
}

export interface BlockedContact {
  id: string;
  name: string;
  handle?: string;
  reason?: string;
  blockedAt: string;
}

export interface LineStatuses {
  fanmail: LineStatus;
  liveline: LineStatus;
  backstage: LineStatus;
  collab: LineStatus;
}

export interface AutoReplies {
  fanmail: string;
  livelineOpen: string;
  livelineClosed: string;
  backstage: string;
  collab: string;
}

export interface LiveSessionSettings {
  acceptTexts: boolean;
  acceptCallRequests: boolean;
  slowMode: boolean;
  autoReply: boolean;
  showQRCode: boolean;
}

export interface SessionRecap {
  id: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  totalMessages: number;
  messagesPinned: number;
  messagesAnswered: number;
  fansVIPAdded: number;
  contactsBlocked: number;
  topTopics: string[];
  pinnedMessages: LiveQueueItem[];
  answeredMessages: LiveQueueItem[];
}
