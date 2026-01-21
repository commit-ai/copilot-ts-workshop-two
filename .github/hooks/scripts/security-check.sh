#!/bin/bash
#INPUT=$(cat)
#SOURCE=$(echo "$INPUT" | jq -r '.source')
#TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')

#echo "Security check started from $SOURCE at $TIMESTAMP" >> .github/logs/session.log
echo "Security check started at $(date)" >> .github/logs/session.log