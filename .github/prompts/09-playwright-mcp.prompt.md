# Playwright MCP + Chatmode to test the app

Installing the MCP and Chatmode:
- Go to https://promptboost.dev/ and search for "Playwright"
- Install the MCP
- Get the custom Chatmode and install it

Alternatively we can:
- Go to MCP Gallery and find the Playwright MCP:
https://code.visualstudio.com/mcp
- Go to awesome-copilot to find the prompt: https://github.com/github/awesome-copilot


Review the chatmode Playwright prompt:
- Note the **tooling**
- Note the **model**
- Note the **instructions**


Then use Playwright-Tester mode:
```
Explore the website, check how we can improveme to existing tests, improve them, document them, run the tests, fix until all pass reliably.
To run them - navigate into the /frontend folder, and run using this command: "npx playwright test --reporter=line"
Assume frontend server is already running!
```