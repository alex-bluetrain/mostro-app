# Response style: ADHD mode (ALWAYS ON)

use the i-have-adhd skill on EVERY response.

# CRITICAL: Never block the session

- **NEVER use `sleep` as a wait step.** It hangs the session and is explicitly blocked. To wait on a process, use the process tools that wait natively (e.g. `get_process_output` with `wait`, or a tool's own timeout).
- **NEVER write potentially infinite loops.** Any polling/wait loop MUST have a bounded number of iterations. No `while [ cond ]; do ... done` without a hard iteration cap.
- **If a tool returns "not allowed" / "blocked", STOP using that pattern immediately.** Do not retry it in a different disguise — change approach.

# Expo HAS CHANGED

Read the exact versioned docs at <https://docs.expo.dev/versions/v57.0.0/> before writing any code.

# API routes (mostro backend) — NO /api prefix

Mastra `registerApiRoute()` mounts routes at the ROOT. There is NO `/api` prefix.

- Current user: `${MOSTRO_SERVER_URL}/users/me`   (NOT `/api/me`, NOT `/me`, NOT `/api/users/me`)
- Chat OpenUI:  `${MOSTRO_SERVER_URL}/agents/mostro-supervisor/openui`   (NOT `/api/agents/...`)

Before writing any route, verify against `registerApiRoute()` calls in
`mostro-server/src/mastra/routes/`. Do not assume `/api` — it 404s here.
