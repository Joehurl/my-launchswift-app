// AI Chat utility — context-aware response engine for App Store submission guidance

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatContext {
  section: string;
  projectName: string;
  appCategory?: string;
  bundleId?: string;
}

// ─── Response database ────────────────────────────────────────────────────────

type ResponseEntry = { keywords: string[]; response: string };

const METADATA_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['description', 'write', 'good', 'great', 'how'],
    response: `Writing a great App Store description is one of the highest-leverage things you can do for conversion. Here's the proven structure:\n\n**Hook (first 3 lines — most important)**\nApple shows only the first 3 lines before the "more" button. Lead with your single strongest value proposition. Don't start with your app name — start with the transformation: "Turn any photo into a masterpiece in seconds."\n\n**Feature bullets (middle section)**\nUse ALL CAPS headers followed by bullet points. This is scannable and looks professional. Group features into 3–4 thematic clusters. Focus on benefits, not features: "Shoot in RAW for maximum quality" beats "RAW file support."\n\n**Social proof + CTA (closing)**\nEnd with a line of social proof if you have it ("Loved by 500,000+ photographers") and a soft call to action ("Download free and start creating today."). Keep the total under 4,000 characters, but aim for 800–1,200 for most apps.`,
  },
  {
    keywords: ['keyword', 'keywords', 'tips', 'strategy', 'research'],
    response: `Keywords are your primary ASO lever — here's how to maximize your 100 characters:\n\n**Don't repeat your title or subtitle**\nApple already indexes your app name and subtitle. Every character you spend repeating them in the keyword field is wasted. If your app is called "PhotoEdit Pro," don't put "photo" or "edit" in keywords.\n\n**Use commas, no spaces**\nFormat: "filter,retouch,camera,vintage,film" — spaces count against your 100-character limit. No spaces around commas.\n\n**Target mid-competition terms**\nHigh-volume terms like "photo editor" are dominated by Adobe and VSCO. Target specific, intent-driven terms: "film grain filter," "portrait retouch," "RAW editor iPhone." These convert better too.\n\n**Steal from competitors**\nSearch your top 3 competitors in the App Store. Look at their titles, subtitles, and in-app text. Use tools like AppFollow or Sensor Tower to see what keywords they rank for.\n\n**Rotate every 30–60 days**\nKeywords take 1–2 weeks to index. Test a set, measure installs, swap underperformers.`,
  },
  {
    keywords: ['promotional', 'promo', 'promo text', 'promotional text'],
    response: `Promotional text is the 170-character field that appears above your description. It's the only metadata field you can change without submitting a new app version — making it incredibly valuable.\n\n**Best uses:**\n• Limited-time sales: "🎉 50% off Pro — this week only!"\n• New feature announcements: "New: AI sky replacement just launched in v2.1"\n• Seasonal messaging: "Perfect for holiday photo editing"\n• Social proof: "Just hit #1 in Photo & Video — thank you!"\n\n**Key insight:** Since it doesn't require a new build, update it frequently. Many top apps change it weekly. It shows up prominently on your store page and can significantly lift conversion during promotions.`,
  },
  {
    keywords: ['long', 'length', 'how long', 'characters', 'limit'],
    response: `Your description has a 4,000 character limit, but length isn't the goal — front-loading is.\n\n**The 3-line rule:** Only the first ~255 characters (roughly 3 lines on an iPhone) are visible before the "more" tap. Most users never tap "more." Your entire value proposition must fit in those 3 lines.\n\n**Optimal length:** 800–1,500 characters for most apps. Long enough to be comprehensive, short enough to be readable. Games and complex productivity apps can go longer.\n\n**Structure that works:**\n1. Hook (3 lines, ~255 chars)\n2. Feature section with ALL CAPS headers (400–600 chars)\n3. Social proof / CTA (100–200 chars)\n\nAvoid padding. Every sentence should earn its place.`,
  },
  {
    keywords: ['subtitle', 'sub title'],
    response: `Your subtitle (30 characters max) appears directly below your app name in search results and is fully indexed for search — treat it like a second title.\n\n**Best practices:**\n• Include 1–2 high-value keywords not in your title\n• Describe the core benefit, not a feature\n• Avoid generic phrases like "The best app for..."\n\n**Examples:**\n• "Photo Editor & Filter Studio" (keyword-rich)\n• "AI-Powered Portrait Retouching" (benefit + keyword)\n• "Edit RAW Photos Like a Pro" (aspirational + keyword)\n\nThe subtitle is indexed by Apple's search algorithm, so treat every character as keyword real estate.`,
  },
];

const SCREENSHOTS_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['size', 'sizes', 'dimensions', 'pixels', 'resolution', 'what size'],
    response: `Here are the exact screenshot dimensions Apple requires:\n\n**iPhone (required):**\n• iPhone 6.9" (iPhone 16 Pro Max): 1320 × 2868 px\n• iPhone 6.5" (iPhone 14 Plus, 13 Pro Max): 1242 × 2688 px\n• iPhone 5.5" (iPhone 8 Plus): 1242 × 2208 px\n\n**iPad (required if you support iPad):**\n• iPad Pro 13": 2048 × 2732 px\n• iPad Pro 11": 1668 × 2388 px\n\n**Format:** PNG or JPEG, no alpha channel, minimum 72 DPI. Screenshots must be portrait or landscape — not both mixed for the same device size.\n\nAll screenshots must be the exact pixel dimensions listed. Apple will reject uploads that don't match.`,
  },
  {
    keywords: ['required', 'need', 'all sizes', 'which', 'mandatory'],
    response: `Here's what's actually required vs. optional:\n\n**Required (you must have at least one):**\n• iPhone 6.9" OR iPhone 6.5" — Apple accepts either for modern iPhones\n• If you support iPad: iPad Pro 13" OR iPad Pro 11"\n\n**Key shortcut:** If you upload 6.9" screenshots, Apple will use them for 6.5" devices too. You don't need both. Similarly, 13" iPad covers 11" iPad.\n\n**Optional but recommended:**\n• iPhone 5.5" — covers older devices (iPhone 8 Plus era)\n• Separate iPad screenshots if your iPad UI is significantly different\n\n**Practical advice:** Start with 6.9" iPhone screenshots. That covers 90%+ of your users. Add iPad screenshots only if your app has a meaningful iPad experience.`,
  },
  {
    keywords: ['tips', 'good', 'best', 'design', 'convert', 'conversion'],
    response: `Great screenshots are your #1 conversion driver. Here's what works:\n\n**Show the value, not just the UI**\nDon't just screenshot your app. Show the transformation. Before/after, the result of using your app, the moment of delight.\n\n**Use text overlays**\nAdd a short headline to each screenshot (2–5 words). "Edit like a pro." "One tap. Perfect skin." These dramatically increase comprehension and conversion.\n\n**First screenshot is your hero**\nIt's the only one visible in search results. Make it your absolute best. Show your core value prop immediately.\n\n**Lifestyle vs. UI**\nFor consumer apps: lifestyle imagery with UI overlay converts better than pure UI. For productivity/utility apps: clean UI with clear benefit text works best.\n\n**Consistent visual style**\nUse a consistent background color, font, and layout across all screenshots. This looks professional and builds trust.\n\n**Test with App Store A/B testing**\nApple's Product Page Optimization lets you A/B test screenshots. Use it — even small improvements compound significantly.`,
  },
  {
    keywords: ['video', 'preview', 'app preview'],
    response: `App Preview videos can significantly boost conversion — but only if done well.\n\n**Specs:**\n• 15–30 seconds maximum\n• Must show actual app UI (no live-action footage)\n• Same dimensions as screenshots for each device size\n• H.264 or HEVC codec\n\n**What works:**\n• Show the core user journey in 15 seconds\n• Add captions — most users watch without sound\n• Start with your most impressive moment (first 3 seconds matter most)\n• End with a clear value statement\n\n**What doesn't work:**\n• Slow intros or logos\n• Showing every feature (pick 2–3)\n• Poor audio quality\n\nIf you don't have a polished video, skip it. A bad App Preview hurts more than no preview.`,
  },
];

const IAP_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['consumable', 'non-consumable', 'difference', 'types', 'type'],
    response: `There are three main IAP types — here's when to use each:\n\n**Consumable**\nCan be purchased multiple times. Used up when consumed. Examples: coins, credits, lives, boosts, extra storage (temporary). Best for: games, apps with virtual currency, one-time power-ups.\n\n**Non-Consumable**\nPurchased once, owned forever. Syncs across devices via iCloud. Examples: remove ads, unlock a feature, premium themes, additional content packs. Best for: feature unlocks, permanent upgrades.\n\n**Non-Renewing Subscription**\nFixed duration, user must manually renew. Examples: 1-year access to a content library, seasonal pass. Rarely used — auto-renewing subscriptions (in the Subscriptions section) are almost always better because they retain revenue automatically.\n\n**Rule of thumb:** If it's permanent → non-consumable. If it's used up → consumable. If it's time-based → subscription.`,
  },
  {
    keywords: ['price', 'pricing', 'how much', 'tier', 'tiers'],
    response: `IAP pricing psychology is well-studied. Here's what works:\n\n**Apple's price matrix**\nApple has ~100 price tiers. Common ones: $0.99, $1.99, $2.99, $4.99, $9.99, $14.99, $19.99, $29.99, $49.99, $99.99. Prices are automatically converted to local currencies.\n\n**The $0.99 trap**\nMost developers underprice. $0.99 feels cheap and signals low value. $2.99 or $4.99 often converts nearly as well but earns 3–5x more revenue.\n\n**Anchoring**\nOffer 3 tiers: small ($0.99), medium ($4.99), large ($9.99). The middle option gets the most purchases. The expensive option makes the middle feel reasonable.\n\n**"Remove Ads" sweet spot**\n$2.99–$4.99 is the sweet spot for remove-ads IAPs. Under $1.99 feels too cheap (users wonder why you're charging). Over $7.99 gets resistance.\n\n**Consumable bundles**\nAlways offer a "best value" large bundle. Users who buy once often buy again — make the large bundle 3–4x the value of the small one.`,
  },
  {
    keywords: ['subscription group', 'group', 'groups'],
    response: `Subscription groups are how Apple organizes auto-renewing subscriptions. Here's what you need to know:\n\n**What is a subscription group?**\nA collection of subscription products that are mutually exclusive — a user can only be subscribed to one product in a group at a time. Most apps have one group (e.g., "Premium Access") with multiple durations (monthly, yearly).\n\n**Upgrade/downgrade logic**\nWithin a group, Apple handles upgrades and downgrades automatically:\n• Upgrade (e.g., monthly → yearly): Takes effect immediately, prorated credit given\n• Downgrade (yearly → monthly): Takes effect at next renewal\n• Cross-group: Users can subscribe to products in different groups simultaneously\n\n**Best practice**\nPut all your subscription tiers in one group. Use multiple groups only if you have genuinely separate subscription products (e.g., "Storage" and "Premium Features" that can be purchased independently).`,
  },
  {
    keywords: ['restore', 'restore purchases', 'restoring'],
    response: `Restore Purchases is required by Apple for all non-consumable IAPs and subscriptions. Here's what you need to know:\n\n**Apple's requirement**\nGuideline 3.1.1 requires that apps with non-consumable IAPs or subscriptions include a "Restore Purchases" button. Failing to include it is a common rejection reason.\n\n**Where to put it**\nTypically in Settings or on your paywall/upgrade screen. It doesn't need to be prominent — just accessible.\n\n**How it works**\nCalling StoreKit's restore function re-delivers all non-consumable and active subscription receipts. The user may be prompted to sign in to their Apple ID.\n\n**Testing**\nIn Sandbox, use a Sandbox Apple ID to test purchases. Restore works in Sandbox too.`,
  },
];

const TESTFLIGHT_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['how many', 'testers', 'limit', 'maximum', 'internal', 'external'],
    response: `TestFlight has two tester types with very different limits:\n\n**Internal Testers**\n• Up to 100 testers\n• Must be members of your App Store Connect team (with TestFlight role)\n• Builds available immediately — no review required\n• Great for your team, close collaborators, and QA\n\n**External Testers**\n• Up to 10,000 testers per app\n• Anyone with an email address (no App Store Connect account needed)\n• Requires a brief TestFlight review (usually 1–3 days for first build, faster for subsequent builds)\n• Can be invited via email or a public link\n\n**Practical advice:** Start with internal testers for early builds. Move to external when you're ready for broader feedback. The public link feature is great for social media beta signups.`,
  },
  {
    keywords: ['what to test', 'test notes', 'testing notes', 'write'],
    response: `"What to Test" is one of the most underutilized fields in TestFlight. Good notes dramatically improve the quality of feedback you receive.\n\n**What to include:**\n1. **Specific scenarios to test** — "Try the onboarding flow with a new account. Pay attention to the photo import step."\n2. **Known issues** — "The export button sometimes shows a spinner for 3+ seconds on older devices. This is a known issue we're working on."\n3. **Focus areas** — "We've completely redesigned the settings screen. Please test all toggles and report any unexpected behavior."\n4. **What NOT to test** — "The payment flow is not functional in this build — please don't attempt purchases."\n\n**Format tip:** Use short paragraphs or bullet points. Testers skim. The more specific you are, the more actionable feedback you'll get.`,
  },
  {
    keywords: ['review', 'how long', 'time', 'approval', 'takes'],
    response: `TestFlight review timelines:\n\n**Internal builds:** Instant — no review required. Available to internal testers immediately after processing (usually 5–15 minutes).\n\n**External builds (first submission):** 1–3 business days. Apple reviews the build for basic guideline compliance. This is less thorough than App Store review but still takes time.\n\n**External builds (subsequent submissions):** Usually 1–2 days, sometimes faster if the build is similar to a previously approved one.\n\n**Tips to speed it up:**\n• Submit early in the week (Monday/Tuesday) — Friday submissions often wait over the weekend\n• Ensure your "What to Test" notes are clear\n• Don't submit builds with obvious crashes or placeholder content\n\n**Expedited review:** Not available for TestFlight — only for App Store submissions.`,
  },
  {
    keywords: ['build', 'upload', 'submit', 'xcode', 'archive'],
    response: "Here's the TestFlight upload workflow:\n\n**From Xcode:**\n1. Set your scheme to \"Any iOS Device\"\n2. Product → Archive\n3. In the Organizer, click \"Distribute App\"\n4. Choose \"App Store Connect\" → \"Upload\"\n5. Follow the prompts (usually keep defaults)\n6. Build appears in App Store Connect within 5–30 minutes\n\n**From command line (CI/CD):**\nUse Fastlane's 'pilot' action or 'xcodebuild -exportArchive' with an ExportOptions.plist.\n\n**Version numbers:**\nEach TestFlight build needs a unique build number (CFBundleVersion). The version string (CFBundleShortVersionString) can stay the same across builds. Common pattern: increment build number automatically in CI.\n\n**Processing time:** After upload, Apple processes the build (5–30 min). You'll get an email when it's ready.",
  },
];

const AGE_RATING_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['what age', 'which rating', 'choose', 'should', 'rating'],
    response: `Age rating is calculated automatically based on your content descriptors — you don't choose it directly. Here's how the ratings map:\n\n**4+ (most apps)**\nNo objectionable content. Appropriate for all ages. Most productivity, utility, and business apps land here. If your app has no violence, sexual content, drug references, or mature themes, you'll get 4+.\n\n**9+**\nInfrequent/mild cartoon or fantasy violence, infrequent/mild mature themes. Many games and some social apps.\n\n**12+**\nFrequent/intense cartoon violence, infrequent/mild realistic violence, infrequent/mild sexual content. Most action games.\n\n**17+**\nFrequent/intense realistic violence, sexual content, gambling, or drug use. Adult content apps.\n\n**My advice:** Be honest with your descriptors. Apple reviews apps and can change your rating. A wrong rating is a rejection reason.`,
  },
  {
    keywords: ['17+', 'adult', 'mature', 'triggers'],
    response: `These content types automatically trigger a 17+ rating:\n\n• **Frequent/intense realistic violence** — graphic combat, gore\n• **Sexual content or nudity** — any frequency\n• **Gambling** — real money wagering, simulated casino games\n• **Frequent drug, alcohol, or tobacco use**\n\n**Important nuances:**\n• Cartoon violence (even frequent) only triggers 12+, not 17+\n• A dating app with no explicit content is typically 12+ or 17+ depending on features\n• Apps that allow user-generated content often get 17+ because Apple can't control what users post\n• Social networking apps with the ability to interact with strangers often get 17+\n\nIf your app is 17+, it won't appear in searches with Safe Search enabled, which can significantly reduce discoverability.`,
  },
];

const CHECKLIST_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['rejected', 'rejection', 'why', 'common', 'reasons'],
    response: `The top 5 App Store rejection reasons and how to fix them:\n\n**1. Guideline 2.1 — App Completeness**\nApp crashes, has broken features, or contains placeholder content. Fix: Test thoroughly on a real device. Remove all "coming soon" placeholders.\n\n**2. Guideline 4.0 — Design**\nApp doesn't follow iOS Human Interface Guidelines. Common issues: non-standard navigation, tiny tap targets, missing dark mode support. Fix: Review Apple's HIG before submission.\n\n**3. Guideline 5.1.1 — Privacy**\nMissing privacy policy, requesting permissions without justification, or collecting data not disclosed in the privacy nutrition label. Fix: Add a privacy policy URL, only request permissions you use, fill out the privacy questionnaire accurately.\n\n**4. Guideline 3.1.1 — In-App Purchases**\nSelling digital goods outside Apple's IAP system, or linking to external payment methods. Fix: All digital purchases must go through StoreKit.\n\n**5. Guideline 2.3 — Accurate Metadata**\nScreenshots don't match the actual app, misleading description, or wrong category. Fix: Ensure screenshots show the current version of your app.`,
  },
  {
    keywords: ['how long', 'review time', 'takes', 'wait', 'approval'],
    response: `App Store review timelines in 2024–2025:\n\n**Standard review:** 24–48 hours for 90% of submissions. Apple's dashboard shows real-time estimates.\n\n**First submission:** Can take 2–7 days. Apple is more thorough with new apps.\n\n**After rejection:** Resubmitting after addressing feedback is usually reviewed within 24 hours.\n\n**Holiday slowdowns:** Submissions around major holidays (Thanksgiving, Christmas) can take longer. Plan accordingly — don't submit a critical update on December 23rd.\n\n**Expedited review:**\nAvailable for genuine emergencies (critical bug fix, security issue, legal requirement). Request via Resolution Center. Apple approves about 40% of expedited requests. Don't abuse it — it's for real emergencies only.\n\n**Tips to avoid delays:**\n• Submit complete metadata (no missing fields)\n• Provide demo account credentials if your app requires login\n• Write clear review notes explaining any unusual features`,
  },
  {
    keywords: ['guideline 4', '4.0', 'design', 'hig', 'interface'],
    response: `Guideline 4.0 — Design Quality is one of the most subjective rejection reasons. Here's what Apple is looking for:\n\n**What triggers a 4.0 rejection:**\n• App looks unfinished or has a poor user experience\n• Non-standard navigation that confuses users\n• Excessive use of web views instead of native UI\n• Tiny tap targets (Apple requires minimum 44×44 pt)\n• Missing or broken accessibility features\n• Inconsistent visual design\n\n**How to avoid it:**\n• Follow Apple's Human Interface Guidelines (developer.apple.com/design/human-interface-guidelines)\n• Use native iOS components where possible\n• Test with VoiceOver enabled\n• Ensure all interactive elements are at least 44×44 points\n• Don't ship with obvious visual bugs or misaligned elements\n\n**If you get rejected for 4.0:**\nApple usually provides specific feedback. Address each point and resubmit. If the feedback is vague, you can request clarification through the Resolution Center.`,
  },
  {
    keywords: ['demo account', 'test account', 'reviewer'],
    response: `A demo account is required whenever your app has features behind a login. Here's everything you need to know:\n\n**When it's required:**\n• Any app that requires account creation to access core features\n• Apps with social features, user profiles, or personalized content\n• Apps with subscription-gated content (provide a pre-subscribed account)\n\n**What happens without one:**\nApple's reviewer can't test your app's core functionality. This is one of the most common rejection reasons — the reviewer will reject with "We were unable to review your app because it requires a login."\n\n**Best practices:**\n• Create a dedicated reviewer account (don't use a real user's account)\n• Pre-populate it with sample data so the reviewer can see the full experience\n• If your app has subscription features, provide an account with an active subscription\n• Include the credentials in the "Review Notes" field, not just the demo account fields\n• Test the credentials yourself before submitting`,
  },
];

const CREDENTIALS_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['app-specific', 'app specific', 'password', 'generate'],
    response: `An app-specific password is a special password that lets third-party apps (like Transporter or Fastlane) access your Apple ID without using your main password.\n\n**How to generate one:**\n1. Go to appleid.apple.com\n2. Sign in with your Apple ID\n3. Click "Sign-In and Security"\n4. Click "App-Specific Passwords"\n5. Click the "+" button\n6. Give it a label (e.g., "LaunchSwift" or "Fastlane")\n7. Click "Create" — Apple generates a 16-character password\n8. Copy it immediately — you can't view it again\n\n**Format:** xxxx-xxxx-xxxx-xxxx (16 characters in 4 groups)\n\n**Security note:** Each app-specific password is tied to your Apple ID. You can revoke individual passwords without changing your main password. Revoke any you no longer use.`,
  },
  {
    keywords: ['team id', 'team', 'where', 'find'],
    response: `Your Team ID is a 10-character alphanumeric string that uniquely identifies your developer account.\n\n**Where to find it:**\n1. Go to appstoreconnect.apple.com\n2. Click your name/profile in the top right\n3. Select "Membership details"\n4. Your Team ID is listed there (format: ABC123XYZ1)\n\n**Alternative location:**\n• developer.apple.com → Account → Membership\n\n**What it's used for:**\n• Configuring Fastlane and other CI/CD tools\n• App-specific password authentication\n• Identifying your team in provisioning profiles\n\n**Note:** If you're an individual developer, your Team ID is the same as your Developer ID. If you're part of an organization, it's the organization's ID.`,
  },
  {
    keywords: ['api key', 'api', 'key', 'connect api', 'automation'],
    response: `The App Store Connect API key enables programmatic access to App Store Connect — useful for CI/CD, Fastlane, and automation tools.\n\n**When you need it:**\n• Using Fastlane with API key authentication (recommended over Apple ID)\n• CI/CD pipelines (GitHub Actions, Bitrise, etc.)\n• Automated metadata updates\n• Automated TestFlight uploads\n\n**How to create one:**\n1. App Store Connect → Users and Access → Integrations\n2. Click "App Store Connect API"\n3. Click "+" to generate a new key\n4. Choose a role (Admin for full access, Developer for most CI needs)\n5. Download the .p8 file — you can only download it once!\n6. Note the Key ID and Issuer ID\n\n**Security:** The .p8 file is your private key. Never commit it to version control. Store it in your CI/CD secrets manager.`,
  },
];

const PRICING_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['free', 'paid', 'freemium', 'should', 'model'],
    response: `The free vs. paid decision is one of the most important you'll make. Here's the honest analysis:\n\n**Free (with IAP/subscriptions) — recommended for most apps**\n• Dramatically higher download volume (typically 10–50x more downloads)\n• Lower barrier to entry lets users experience value before paying\n• Freemium model can generate more revenue than paid if conversion is good\n• Works best when: core value is clear quickly, premium features are genuinely valuable\n\n**Paid upfront**\n• Works for: games with strong brand recognition, professional tools with clear ROI, niche apps with dedicated audiences\n• Declining model — users expect to try before buying\n• Typical price: $0.99–$9.99 for consumer apps, $9.99–$29.99 for pro tools\n\n**The data:** Free apps with IAP generate 95%+ of App Store revenue. Unless you have a compelling reason for paid, go free.\n\n**Hybrid:** Free download + one-time "unlock everything" IAP ($4.99–$9.99) is a strong model for utility apps.`,
  },
  {
    keywords: ['price tier', 'which price', '$0.99', '$2.99', '$4.99', 'psychological'],
    response: `Pricing psychology for App Store apps:\n\n**The $0.99 problem**\n$0.99 is the most common price but often the worst choice. It signals "cheap" and attracts price-sensitive users who are less likely to engage long-term. The revenue difference between $0.99 and $2.99 is 3x, but the conversion difference is usually less than 2x.\n\n**Sweet spots by category:**\n• Games: $0.99–$2.99 (impulse purchase territory)\n• Productivity/Utility: $2.99–$9.99 (users expect to pay for tools)\n• Professional tools: $9.99–$29.99 (ROI-based pricing)\n• Subscriptions: $2.99–$9.99/month, $19.99–$49.99/year\n\n**The charm pricing effect**\n$4.99 feels significantly cheaper than $5.00 to most users. Always use .99 endings.\n\n**Yearly subscription discount**\nOffer yearly at ~50–60% of the monthly equivalent. Example: $4.99/month → $29.99/year (saves ~50%). This is the standard expectation.`,
  },
];

const REVIEW_INFO_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['demo account', 'need', 'required', 'login', 'account'],
    response: `A demo account is required whenever your app has features behind authentication. Here's the definitive guide:\n\n**Required when:**\n• App requires login to access any core features\n• App has user profiles, social features, or personalized content\n• App has subscription-gated content (provide a pre-subscribed account)\n• App has role-based features (provide an account with the relevant role)\n\n**Not required when:**\n• App is fully functional without an account\n• Account creation is optional and all core features work without it\n\n**What to provide:**\n• A working email/username and password\n• An account pre-populated with sample data\n• If subscription features exist: an account with an active subscription\n\n**Critical:** Test the credentials yourself right before submitting. Expired or broken demo accounts are a top rejection reason.`,
  },
  {
    keywords: ['review notes', 'notes', 'write', 'tips', 'reviewer'],
    response: `Review notes are your direct communication with Apple's reviewer. Use them well:\n\n**What to include:**\n1. **How to access key features** — "The main feature is accessed by tapping the camera icon on the home screen, then selecting 'Pro Mode'"\n2. **Demo account credentials** (repeat them here even if in the demo account fields)\n3. **Explanation of unusual permissions** — "The app requests location to show nearby coffee shops. This is core to the app's functionality."\n4. **Context for any potentially confusing UI** — "The onboarding flow has 5 steps. The reviewer should complete all 5 to see the main app."\n5. **Known issues** — "There is a known delay on first launch while the app downloads initial content. This is expected behavior."\n\n**What NOT to include:**\n• Marketing language\n• Requests to approve quickly\n• Anything that sounds like you're trying to game the review\n\n**Length:** 200–500 words is ideal. Enough to be helpful, not so long it's ignored.`,
  },
];

const PRIVACY_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['privacy policy', 'need', 'required', 'do i need'],
    response: `Yes — a privacy policy is required for every app on the App Store, no exceptions.\n\n**Apple's requirement:**\nAll apps must have a privacy policy URL in App Store Connect. Apps without one will be rejected.\n\n**What your privacy policy must cover:**\n• What data you collect\n• How you use it\n• Who you share it with\n• How users can request deletion\n• Contact information\n\n**Free options:**\n• **PrivacyPolicies.com** — free generator, widely used\n• **Termly.io** — free tier available\n• **App Privacy Policy Generator** (app-privacy-policy.com) — specifically for mobile apps\n• **iubenda** — free tier, generates compliant policies\n\n**Hosting:** Host it on your website or use a free hosting service. It must be a publicly accessible URL — not behind a login.\n\n**Update it when you change data practices.** An outdated privacy policy that doesn't match your actual data collection is a legal liability.`,
  },
  {
    keywords: ['data', 'collect', 'apple', 'categories', 'nutrition label'],
    response: `Apple's privacy nutrition label requires you to disclose all data your app collects. Here are the categories:\n\n**Contact Info:** Name, email, phone, address, other user contact info\n**Health & Fitness:** Health data, fitness data\n**Financial Info:** Payment info, credit info, other financial data\n**Location:** Precise location, coarse location\n**Sensitive Info:** Racial/ethnic data, sexual orientation, religion, etc.\n**Contacts:** Contacts from the user's address book\n**User Content:** Emails, texts, photos, videos, audio, gameplay content, customer support data\n**Browsing History:** Web browsing history\n**Search History:** Search history within the app\n**Identifiers:** User ID, device ID\n**Purchases:** Purchase history\n**Usage Data:** Product interaction, advertising data, other usage data\n**Diagnostics:** Crash data, performance data, other diagnostic data\n\n**Important:** Third-party SDKs (analytics, crash reporting, ads) count as data collection even if you don't use the data directly. Check what each SDK collects.`,
  },
  {
    keywords: ['third party', 'sdk', 'analytics', 'firebase', 'crashlytics'],
    response: `Third-party SDKs are a major source of privacy label complexity. Here's what you need to know:\n\n**Common SDKs and what they collect:**\n• **Firebase Analytics:** Usage data, identifiers, diagnostics\n• **Crashlytics:** Diagnostics, device identifiers\n• **Facebook SDK:** Identifiers, usage data, location (if enabled)\n• **Google AdMob:** Identifiers, usage data, location\n• **Amplitude/Mixpanel:** Usage data, identifiers\n• **Sentry:** Diagnostics, identifiers\n\n**Your responsibility:**\nYou must disclose data collected by ALL SDKs in your app, not just your own code. Apple holds you responsible for your entire app's data practices.\n\n**How to audit:**\n1. List all third-party SDKs in your app\n2. Check each SDK's privacy documentation\n3. Add their data types to your privacy label\n\n**Apple's Privacy Manifest requirement (iOS 17+):**\nApple now requires privacy manifests for certain SDKs. Check if your SDKs have updated to include these.`,
  },
];

const GENERAL_RESPONSES: ResponseEntry[] = [
  {
    keywords: ['how long', 'review time', 'takes', 'wait', 'approval'],
    response: `App Store review timelines in 2024–2025:\n\n**Standard review:** 24–48 hours for 90% of submissions. Apple's dashboard (appstoreconnect.apple.com/review) shows real-time estimates.\n\n**First submission:** Can take 2–7 days. Apple is more thorough with new apps.\n\n**After rejection:** Resubmitting after addressing feedback is usually reviewed within 24 hours.\n\n**Expedited review:** Available for genuine emergencies (critical bug fix, security issue). Request via Resolution Center. Don't abuse it.\n\n**Tips to avoid delays:**\n• Submit complete metadata\n• Provide demo account credentials if your app requires login\n• Write clear review notes\n• Don't submit on Friday afternoon before a holiday weekend`,
  },
  {
    keywords: ['rejection', 'rejected', 'common', 'reasons', 'avoid'],
    response: `The top App Store rejection reasons and how to avoid them:\n\n**1. Guideline 2.1 — App Completeness (most common)**\nApp crashes, broken features, placeholder content. Fix: Test on real device, remove all "coming soon" text.\n\n**2. Guideline 4.0 — Design Quality**\nPoor UX, non-standard navigation, tiny tap targets. Fix: Follow Apple's Human Interface Guidelines.\n\n**3. Guideline 5.1.1 — Privacy**\nMissing privacy policy, undisclosed data collection. Fix: Add privacy policy URL, fill out privacy questionnaire accurately.\n\n**4. Guideline 3.1.1 — In-App Purchases**\nExternal payment links, selling digital goods outside IAP. Fix: All digital purchases through StoreKit.\n\n**5. Guideline 2.3 — Accurate Metadata**\nScreenshots don't match app, misleading description. Fix: Use current screenshots, accurate description.\n\n**6. Missing demo account**\nReviewer can't test login-required features. Fix: Always provide working demo credentials.`,
  },
  {
    keywords: ['testflight', 'beta', 'testing', 'setup'],
    response: `TestFlight is Apple's official beta testing platform. Here's the quick setup guide:\n\n**Step 1: Upload a build**\nArchive your app in Xcode (Product → Archive) and upload to App Store Connect.\n\n**Step 2: Add internal testers**\nIn App Store Connect → TestFlight → Internal Testing, add team members. Builds are available immediately.\n\n**Step 3: Set up external testing**\nCreate an external testing group, add testers by email or create a public link. First build requires Apple review (1–3 days).\n\n**Step 4: Fill in TestFlight metadata**\n• Beta App Description: What your app does\n• Feedback Email: Where testers send feedback\n• What to Test: Specific scenarios and focus areas\n\n**Limits:** 100 internal testers, 10,000 external testers per app.\n\n**Pro tip:** Use the "What to Test" field seriously. Specific instructions get you 10x better feedback than vague ones.`,
  },
  {
    keywords: ['screenshots', 'what screenshots', 'need', 'required'],
    response: `Here's exactly what screenshots you need:\n\n**Required for iPhone apps:**\n• iPhone 6.9" (1320 × 2868 px) — covers modern iPhones\n• OR iPhone 6.5" (1242 × 2688 px)\n\n**Required for iPad apps:**\n• iPad Pro 13" (2048 × 2732 px)\n• OR iPad Pro 11" (1668 × 2388 px)\n\n**Key shortcut:** 6.9" screenshots cover 6.5" devices. You don't need both.\n\n**Format:** PNG or JPEG, no alpha channel, exact pixel dimensions.\n\n**Tips for great screenshots:**\n• First screenshot is your hero — make it your best\n• Add text overlays with benefit statements\n• Show the transformation, not just the UI\n• Use consistent visual style across all screenshots`,
  },
  {
    keywords: ['price', 'pricing', 'how much', 'free', 'paid'],
    response: `App Store pricing strategy:\n\n**Free vs. Paid:**\nFree apps get 10–50x more downloads. Unless you have a strong brand or niche audience, go free with IAP or subscriptions.\n\n**Freemium model (recommended):**\nFree download + premium features via subscription or one-time IAP. This is how 95%+ of App Store revenue is generated.\n\n**Subscription pricing sweet spots:**\n• Monthly: $2.99–$9.99\n• Yearly: $19.99–$49.99 (offer ~50% discount vs monthly)\n\n**One-time IAP sweet spots:**\n• Remove ads: $2.99–$4.99\n• Feature unlock: $4.99–$9.99\n• Pro version: $9.99–$29.99\n\n**Psychological pricing:** Always use .99 endings. $4.99 feels significantly cheaper than $5.00.`,
  },
  {
    keywords: ['app specific password', 'apple id', 'credentials', 'password'],
    response: `An app-specific password lets tools like Fastlane and Transporter access your Apple ID securely.\n\n**How to generate:**\n1. Go to appleid.apple.com\n2. Sign in → Sign-In and Security\n3. App-Specific Passwords → "+" button\n4. Label it (e.g., "Fastlane CI")\n5. Copy the generated password (xxxx-xxxx-xxxx-xxxx)\n\n**Important:** You can only view it once. Store it in your password manager or CI/CD secrets immediately.\n\n**When you need it:**\n• Uploading builds with Transporter\n• Fastlane with Apple ID authentication\n• Any third-party tool that needs App Store Connect access\n\n**Alternative:** Use App Store Connect API keys instead — they're more secure and don't require 2FA handling.`,
  },
];

// ─── Response engine ──────────────────────────────────────────────────────────

function getSectionResponses(section: string): ResponseEntry[] {
  switch (section) {
    case 'metadata': return METADATA_RESPONSES;
    case 'screenshots': return SCREENSHOTS_RESPONSES;
    case 'iap': return IAP_RESPONSES;
    case 'testflight': return TESTFLIGHT_RESPONSES;
    case 'age-rating':
    case 'ageRating': return AGE_RATING_RESPONSES;
    case 'checklist': return CHECKLIST_RESPONSES;
    case 'credentials': return CREDENTIALS_RESPONSES;
    case 'pricing': return PRICING_RESPONSES;
    case 'review-info':
    case 'reviewInfo': return REVIEW_INFO_RESPONSES;
    case 'privacy': return PRIVACY_RESPONSES;
    default: return GENERAL_RESPONSES;
  }
}

function findBestResponse(message: string, responses: ResponseEntry[]): string | null {
  const lower = message.toLowerCase();
  let bestMatch: ResponseEntry | null = null;
  let bestScore = 0;

  for (const entry of responses) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore > 0 ? bestMatch!.response : null;
}

function getSectionName(section: string): string {
  const names: Record<string, string> = {
    metadata: 'Description & Metadata',
    screenshots: 'Screenshots & Previews',
    iap: 'In-App Purchases',
    testflight: 'TestFlight',
    'age-rating': 'Age Rating',
    ageRating: 'Age Rating',
    checklist: 'Final Checklist',
    credentials: 'Credentials',
    pricing: 'Pricing & Availability',
    'review-info': 'App Review Information',
    reviewInfo: 'App Review Information',
    privacy: 'Privacy Policy',
    subscriptions: 'Subscriptions',
    'app-info': 'App Information',
    appInfo: 'App Information',
    general: 'App Store Submission',
  };
  return names[section] || section;
}

function getFallbackResponse(section: string): string {
  const sectionName = getSectionName(section);
  const sectionTopics: Record<string, string> = {
    metadata: 'writing great descriptions, keyword strategy, promotional text, subtitle optimization, and what\'s new copy',
    screenshots: 'screenshot dimensions, required vs optional sizes, design tips, and App Preview videos',
    iap: 'consumable vs non-consumable types, pricing strategy, subscription groups, and restore purchases',
    testflight: 'internal vs external testers, review timelines, what to test notes, and build uploads',
    'age-rating': 'content descriptors, rating calculations, and what triggers 17+',
    ageRating: 'content descriptors, rating calculations, and what triggers 17+',
    checklist: 'common rejection reasons, review timelines, guideline explanations, and demo accounts',
    credentials: 'app-specific passwords, Team ID, API keys, and App Store Connect access',
    pricing: 'free vs paid models, price tiers, freemium strategy, and subscription pricing',
    'review-info': 'demo accounts, review notes, contact information, and helping reviewers',
    reviewInfo: 'demo accounts, review notes, contact information, and helping reviewers',
    privacy: 'privacy policy requirements, data categories, third-party SDKs, and Apple\'s nutrition label',
    subscriptions: 'subscription groups, auto-renewing subscriptions, free trials, and pricing',
    general: 'metadata, screenshots, pricing, TestFlight, in-app purchases, age rating, privacy, and the review process',
  };

  const topics = sectionTopics[section] || 'this section of your App Store submission';
  return `I can help you with ${topics} for ${sectionName}.\n\nTry asking me something specific, like:\n• "What are the best practices for this section?"\n• "What are common mistakes to avoid?"\n• "How do I get started?"\n\nWhat would you like to know?`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAIResponse(message: string, context: ChatContext): Promise<string> {
  console.log(`[AIChat] Getting response for section: ${context.section}, message: "${message.substring(0, 50)}..."`);

  // Simulate thinking delay (1–2 seconds)
  const delay = 1000 + Math.random() * 800;
  await new Promise(resolve => setTimeout(resolve, delay));

  const sectionResponses = getSectionResponses(context.section);
  const allResponses = [...sectionResponses, ...GENERAL_RESPONSES];

  // Try section-specific first, then general
  let response = findBestResponse(message, sectionResponses);
  if (!response) {
    response = findBestResponse(message, GENERAL_RESPONSES);
  }

  if (!response) {
    response = getFallbackResponse(context.section);
  }

  console.log(`[AIChat] Response found, length: ${response.length} chars`);
  return response;
}

export function getWelcomeMessage(context: ChatContext): string {
  const sectionName = getSectionName(context.section);
  if (context.section === 'general') {
    return `Hi! I'm your App Store submission expert. I can help you with metadata, screenshots, pricing, review guidelines, TestFlight, in-app purchases, and anything else you need to get your app approved.\n\nWhat would you like to know?`;
  }
  return `Hi! I'm here to help with your **${sectionName}** section${context.projectName ? ` for ${context.projectName}` : ''}.\n\nAsk me anything — from best practices to specific requirements. What would you like to know?`;
}

export function getSuggestedQuestions(section: string): string[] {
  const suggestions: Record<string, string[]> = {
    metadata: [
      'How do I write a great description?',
      'What are the best keyword strategies?',
      'What is promotional text used for?',
      'How long should my description be?',
    ],
    screenshots: [
      'What screenshot sizes do I need?',
      'Which sizes are required vs optional?',
      'Tips for high-converting screenshots?',
      'Do I need an App Preview video?',
    ],
    iap: [
      'Consumable vs non-consumable — what\'s the difference?',
      'How should I price my IAPs?',
      'What is a subscription group?',
      'Do I need a Restore Purchases button?',
    ],
    testflight: [
      'How many testers can I have?',
      'What should I write in "What to Test"?',
      'How long does TestFlight review take?',
      'How do I upload a build?',
    ],
    'age-rating': [
      'What age rating should I choose?',
      'What triggers a 17+ rating?',
      'How is the rating calculated?',
    ],
    ageRating: [
      'What age rating should I choose?',
      'What triggers a 17+ rating?',
      'How is the rating calculated?',
    ],
    checklist: [
      'Why was my app rejected?',
      'How long does App Review take?',
      'What is Guideline 4.0?',
      'Do I need a demo account?',
    ],
    credentials: [
      'What is an app-specific password?',
      'Where do I find my Team ID?',
      'What is an API key used for?',
    ],
    pricing: [
      'Should my app be free or paid?',
      'What price tier should I use?',
      'How does freemium work?',
    ],
    'review-info': [
      'Do I need a demo account?',
      'What should I write in review notes?',
      'What happens if I don\'t provide credentials?',
    ],
    reviewInfo: [
      'Do I need a demo account?',
      'What should I write in review notes?',
      'What happens if I don\'t provide credentials?',
    ],
    privacy: [
      'Do I need a privacy policy?',
      'What data does Apple consider collected?',
      'How do third-party SDKs affect my privacy label?',
    ],
    subscriptions: [
      'How do subscription groups work?',
      'What\'s a good subscription price?',
      'How do free trials work?',
    ],
    general: [
      'How long does App Review take?',
      'What are the most common rejection reasons?',
      'How do I set up TestFlight?',
      'What screenshots do I need?',
      'How should I price my app?',
      'What is an app-specific password?',
    ],
  };
  return suggestions[section] || suggestions.general;
}
