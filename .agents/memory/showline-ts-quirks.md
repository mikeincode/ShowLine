---
name: ShowLine TypeScript quirks
description: Three non-obvious TS errors in the ShowLine artifact and their fixes, specific to React 19 type compat and library version mismatches.
---

# ShowLine — TypeScript Quirks & Fixes

**Why:** These errors only appear because @types/react@19.1.x removed implicit children from component props and tightened cast rules. They are not derivable from reading the code alone — you need to know the React 19 context.

## 1. GestureHandlerRootView — React 19 children compat

**Error:** `Property 'children' does not exist on type 'IntrinsicAttributes & GestureHandlerRootViewProps'`

**Fix (in `app/_layout.tsx`):**
```tsx
import { GestureHandlerRootView as _GestureHandlerRootView } from "react-native-gesture-handler";
const GestureHandlerRootView = _GestureHandlerRootView as React.ComponentType<
  React.ComponentProps<typeof _GestureHandlerRootView> & { children?: React.ReactNode }
>;
```

**Why:** react-native-gesture-handler v2.28 doesn't include children in its TypeScript props under React 19.

## 2. Feather icon "lightbulb" — not a valid name

**Error:** `Type '"lightbulb"' is not assignable to type ...`

**Fix:** Use `"zap"` instead of `"lightbulb"` in `app/session/[id].tsx`.

**Why:** Feather icon set doesn't include a "lightbulb" icon. "zap" is the closest semantic match for "ideas."

## 3. useColors — colors object cast

**Error:** Cast of `colors` to `Record<string, typeof colors.light>` fails because `colors.radius` is a `number`, not a color set.

**Fix (in `hooks/useColors.ts`):**
```ts
const palette = scheme === "dark" ? colors.dark : colors.light;
```

**Why:** `colors` object has both scheme keys (`light`, `dark`) and a `radius: number` key, making it incompatible with `Record<string, ColorSet>`. Direct property access avoids the cast entirely.

## How to apply

Run `pnpm --filter @workspace/showline run typecheck` after any changes to these files to confirm zero errors.
