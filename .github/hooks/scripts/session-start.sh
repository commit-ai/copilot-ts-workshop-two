#!/bin/bash
#INPUT=$(cat)
#SOURCE=$(echo "$INPUT" | jq -r '.source')
#TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')

#echo "Session started from $SOURCE at $TIMESTAMP" >> .github/logs/session.log
echo "Session started at $(date)" >> .github/logs/session.log