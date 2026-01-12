# DEMOFLOW3: End-to-End Agentic Coding Workflow

> **Advanced Demo**: Showcasing SDD, custom agents, memory, skills, background agents, worktrees, security gates, vision models, human-in-the-loop, and handoff patterns.

**Prerequisites:**
- [ ] Backend running on `:3000` | Frontend on `:3001`
- [ ] Git on `demo` branch with clean working directory
- [ ] AgentHQ accessible (for monitoring) | [Backup diagram](.github/assets/README.md)
- [ ] Login screen screenshot ready for vision demo

---

## Demo Cleanup Commands

```bash
# "Turn on" - Before demo
./.demo/snapshot.sh

# "Turn off" - After demo  
./.demo/reset.sh --force

# Preview cleanup (dry run)
./.demo/reset.sh --dry-run
```

---

### Demo 1: Setup & Specification-Driven Development
- [ ] **00 Initialize Demo**: Run `.demo/snapshot.sh` to capture workspace state
- [ ] [20 SDD + Background Agent](prompts/20-ts-migration-sdd.prompt.md): Create TypeScript migration spec, delegate to background agent in worktree
- [ ] **02 AgentHQ Dashboard**: Monitor background agent progress (task queue, agent status, resources)

### Demo 2: Vision-Based Login Screen  
- [ ] [21 Login Screen with Vision](prompts/21-login-screen-vision.prompt.md): Human-in-the-loop with Designer agent, iterative feedback loops
### Demo 3: Security & Quality Gates
- [ ] [22 Security Quality Gate](prompts/22-security-gate.prompt.md): Run mock Snyk scan, fix vulnerabilities, run tests, code review handoff

TODO: don't need this step:
### Demo 4: Integration & Cleanup
- [ ] **05 Merge Worktree**: Commit in worktree, create PR, merge to main, remove worktree
- [ ] **06 Demo Reset**: Run `.demo/reset.sh --force` to restore workspace

---

## Key Concepts Demonstrated

| Concept | Where | Highlight |
|---------|-------|-----------|
| **SDD** | Demo 1 | Specification before implementation |
| **Background Agents** | Demo 1 | Non-blocking parallel work in CLI |
| **Worktrees** | Demo 1 | Isolated workspace for experiments |
| **Custom Agents** | Demo 1, 2 | Migration + Designer specialists |
| **Skills** | Demo 1, 2 | Reusable patterns (ts-migration, agent-loops) |
| **Vision Model** | Demo 2 | UI from screenshots |
| **Agent Loops** | Demo 2 | ReAct pattern with checkpoints |
| **Human-in-the-Loop** | Demo 2 | Approval at checkpoints |
| **Tool Invocation** | Demo 3 | Security scanner as quality gate |
| **Handoff** | Demo 3, 4 | Security → Tests → Review → PR |
| **AgentHQ** | Demo 1 | Monitoring and orchestration |

---

**Key Tips & Best Practices:**
- [ ] Context: Start a NEW session for every new task/topic!
- [ ] Customize: via instructions, prompts, custom agents, skills
- [ ] Agent: Use (or build) MCPs and skills where it makes sense
- [ ] Agent: Never "Accept" until happy - review at checkpoints
- [ ] Agent: Restore Checkpoint if needed
- [ ] Background: Delegate long-running tasks to background CLI agents
- [ ] Worktrees: Use for parallel/experimental work without affecting main workspace
- [ ] Quality Gates: Always run security scans and tests before merge
- [ ] Review: Use AI for reviewing code, not just generating it
- [ ] Models: Choose the right model - https://docs.github.com/en/copilot/reference/ai-models/model-comparison
- [ ] CLI: For terminal-native experience with GitHub Copilot

---

## Files Created for This Demo

```
.demo/                              # Demo reset infrastructure
├── snapshot.sh                     # "Turn on" before demo
├── reset.sh                        # "Turn off" after demo
└── README.md                       # Usage documentation

.github/
├── DEMOFLOW3.md                    # This file
├── assets/README.md                # AgentHQ backup diagram
├── agents/
│   ├── Migration.agent.md          # TypeScript migration specialist
│   └── Designer.agent.md           # Vision-based UI implementation
├── skills/
│   ├── ts-migration/SKILL.md       # TS migration patterns
│   └── agent-loops/SKILL.md        # Agent loop patterns  
├── prompts/
│   ├── 20-ts-migration-sdd.prompt.md    # SDD + background agent
│   ├── 21-login-screen-vision.prompt.md # Vision prompt
│   └── 22-security-gate.prompt.md       # Security quality gate
└── tools/snyk-mock/
    ├── scan.js                     # Mock Snyk scanner
    └── package.json                # Package config
```
