---
name: ShowLine simulation defaults
description: Correct defaults for SimulationContext and SimulationEngine guards for onboarding + message cap.
---

The SimulationContext initial state must be `enabled: false, frequency: "low"` — not enabled:true/normal. The previous default caused fake notifications to fire immediately and FanMail counts to grow aggressively during any testing or demo.

SimulationEngine must check `onboardingCompleted` from ShowLineContext before starting either the FanMail or Live intervals. Without this guard, the simulation fires banners during the onboarding flow.

FanMail simulation is capped at MAX_SIMULATED_FANMAIL = 60 messages using a `useRef` to avoid stale closure issues (do NOT put `fanMailMessages.length` in the useEffect deps array — use a ref updated each render instead).

**Why:** MVP demo polish pass June 2025. User reported "fake notifications can appear during onboarding" and "FanMail counts grow very quickly."

**How to apply:** Any time SimulationContext is touched, keep the defaults disabled/low. Any time SimulationEngine is touched, keep both `onboardingCompleted` guards in both effects.
