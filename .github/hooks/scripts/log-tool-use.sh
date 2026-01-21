#!/bin/bash
#INPUT=$(cat)
#SOURCE=$(echo "$INPUT" | jq -r '.source')
#TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')

#echo "Tool use started from $SOURCE at $TIMESTAMP" >> .github/logs/session.log
echo "Tool use started at $(date)" >> .github/logs/session.log