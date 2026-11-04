# MUSHer 2.0: Flagship Messaging Innovations & VIP Monetization Implementation Plan

MUSHer is evolving beyond standard chat into an expressive, emotional, and memorable communication hub. This plan outlines the technical and UI architecture for delivering the user's top 5 flagship features, along with interactive social mechanics, privacy controls, and tiered subscription monetization.

---

## User Review Required

> [!NOTE]
> All primary architectural decisions have defaulted to optimal presets. Please review the following before execution:
- **No external paid API requirements**: All AI summarization and semantic query capabilities will interface seamlessly via the built-in `@google/genai` client, with instant offline/local fallback heuristics.
- **Data Persistence**: State changes (unlocked time capsules, star constellations, reaction clips, unsent drafts, streaks, and VIP status) are persisted via `localStorage` and synchronized across app sessions with IndexedDB support.

---

## Proposed Changes

### 1. State Management & Data Core (`src/context/AppContext.tsx`)

Enhance the central context to power all innovative features:
- **Time Capsule Engine**:
  - `sendTimeCapsuleMessage(chatId, text, unlockDate, mediaUrl, hint)`: dispatches locked capsules.
  - Automatic interval ticker to evaluate unlock conditions, dispatching notifications and opening celebration states when target timestamps are reached.
- **Message Time Machine Search & AI Summary**:
  - `searchTimeMachine(chatId, query, filters)`: fuzzy multi-dimensional search over conversation history matching context, date proximity, sentiments, and media.
  - `generateChatSummary(chatId, messageCount)`: summarizes recent or unread message clusters using Gemini API (with key takeaways, action points, and tone insights).
- **Message Universe & Friendship Journey**:
  - `toggleStarMessage(chatId, messageId)`: toggles star state to form celestial nodes in the 3D Message Universe.
  - `getFriendshipTimeline(chatId)`: computes relationship milestones (first encounter date, total messages exchanged, peak streak, funniest shared moment, shared photo highlights).
- **Ghost Presence & Secret Second Inbox**:
  - `toggleGhostPresence()`: toggles disappearing presence (hides online badge, typing indicator, and last-seen status from contacts while chatting).
  - `secretInboxPin`: encrypted/hashed PIN state for locking private conversations.
  - `unlockSecretInbox(pin)`, `setSecretInboxPin(pin)`, `moveToSecretInbox(chatId)`.
- **Conversation Streaks & Reactions 2.0**:
  - Streak evaluation algorithm that rewards genuine, meaningful multi-turn dialogue (not just single emoji pinging).
  - `addReaction(chatId, messageId, reaction)`: handles standard emojis, animated stickers, 2-second recorded video reaction loop URLs, and audio voice snippets.
- **VIP & Premium Subscription Manager**:
  - `subscribeToTier(tier: 'free' | 'premium' | 'vip')`: manages monthly subscriptions ($27/mo Premium with 10x-50x profile/reels view multipliers; $50-$55/mo VIP with gold badge, VIP crown, maximum algorithm reach, and auto-like boost engine).
  - Simulated view boost analytics showing before/after impressions and engagements.

---

### 2. Time Capsule Experience (`src/components/chat/TimeCapsuleModal.tsx` & Message Bubble Integration)

- **Creation Modal**:
  - Date & time picker with quick presets ("Tomorrow morning", "Next weekend", "Friend's Birthday", "New Year's Eve", "Custom Date").
  - Optional teaser hint (e.g., "A surprise for your big 25th! 🎂") visible while locked.
  - Media attachment support (photos, voice notes).
- **In-Chat Rendering (`src/components/chat/ChatWindow.tsx`)**:
  - **Locked State**: Metallic holographic lock capsule card featuring a live countdown timer (`04d 18h 32m 10s`), glowing seal icon, and teaser hint.
  - **Unlock Moment**: Interactive tap to trigger confetti particle burst, padlock dissolve animation, and reveal the encapsulated letter/media.

---

### 3. Cosmic 3D Message Universe (`src/components/chat/MessageUniverseModal.tsx`)

- **Interactive Canvas / Three.js Visualizer**:
  - Transforms any conversation into an interactive 3D galaxy:
    - **Glowing Stars**: Starred and highlighted emotional messages.
    - **Orbiting Planets**: Voice notes with orbit rings and duration markers.
    - **Memory Nebulae**: Photo clusters and shared media glowing with soft color clouds.
    - **Constellations**: Geometric connecting light lines linking conversational milestones over time.
  - Smooth orbit camera controls (pan, zoom, rotate), tap star to inspect message modal, and ambient cosmic particle field.

---

### 4. Message Time Machine & AI Summary Modal (`src/components/chat/TimeMachineModal.tsx` & `ChatSummaryModal.tsx`)

- **Message Time Machine**:
  - Natural language search bar ("Remember when we planned our road trip in July?", "That Italian restaurant John recommended").
  - Filter chips: Timeframe, Media Type (Photos, Voice Notes, Capsules), Sentiment (Laughs, Plans, Memories).
  - Jump-to-message anchor with smooth scroll directly to the historical conversation point.
- **AI Chat Summary**:
  - One-tap "Summarize Last 50 Messages" drawer with executive digest, agreed plans, pending questions, and key humor highlights.

---

### 5. Friendship Timeline (`src/components/chat/FriendshipTimelineModal.tsx`)

- **Interactive Milestone Roadmap**:
  - Visual vertical path connecting key friendship badges:
    - *The Beginning*: Exact date & first message sent.
    - *Peak Streak*: Longest streak days achieved (e.g. 42-day flame streak 🔥).
    - *Memory Vault*: Top 4 most reacted photos and voice note highlights.
    - *Dynamic Friendship Level*: Status tier (e.g. "Soul Duo", "Inner Circle", "Comrade").

---

### 6. Privacy & Novel Chat Tools

- **Disappearing Presence Indicator**: Quick toggle in the chat header and settings bar to go invisible instantly with a sleek phantom badge.
- **Reactions 2.0 Tray (`src/components/chat/Reactions2Picker.tsx`)**:
  - Quick animated emoji bar.
  - Voice reaction recorder (1–5 second quick voice note reaction badge).
  - 2-second webcam/selfie video reaction loop generator.
- **Secret Second Inbox Modal (`src/components/chat/SecretInboxModal.tsx`)**:
  - Keypad PIN entry dialog, disguise mode, and seamless switching between Public Inbox and Vault.
- **Digital Emotion Cards (`src/components/chat/DigitalEmotionModal.tsx`)**:
  - Expressive interactive cards (Heartfelt, Overwhelmed, Excited, Reflective) with custom reaction buttons for receivers (Send Hug, Send Strength, Hype Up).
- **Unsent Messages Drawer (`src/components/chat/UnsentBoxModal.tsx`)**:
  - Private scratchpad/journal for unsent drafts, allowing editing, journaling, or delayed sending.

---

### 7. Monetization & Profile Boost (`src/components/profile/SubscriptionModal.tsx`)

- **Tier Comparison Showcase**:
  - **Free Tier**: Standard messaging and baseline social discoverability.
  - **Premium Tier ($27/mo)**: Blue verified badge, 10x-50x Reels and Profile view boost multiplier, ad-free experience, unlimited Time Capsules.
  - **VIP Tier ($50-$55/mo)**: Glowing golden crown badge, exclusive profile holographic theme, viral magnet algorithm (guaranteed front-page explore placement and automatic view/like acceleration), priority direct messages, and unrestricted Message Universe archiving.
- **Live Impression Analytics**:
  - Interactive simulator demonstrating view count spikes and engagement multipliers when upgrading.

---

## Verification Plan

### Automated Checks
- `compile_applet`: Ensure clean build with zero TypeScript compilation or bundler errors.
- `lint_applet`: Confirm full compliance with ESLint and project rules.

### Manual Verification Scenarios
1. **Time Capsule Workflow**:
   - Create a time capsule set to unlock in 1 minute. Verify locked holographic card with live countdown.
   - Wait for timer expiry, verify unlock event, celebratory particles, and revealed content.
2. **Message Universe 🌌**:
   - Star 3 messages in a chat. Open Message Universe.
   - Verify 3D cosmic view with interactive star nodes, orbiting planets for voice notes, and constellation links.
3. **Message Time Machine & AI Summary**:
   - Search for past conversational topics using natural language queries.
   - Run AI Chat Summary on an active conversation thread; check formatted breakdown of key moments and action points.
4. **Secret Second Inbox**:
   - Set 4-digit PIN. Move chat to secret inbox. Verify chat is hidden from primary chat list.
   - Enter PIN to access secret vault and view secret conversation.
5. **Subscription Flow**:
   - Open subscription modal. Select VIP tier ($55/mo).
   - Verify VIP badge, crown avatar ornament, and page view/like multiplier metrics on profile and feed.
6. **Disappearing Presence & Reactions 2.0**:
   - Toggle Ghost Presence; verify status indicator changes to phantom mode.
   - Send animated, voice, and emotion reactions on a message bubble.
