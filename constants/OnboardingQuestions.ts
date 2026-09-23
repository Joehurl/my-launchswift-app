export interface OnboardingOption {
  id: string;
  emoji: string;
  label: string;
}

export interface OnboardingQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: OnboardingOption[];
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "goal",
    title: "What's your main goal?",
    subtitle: "We'll tailor LaunchSwift to help you get there faster",
    options: [
      { id: "first_app", emoji: "🚀", label: "Submit my first app" },
      { id: "faster", emoji: "⚡", label: "Speed up my submission process" },
      { id: "approval", emoji: "✅", label: "Get approved without rejections" },
      { id: "testflight", emoji: "🧪", label: "Set up TestFlight beta testing" },
      { id: "iap", emoji: "💰", label: "Add subscriptions & in-app purchases" },
    ],
  },
  {
    id: "experience",
    title: "How many apps have you submitted?",
    subtitle: "We'll adjust the guidance to match your experience level",
    options: [
      { id: "none", emoji: "👋", label: "This is my first app" },
      { id: "one", emoji: "🌱", label: "I've submitted 1–2 apps" },
      { id: "few", emoji: "📱", label: "I've submitted 3–10 apps" },
      { id: "many", emoji: "🏆", label: "I'm a seasoned developer" },
    ],
  },
  {
    id: "challenge",
    title: "What's your biggest challenge?",
    subtitle: "LaunchSwift's AI will focus on what matters most to you",
    options: [
      { id: "metadata", emoji: "✍️", label: "Writing great metadata & keywords" },
      { id: "screenshots", emoji: "🖼️", label: "Creating compelling screenshots" },
      { id: "rejection", emoji: "😤", label: "Dealing with App Review rejections" },
      { id: "iac", emoji: "🛒", label: "Configuring in-app purchases" },
      { id: "process", emoji: "🗺️", label: "Understanding the whole process" },
    ],
  },
  {
    id: "platform",
    title: "Which platforms are you targeting?",
    subtitle: "We'll show the right screenshot sizes and requirements",
    options: [
      { id: "ios_only", emoji: "🍎", label: "iOS only" },
      { id: "ios_ipad", emoji: "📱", label: "iPhone + iPad" },
      { id: "both", emoji: "🤖", label: "iOS + Android" },
      { id: "not_sure", emoji: "🤔", label: "Not sure yet" },
    ],
  },
  {
    id: "timeline",
    title: "When do you want to launch?",
    subtitle: "We'll help you prioritize the most critical steps first",
    options: [
      { id: "asap", emoji: "🔥", label: "As soon as possible" },
      { id: "weeks", emoji: "📅", label: "Within a few weeks" },
      { id: "month", emoji: "🗓️", label: "Within a month or two" },
      { id: "exploring", emoji: "🔭", label: "Just exploring for now" },
    ],
  },
];
