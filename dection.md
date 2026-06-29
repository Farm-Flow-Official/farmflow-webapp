# Decision Record: Verifier queue is empty — wire the stub assessor into session completion

> Backend fix lives in `farmflow-api` (Bun + Elysia). No webapp/Next.js code changes.
> Source handoff: `~/.claude/plans/batch-delightful-dolphin.md`.

## Problem

`GET /api/v1/verifier/batches` always returns `data: []` even though farmers complete
assessment sessions. The verifier queue gate `queuePredicate()`
(`farmflow-api/src/modules/verifier/service.ts:97`) requires
`ai_batch_status = 'completed'`, but the only code that sets that — 
`AiAssessmentService.runForSession()` (`assessment-ai/service.ts:39`) — is never called
by any production route (only tests + demo seed). So every completed session is stuck at
`ai_batch_status = 'waiting'` and never reaches the queue.

## Key finding

`runForSession()` is **not** a real AI. It's a deterministic stub (`stub-heuristic-v0`):
- **Carbon**: T-VER allometric engine from DBH + height → kgCO₂e (pure math).
- **Confidence**: heuristic penalty score (start 0.95, minus for out-of-boundary / missing photo).
- No external model, nothing async; runs in one DB transaction; re-runnable.

So it can ship now without the "real AI." The real model swaps in later behind the same seam.

## Decisions

1. **Ship the existing deterministic stub** — do not wait for real AI.
2. **Wire `runForSession()` into `completeSession()` inline/synchronously.** Import edge is
   one-way (`assessments → assessment-ai`); no circular dependency.
3. **Retry guard on `ai_batch_status`, not just `completedAt`.** Return early only when a
   session is completed *and* already assessed; if still `'waiting'`, re-run the stub
   (self-heals stuck sessions). `runForSession` is re-runnable.
4. **Surface AI errors; keep completion durable.** Stamp `completedAt` first (committed),
   then run the stub. Stub sets `'completed'` on success. If it throws (rare — e.g. missing
   species equation), the request errors so the problem is visible; `completedAt` persists
   and the retry guard re-runs on the next call.
5. **One-off backfill script** (`scripts/backfill-ai-assessments.ts`) for sessions already
   completed-but-`'waiting'` in the DB.
6. **Keep the verifier `queuePredicate()` gate as-is** — the stub satisfies it.

## Bypassed for now (Phase 6 / future)

The async `waiting → processing → completed → rejected` AI-batch pipeline and the real
vision/ML model. Those enum states remain in the schema; only `runForSession`'s internals
get swapped later. No admin manual-trigger endpoint (considered, not chosen).

## Verify

- `cd farmflow-api && bun test` — green.
- Farmer completes a session → DB `ai_batch_status = 'completed'` → batch appears in
  `GET /api/v1/verifier/batches` (verifier cookie) with `treeCount`, `avgConfidence`,
  `totalCarbonKgCo2e`, `anomalyFlag`, `status: "Pending"`.
- Run backfill script → pre-existing stuck sessions appear in the queue.
