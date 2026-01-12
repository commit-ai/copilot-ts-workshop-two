# Vision-Based Login Screen Implementation

# Human-in-the-Loop with Designer Agent

**Context:**
- frontend/src/App.js
- frontend/src/App.css
- .github/skills/agent-loops/SKILL.md
---

## Step 1: Add Login Screenshot as Context

Drage and drop the login screen screenshot into the chat to provide visual context.
---

## Step 2: Switch to Designer Agent

In the chat, switch to the **Designer** agent (`@Designer`).

---

## Step 3: Add Prompt

Add this prompt:
```
Implement this login screen design for our Superheroes app.

Requirements:
- Create Login.tsx and Login.css in frontend/src/
- Match the visual design as closely as possible
- Follow our existing App.css color scheme (#282c34 background, #61dafb accent)
- Include username, password fields and login button
- Add basic form validation

Use the agent-loops skill pattern - checkpoint with me for feedback every few iterations.
```

---

## Step 4: Watch the Agent Loop

Observe the Designer agent following the ReAct pattern:
1. **THINK**: Analyzes the screenshot elements
2. **PLAN**: Identifies components to create  
3. **ACT**: Generates Login.tsx and Login.css
4. **OBSERVE**: Checks for errors
5. **CHECKPOINT**: Asks for your feedback

---

## Step 5: Provide Feedback at Checkpoints

When the agent checkpoints, respond with one of:

- ✅ **"Looks good, continue"** - Approve and proceed
- 🔄 **"Make the button corners more rounded"** - Specific adjustment
- ❌ **"Let's try a different layout"** - New approach

---

## Step 6: Final Approval

Once satisfied with the implementation:
```
Looks perfect! Finalize the login component.
```

---

**Key Talking Points:**
- Vision models can interpret design screenshots
- Agent-loops skill provides structured iteration
- Human stays in control with checkpoints
- Max 10 iterations prevents runaway agents
