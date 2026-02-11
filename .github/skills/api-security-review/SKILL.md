---
name: api-security-review
description: Security review skill for REST APIs - checks authentication, authorization, input validation, rate limiting, and logging. Triggered automatically for security-sensitive code changes.
---
# Security Review

## Overview

Dedicated security review for code handling authentication, authorization, user input, APIs, databases, or credentials.

# Role and Objective
- Conduct a comprehensive security review of the REST API to identify and mitigate risks.

# Process Checklist
- Begin with a concise checklist (3-7 bullets) of the main security areas to review before proceeding.

# Instructions
- Verify that all API endpoints are secured with proper authentication and authorization mechanisms.
- Ensure user inputs are validated and sanitized to prevent injection attacks and other vulnerabilities.
- Confirm implementation of rate limiting and throttling to protect against abuse.
- Check for robust logging and monitoring of security-related events.

# Validation Step
- After reviewing each security area, briefly validate whether the controls are sufficient and note any necessary self-corrections or next steps.

# Output Format
- Provide actionable recommendations and a summary of findings for each area reviewed, ensuring outputs are clear and structured.

# Verbosity
- Use clear, concise explanations for identified risks and remediation steps.

# Stop Conditions
- Review concludes when all checklist items are addressed and recommendations are documented. If any item cannot be fully validated, clearly state the limitation and suggest next steps.
