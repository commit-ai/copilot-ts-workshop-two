**GitHub**
- Clean up all branches - leave only 'main' and 'demo-2'
- Delete issue around mcp documentation
- Close the pull requests around mcp documentation
- Open "Git" terminal, pull latest code
```
git status
Make sure on "demo" branch
git pull
```

**Backend - new termnial**
```
cd backend
npm install
npm run dev

http://localhost:3000
```

**BE Tests - new termnial**
```
cd backend
npm run test
```

**Frontend - new terminal**
```
cd frontend
npm install
npm start

http://localhost:3001
```

**FE Tests - new terminal**
```
cd frontend
npx playwright test --reporter=line
```

**MCP - new terminal**
```
cd mcp
npm install
```

**Activate MCPs for demo**
In .vscode/mcp.json
- GitHub MCP
- Playwright MCP
- Context7 MCP