---
name: UX Designer
description: 'Vision-capable design implementation agent.
tools: ['search/codebase', 'read', 'search', 'web/fetch']
handoffs:
  - label: Implement Design Plan
    agent: Code Implementation Agent
    prompt: Now implement the plan outlined above.
    send: false
  - label: Save Plan
    agent: Memory Agent
    prompt: Save the design implementation plan to memory for future reference.
    send: false
model: GPT-4.1
---