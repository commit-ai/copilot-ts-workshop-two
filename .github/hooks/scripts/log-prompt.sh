#!/bin/bash
#INPUT=$(cat)
#SOURCE=$(echo "$INPUT" | jq -r '.source')
#TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')

#echo "Prompt logged from $SOURCE at $TIMESTAMP" >> .github/logs/session.log
echo "Prompt logged at $(date)" >> .github/logs/session.log