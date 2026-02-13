# LCP Optimization Program — Variant C (Server-First Hero + Progressive Enhancement)

## 1) Goal and non-goals

### Goal
Implement a **maximum-impact LCP optimization strategy** for the homepage by shifting to:

1. **Server-first critical render** (single static hero above the fold).
2. **Progressive enhancement** (interactive carousel/features loaded after first paint).
3. **Cache-first delivery model** (HTML/data/image responses served from cache/CDN whenever possible).

Primary success criteria:

- Reduce homepage LCP p75 (mobile first, then desktop).
- Reduce origin load (DB requests per pageview, server CPU time, image optimizer work).
- Preserve UX and business-critical conversion points (hero CTA visibility, clickthrough).

### Non-goals

- Full redesign of visual style.
- Migration away from Next.js App Router.
- Breaking changes to existing catalog/admin workflows.

---

## 2) Current-state diagnosis (baseline)

Current homepage flow couples critical and non-critical work:

- `app/page.tsx` waits on `getHomepageSections()` before rendering page output.
- `getHomepageSections()` calls `getHomePageData()`, which issues 4 section queries in a single `Promise.all`.
- Per-section `enrichWithUserStatus(...)` may trigger additional `user_lists` queries for authenticated users.
- Hero is a client-side carousel with heavy visual layers (large images, gradient overlays, blur, transitions).

Operational effect:

- Critical path includes non-critical section fetches.
- High first-load visual and hydration cost.
- Origin and DB load scale with traffic rather than cache hit ratio.

---

## 3) Target architecture (Variant C)

## 3.1 Rendering model

### Critical path (must be minimal)

- Render only a **single, server-rendered hero frame** for first viewport:
  - title
  - primary CTA(s)
  - one deterministic LCP background image

### Deferred path (after first paint / interaction)

- Hydrate/attach interactive carousel behavior.
- Load additional homepage sections (`popular`, `trending`, `latestUpdates`) progressively.
- Load user-specific list status in a separate non-blocking request.

---

## 3.2 Data model split

Introduce explicit data boundaries:

1. `getHomeHeroCriticalData()`
   - Minimal field set for first frame.
   - No user-specific enrichment.
   - Cache-friendly and stable.

2. `getHomeSecondarySections()`
   - Popular/trending/latest sections.
   - Streamed or deferred.

3. `getUserHomepageEnhancements(userId)`
   - Optional per-user status enrichments.
   - Client-triggered after initial render.

Design principle: **No authenticated personalization in critical LCP route**.

---

## 3.3 Caching and delivery

### HTML / RSC payload

- Homepage route should be ISR/edge-cacheable with controlled revalidation window.
- Secondary sections may use independent cache keys/tags to avoid invalidating full page for small updates.

### Hero data

- Serve from cache with stale-while-revalidate semantics.
- Invalidate/revalidate when hero curation changes.

### Hero image

- Use a dedicated pre-optimized asset profile for LCP candidate image.
- Ensure deterministic dimensions and predictable `sizes`.
- Long CDN TTL (`immutable`) with versioned URLs.

---

## 4) Infrastructure changes required

## 4.1 Caching/invalidation controls

Add explicit revalidation controls:

- Route-level revalidation period for homepage shell.
- Tag/path-based invalidation trigger when featured hero content changes.
- Operational endpoint/webhook for manual cache purge on hero incidents.

## 4.2 Image pipeline hardening

- Define accepted hero source constraints (resolution floor, aspect ratio, max byte budget).
- Add CI/check script for hero image budget violations (optional but recommended).
- Use AVIF/WebP generation policy with fallback support as needed.

## 4.3 Observability

Track these metrics before/after rollout:

1. LCP p75/p95 (mobile + desktop).
2. DB queries per homepage pageview.
3. Origin request duration p95/p99.
4. Cache hit ratio (HTML + image CDN).
5. Bytes transferred per homepage view.
6. Hero CTA CTR (regression guard).

---

## 5) Implementation roadmap (phased)

## Phase 0 — Baseline and guardrails (mandatory)

Deliverables:

- Capture baseline metrics for 7 days (or statistically sufficient window).
- Create rollout feature flag(s):
  - `home_server_first_hero`
  - `home_deferred_sections`
- Define SLO/rollback thresholds.

Exit criteria:

- Baseline dashboard is visible to product + engineering.
- Rollback plan documented and testable.

---

## Phase 1 — Critical hero isolation

Deliverables:

- Introduce server-rendered hero component for first frame only.
- Split data fetchers:
  - critical hero data separate from secondary sections.
- Remove non-critical hero effects from first render (blur-heavy layer / expensive transitions).

Exit criteria:

- First viewport is fully renderable without waiting for secondary section data.
- No visual break on mobile/desktop first screen.

---

## Phase 2 — Progressive enhancement

Deliverables:

- Attach carousel interactivity after first render.
- Secondary sections fetched/rendered via deferred mechanism (streaming or client fetch).
- User-specific enrichments moved out of critical path.

Exit criteria:

- Interactive parity preserved.
- Initial LCP candidate remains stable during hydration.

---

## Phase 3 — Cache-first hardening

Deliverables:

- Route/data/image cache rules finalized.
- Revalidation triggers wired to hero admin updates.
- Cache hit ratio alerts enabled.

Exit criteria:

- Cache hit ratio above agreed threshold.
- Origin load trend reduced versus baseline.

---

## Phase 4 — Optimization and quality tuning

Deliverables:

- Fine-tune image sizes/quality for LCP asset budget.
- Remove residual layout/paint regressions.
- Validate business KPIs (hero CTR/session depth).

Exit criteria:

- LCP improvement sustained for at least 1 release cycle.
- No product KPI regression beyond tolerated limits.

---

## 6) Proposed repository-level change map

> This section maps what should be changed where; exact code details can vary.

1. `lib/data-fetchers.ts`
   - Add dedicated hero critical fetcher.
   - Decouple secondary section fetching.
   - Ensure user status enrichment is no longer part of critical path.

2. `app/page.tsx`
   - Render server-first hero immediately.
   - Move secondary sections behind deferred boundary.

3. `components/HeroSlider.tsx`
   - Keep as enhancement layer, not the initial critical render dependency.
   - Guard heavy effects for post-load/interactive mode.

4. Add new docs/ops note (this file + optional runbook)
   - Revalidation and incident procedures.

---

## 7) Risk register and mitigations

## Risk A: Visual inconsistency between static first frame and interactive carousel

Mitigation:

- Reuse identical content source and style tokens for first frame and first carousel slide.
- Snapshot/visual regression checks on top breakpoints.

## Risk B: Stale hero data due to cache

Mitigation:

- Event-triggered invalidation on hero update.
- Manual purge endpoint for operations.

## Risk C: KPI regression (CTR drop due to reduced motion)

Mitigation:

- A/B compare old/new hero behavior.
- Reintroduce limited non-blocking motion after first paint if needed.

## Risk D: Hidden origin load shifts to image optimizer

Mitigation:

- Pre-optimize critical hero assets.
- Track optimizer invocation counts and response sizes.

---

## 8) Rollout strategy

1. Canary enable for internal users.
2. 5% production traffic with real-user monitoring.
3. 25% after 24h if no SLO/KPI breach.
4. 100% rollout + remove legacy path after stabilization.

Rollback policy:

- Immediate feature-flag rollback if LCP p95 worsens beyond threshold or CTR drops beyond agreed tolerance.

---

## 9) Definition of done

Project is considered complete when:

1. Variant C architecture is active in production.
2. LCP p75 is measurably improved vs baseline.
3. DB queries per homepage view and origin CPU/request are reduced.
4. Cache hit ratio is stable and monitored.
5. Revalidation/rollback runbooks are tested.

---

## 10) Suggested KPI targets (example)

> Tune these numbers to your business context.

- LCP p75 mobile: **-25% to -40%** versus baseline.
- DB queries per homepage view: **-30% to -60%**.
- Origin p95 duration: **-20% to -35%**.
- Cache hit ratio (homepage shell): **>80%** steady-state.
- Hero CTR: no worse than **-3% relative** (or better).

---

## 11) Team ownership model

- Frontend: rendering split, progressive enhancement, visual parity.
- Backend/data: fetcher split, cache tags/invalidation integration.
- DevOps/platform: CDN/cache policy, monitoring/alerts, rollback automation.
- Product/analytics: KPI gates, A/B design, release decision.

---

## 12) Practical next action list (immediate)

1. Approve target architecture and KPI gates.
2. Implement Phase 0 baselining + feature flags.
3. Start Phase 1 with server-first hero isolation.
4. Schedule staged rollout and monitoring review cadence.

