# WIDE LABEL Antigravity starter kit

This directory is generated from `handoff.md`. Copy its contents into the root of the empty repository.

## First commands

```bash
npx @vudovn/ag-kit init
cp AGENTS.md .antigravityrules .agent/ 2>/dev/null || true
```

Then run only the first task:

```text
Read AGENTS.md and tasks/001-monorepo-bootstrap.md. Implement only that task. Do not read the whole handoff.md. Stop after acceptance checks.
```

After the agent finishes, review the diff and commit it yourself. Then give the agent the next numbered task. Never paste the 1000-line handoff into every prompt.

## Generated layout

- `AGENTS.md`: permanent operating rules.
- `.antigravityrules`: same rules for Antigravity.
- `docs/`: small context files loaded on demand.
- `tasks/`: one task per PR, in execution order.
- `handoff.source.md`: original source of truth for reference only.
