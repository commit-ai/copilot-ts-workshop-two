# Frontend Refactor: Compare Superheroes via API

# New Chat: Sonnet 4

Refactor superheros comparison logic in the frontend, to use a dedicated API endpoint for comparison instead of JavaScript logic. 
Keep the UI as it is and don't change anything in the view.

Make changes only in /frontend folder, don't touch /backend

The backend API is at:
```
/api/superheroes/compare?id1=1&id2=2
```
where id1 and id2 are superhero ids.

It returns the comparison result in the following format:
```json
{
  "id1": <number>,
  "id2": <number>,
  "categories": [
    {
      "name": "strength",
      "winner": 1 | 2 | "tie",
      "id1_value": <number>,
      "id2_value": <number>
    },
    // ... one object for each category in the specified order
  ],
  "overall_winner": 1 | 2 | "tie"
}
```

Clean up all redundant code, dependencies and comments following the refactor!

Stop condition: 
Run all e2e Playwrite tests to ensure the comparison feature works as expected.

---
Let's run a quick check ourselves in our Simple Browser:
Cmd + Shift + P: Simple Browser
```
http://localhost:3001
```