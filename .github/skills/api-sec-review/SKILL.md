---
name: "api-security-review"
description: 'Perform a security review for REST APIs. Use this skill when users want to identify potential security vulnerabilities in their API implementations, such as authentication issues, data validation problems, or exposure of sensitive information. Triggers on requests like "review my API for security issues", "perform an API security audit", or any task related to assessing the security posture of RESTful APIs.'
---

Perform a REST API security review and provide a TODO list of security issues to address.

* Ensure all endpoints are protected by authentication and authorization
* Validate all user inputs and sanitize data
* Implement rate limiting and throttling
* Implement logging and monitoring for security events

Return the TODO list in a Markdown format, grouped by priority and issue type.

Do NOT write any code, just provide the security review TODO list!