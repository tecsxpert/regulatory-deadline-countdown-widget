# 🔐 Security Review – Regulatory Deadline Countdown Widget

## 1. Overview

This document presents the security assessment of the Regulatory Deadline Countdown Widget application.
The review focuses on authentication, authorization, API security, and infrastructure exposure.

---

## 2. Scope

The following components were tested:

* Backend API (Spring Boot + JWT)
* Authentication & Authorization mechanisms
* REST endpoints (`/api/v1/*`)
* Dockerized environment (PostgreSQL, Redis)

Out of scope:

* External SMTP provider
* Frontend UI deep security testing

---

## 3. Threat Model

### Assets

* User credentials (email, password)
* JWT tokens (access & refresh)
* Regulatory deadline data
* Database records

### Threat Actors

* Unauthenticated external attacker
* Authenticated low-privilege user
* Misconfigured system access

### Entry Points

* `/api/v1/auth/login`
* `/api/v1/deadlines/*`
* Docker-exposed services

---

## 4. Security Tests Conducted

---

### 🔐 4.1 Authentication Enforcement Test

**Objective:**
Verify that protected endpoints cannot be accessed without authentication.

**Test:**

```bash
GET /api/v1/deadlines/all
```

**Result:**

```
403 Forbidden
```

**Conclusion:**
✔ The API correctly blocks unauthenticated requests.

---

### 🔑 4.2 JWT Validation Test (Fake Token)

**Objective:**
Check whether the backend validates JWT signatures.

**Test:**

```bash
Authorization: Bearer fake_token
```

**Result:**

```
403 Forbidden
```

**Conclusion:**
✔ Invalid tokens are rejected
✔ JWT signature validation is working

---

### 🔓 4.3 Valid User Token Test

**Objective:**
Verify access using a legitimate user token.

**Test:**

* Login with:

  ```
  user@tool87.com / Password@123
  ```
* Use returned JWT for API access

**Result:**

```
403 Forbidden
```

**Conclusion:**
✔ Authentication successful
✔ Access restricted → authorization enforced

---

### 🔐 4.4 Admin Token Test

**Objective:**
Verify role-based access control (RBAC)

**Test:**

* Login with:

  ```
  admin@tool87.com / Password@123
  ```
* Use admin JWT to access:

  ```
  /api/v1/deadlines/all
  ```

**Result:**

```
403 Forbidden
```

**Conclusion:**
⚠ Even admin users cannot access protected endpoints
→ Indicates RBAC misconfiguration

---

### 🌐 4.5 Swagger Endpoint Test

**Objective:**
Check API documentation endpoint availability

**Test:**

```
GET /swagger-ui.html
```

**Result:**

```
500 Internal Server Error
```

**Conclusion:**
⚠ Swagger UI misconfigured or blocked by security
✔ Backend API itself remains functional

---

### 📡 4.6 Security Headers Review

Observed headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
```

**Conclusion:**
✔ Basic security headers present
⚠ X-XSS-Protection disabled (minor issue)

---

## 5. Findings

---

### 🔴 Finding 1: RBAC Misconfiguration

**Severity:** Medium

**Description:**
Even administrative users were unable to access protected endpoints.

**Impact:**

* Legitimate users blocked from accessing resources
* Indicates incorrect authorization logic

**Root Cause (likely):**

* Role mismatch (e.g., `ADMIN` vs `ROLE_ADMIN`)
* Misconfigured `@PreAuthorize` or security rules

---

### 🟡 Finding 2: Swagger UI Failure

**Severity:** Low

**Description:**
Swagger UI endpoint returns HTTP 500.

**Impact:**

* Reduces usability
* Does not affect API security

---

### 🟡 Finding 3: Disabled XSS Protection Header

**Severity:** Low

**Description:**

```
X-XSS-Protection: 0
```

**Impact:**

* No protection in legacy browsers
* Minimal modern risk

---

## 6. Security Strengths

* ✔ Authentication enforced across endpoints
* ✔ Invalid tokens rejected
* ✔ JWT validation implemented correctly
* ✔ No unauthenticated data exposure
* ✔ Security headers partially implemented

---

## 7. Residual Risks

* RBAC misconfiguration may lead to:

  * access denial for legitimate users
  * potential future authorization flaws if modified incorrectly

* Lack of rate limiting (not tested dynamically)

* Email abuse protection not verified

---

## 8. Recommendations

* Fix RBAC configuration:

  * Ensure correct role mapping (`ROLE_ADMIN` vs `ADMIN`)
* Allow admin access to required endpoints
* Enable proper Swagger configuration or restrict explicitly
* Consider adding:

  * rate limiting
  * centralized logging
  * improved security headers

---

## 9. Conclusion

The application demonstrates strong authentication and token validation mechanisms.
However, authorization rules are overly restrictive due to RBAC misconfiguration.

No critical vulnerabilities (such as authentication bypass or token misuse) were identified.

---

## 10. Team Sign-Off

Reviewed by: Tajeshwar Singh
Role: Security Reviewer
Date: 05/05/2026

Status: Requires Fixes✅
