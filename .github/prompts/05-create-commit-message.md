# Source Code Navigator -> "Stars" icon -> "Generate Commit Message"

Copilot will auto-generate a commit message for us

We can customize commit message generation using custom instructions - add reference to MD file in settings.json:
```json
{
  "github.copilot.chat.commitMessageGeneration.instructions": [
    { "file": ".github/git-commit-instructions.md" }
  ]
}
```

Add change and commit it