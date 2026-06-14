import type { FanMessage, LiveQueueItem, MessageTag } from "@/types";

const FAN_MESSAGE_TEMPLATES: Array<{
  sender: string;
  handle?: string;
  content: string;
  tags: MessageTag[];
}> = [
  { sender: "BeachBunny_Bex", handle: "@bexatthebeach", content: "Just binged your last 10 episodes. My productivity is destroyed and I regret nothing.", tags: ["Fan Love", "Story"] },
  { sender: "NerdAlert_Marcus", handle: "@nerd.marcus", content: "Question for you: how do you handle creative blocks? I've been stuck for weeks.", tags: ["Question", "Needs Reply"] },
  { sender: "CosmicClaire", handle: "@cosmicclaire", content: "The way you explained that concept in your last post actually made me cry a little. In a good way.", tags: ["Fan Love"] },
  { sender: "RobotDave_2087", content: "Could you do an episode on how AI is changing the creator economy? Would be really timely.", tags: ["Topic Idea"] },
  { sender: "MidnightMarcella", handle: "@midnightmar", content: "I turned my mom onto your content and now she sends me your quotes every morning lol", tags: ["Story", "Fan Love"] },
  { sender: "TechTalkToni", handle: "@techtoni_", content: "If you ever need a guest for a tech-focused episode I'm here 👀 been building in the space for 5 years.", tags: ["Collab"] },
  { sender: "NoodlesTheCat", content: "my cat is named after you (kind of). her middle name is your last name.", tags: ["Weird", "Story"] },
  { sender: "SleeplessInSeoul", handle: "@sleepless_kr", content: "It's 3am and I'm listening to your old episodes instead of sleeping. No regrets.", tags: ["Fan Love"] },
  { sender: "BuildingBrooke", handle: "@brookebuilds", content: "Topic idea: a deep dive on systems for staying creative when life gets hectic?", tags: ["Topic Idea"] },
  { sender: "PacificPete", content: "Honest question — do you ever feel like your content isn't good enough? Asking as a creator myself.", tags: ["Question", "Needs Reply"] },
  { sender: "FluffyPandaFan", content: "You're the only creator I turn off ad-blockers for. That's saying something.", tags: ["Fan Love"] },
  { sender: "DigitalNomad_Kira", handle: "@kira.nomad", content: "Saw you at the Austin conference! I was too nervous to say hi. Thank you for the hallway speech.", tags: ["Story", "Fan Love"] },
  { sender: "Anon_listener", content: "Can I pitch a collab idea? I know this is fan mail but wasn't sure where else to send it.", tags: ["Collab", "Needs Reply"] },
  { sender: "ZenGardenGuru", handle: "@zengardenguru", content: "Please do more short form. Your 3-minute episodes hit different.", tags: ["Topic Idea"] },
  { sender: "StaticNoiseAlex", content: "Listened to the whole archive in two weeks. You've genuinely changed how I think about my work.", tags: ["Fan Love", "Story"] },
  { sender: "WanderlustWes", handle: "@wesgoesnorth", content: "I've recommended you to literally everyone on my team. Three of them are now superfans.", tags: ["Fan Love"] },
  { sender: "QuietLurker_99", content: "First time messaging. Been listening for two years. Thank you for existing.", tags: ["Fan Love"] },
  { sender: "DataDrivenDana", handle: "@danadatadriven", content: "Would love an episode on how you track what's actually working for your content. Data nerd here.", tags: ["Topic Idea", "Question"] },
  { sender: "RealistRaquel", content: "The toxic positivity in the creator space is exhausting. You keep it real and I appreciate that.", tags: ["Fan Love"] },
  { sender: "BrunchWithBen", handle: "@brunchben", content: "I quoted you in a work presentation and my boss asked who you are. Now she's a subscriber too.", tags: ["Story", "Fan Love"] },
];

const LIVE_MESSAGE_TEMPLATES: Array<{ sender: string; content: string }> = [
  { sender: "StreamerSam", content: "What's the hardest lesson you've learned in your creator journey?" },
  { sender: "QuestionQueen", content: "Do you ever consider doing a paid membership or community?" },
  { sender: "NightOwlNate", content: "How do you deal with haters and negative comments?" },
  { sender: "CuriousCarla", content: "What's your favorite podcast other than your own?" },
  { sender: "EarlyBirdElla", content: "Will you ever do a video version of this?" },
  { sender: "JustJoelins", content: "What book changed your life most recently?" },
  { sender: "FanFirstFelipe", content: "How do you pick your topics each week?" },
  { sender: "QuietListenerQuin", content: "I never comment but I'm always here. Hi from Germany! 🇩🇪" },
  { sender: "PowerUserPat", content: "Would love a deep dive on monetization for sub-50k creators!" },
  { sender: "MarketingMaven_Mo", content: "Have you thought about a newsletter? I'd subscribe immediately." },
  { sender: "NewFollower_Thad", content: "Just found you today through a friend. Already hooked. What episode should I start with?" },
  { sender: "RegularRegi", content: "Are you coming to New York anytime? Would love a meetup!" },
  { sender: "AlwaysHere_Ash", content: "Do you have any other creators you collab with regularly?" },
  { sender: "FastFanFernando", content: "What's your editing process? Do you do it all yourself?" },
  { sender: "LoyalLarry", content: "Still listening from episode 1. Never missed one. Thank you for everything!" },
];

let fanMsgIndex = 0;
let liveMsgIndex = 0;

export function generateFanMessage(): Omit<FanMessage, "id"> {
  const template = FAN_MESSAGE_TEMPLATES[fanMsgIndex % FAN_MESSAGE_TEMPLATES.length];
  fanMsgIndex++;
  return {
    ...template,
    timestamp: "Just now",
    isPinned: false,
    isSaved: false,
    isVIP: false,
    isBlocked: false,
    line: "fanmail",
  };
}

export function generateLiveQueueItem(): Omit<LiveQueueItem, "id"> {
  const template = LIVE_MESSAGE_TEMPLATES[liveMsgIndex % LIVE_MESSAGE_TEMPLATES.length];
  liveMsgIndex++;
  return {
    ...template,
    timestamp: "Just now",
    isPinned: false,
    inQueue: false,
    isAnswered: false,
  };
}

export function shuffleSimulatorIndex() {
  fanMsgIndex = Math.floor(Math.random() * FAN_MESSAGE_TEMPLATES.length);
  liveMsgIndex = Math.floor(Math.random() * LIVE_MESSAGE_TEMPLATES.length);
}
