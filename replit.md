# ShowLine

A simulated MVP Expo React Native app for creators to manage fan communication lines — FanMail, LiveLine (real-time call-ins), Backstage/VIP access, Collab inquiries, Auto-reply, and Post-Show session recaps. All data is local/mock; no real phone/SMS integration.

## Run & Operate

- `pnpm --filter @workspace/showline run dev` — start Expo dev server (port 19267)
- `pnpm --filter @workspace/showline run typecheck` — TypeScript check (zero errors)
- Workflow name: `artifacts/showline: expo`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Expo ~54 + expo-router ~6 (file-based routing, typed routes)
- React Native 0.81.5 + React Native Web
- State: React Context (no Redux/Zustand) — ShowLine, Messages, LiveLine, SessionHistory, Simulation, Banner
- Persistence: AsyncStorage via context (no database)
- Fonts: Inter (400/500/600/700) via @expo-google-fonts/inter
- Icons: @expo/vector-icons (Feather)

## Where things live

- `artifacts/showline/app/` — Expo Router screens (tabs + modals/stacks)
- `artifacts/showline/context/` — 6 context providers
- `artifacts/showline/components/` — shared UI components
- `artifacts/showline/data/mockData.ts` — initial fan messages, VIP list
- `artifacts/showline/data/simulatorData.ts` — simulation engine message pools
- `artifacts/showline/types/index.ts` — all shared TypeScript types
- `artifacts/showline/constants/colors.ts` — design tokens (dark-only palette)
- `artifacts/showline/hooks/useColors.ts` — color scheme hook

## Architecture decisions

- All data is mock/simulated — no real SMS, Twilio, auth, or payments
- `FanMessage.line` is typed as `"fanmail" | "liveline" | "backstage"` — there is intentionally no "collab" line type in FanMessage (Collab uses separate CollabMessage type)
- `moveToCollab()` in MessagesContext tags a FanMail message for collab tracking; since FanMessage has no "collab" line, the message stays in fanmail — this is intentional MVP placeholder behavior
- Reset Mock Data only resets messages/VIPs/sessions, preserving onboarding + line settings
- `useColors()` always returns dark palette merged with `radius` — light/dark palettes are identical by design (always dark UI)

## Product

ShowLine gives creators a dedicated fan phone system with:
- **FanMail**: inbox for fan messages with tagging, filtering, star/archive/block
- **LiveLine**: real-time audience engagement sessions with recap generation
- **Backstage Line**: VIP superfan management with custom profiles
- **Collab Line**: business inquiry management with contact tagging
- **Auto-reply**: configurable smart auto-reply rules per line
- **Demo Mode**: simulated message flow for demos/testing
- **Safety**: keyword blocking, quiet hours, rate limiting

## User preferences

_Populate as you build._

## Gotchas

- `GestureHandlerRootView` from react-native-gesture-handler v2.28 doesn't declare `children` explicitly in its TypeScript types under React 19 (`@types/react@19.1.x`). Fix: re-cast as `React.ComponentType<...Props & { children?: React.ReactNode }>` in `_layout.tsx`.
- `"lightbulb"` is not a valid Feather icon name — use `"zap"` for the idea/content icon in session recap screen.
- `useColors()` must access `colors.dark` / `colors.light` directly — do NOT cast `colors` as `Record<string, ColorSet>` because `colors.radius` (a `number`) is not a `ColorSet`.
- Expo web bundles at port 19267; artifact registered with `router = "expo-domain"` to serve via the Expo dev domain proxy.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific patterns
