# Security Policy

## Regulatory Compliance

This platform is designed for **Indian law firms and HR/legal teams** navigating the four labour code consolidations. It is built to comply with:

### Information Technology Act, 2000 (IT Act)
- **Section 43A** – Reasonable security practices for handling sensitive personal data (employee records, compliance data).
- **Section 72A** – Protection against unauthorized disclosure of personal information.

### Digital Personal Data Protection Act, 2023 (DPDP Act)
- **Purpose limitation** – Data is processed only for the stated compliance and legal review purpose.
- **Data minimization** – Only necessary document content is extracted and stored.
- **Right to erasure** – Document and analysis data can be deleted upon request.
- **Consent-based processing** – User authentication required for all data operations.

### Indian Evidence Act (Section 65B)
- Audit trail integrity is maintained via cryptographic hash chains in the backend for all document operations.
- All modifications to legal provisions are tracked with user identity, timestamp, and diff metadata.

---

## Technical Security Controls

### Authentication & Authorization
- **NextAuth.js** with JWT strategy; session tokens are HTTP-only, Secure, SameSite.
- **Role-based access control** (RBAC): `admin`, `editor`, `viewer`, `client` roles enforced at middleware level.
- **OAuth 2.0** via Google; credentials bypass only available in `NODE_ENV !== "production"`.
- In production, OAuth secrets **must** be provided — no fallback mock credentials.

### Transport Security
- **HSTS** enforced with 2-year max-age, includeSubDomains, and preload.
- All API traffic encrypted via TLS (enforced by Railway/hosting provider).

### HTTP Security Headers
All responses include:
| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

### Data Protection
- **Pydantic V2 `SecretStr`** used for all secret values (API keys, DB passwords) in the Python backend — prevents accidental logging.
- **Structured JSON logging** (loguru for Python, custom logger for Next.js) — no raw `console.log` with PII.
- **Input sanitization** on all user-facing inputs via React controlled components.
- **Parameterized queries** via Prisma ORM (SQL injection prevention).
- **File upload validation** — restricted to `.pdf`, max 50 MB, with content-type verification.

### Audit Trail
- All critical actions (CRUD on provisions, document uploads, role changes) are logged to an `AuditLog` table with:
  - Actor ID, Organization ID, IP address
  - Action type, Entity type/ID, Metadata payload
  - Immutable timestamp
- Backend document operations maintain a cryptographic hash chain for tamper detection per Indian Evidence Act Section 65B.

### Attack Surface Reduction
- **No pickle deserialization** in application code.
- **CORS** restricted to configured origins only.
- **Rate limiting** configured at 30 RPM on the backend API.
- **File type whitelist** — only `.pdf` accepted for document upload.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Email**: security@[your-domain].com
2. **Do not** create a public GitHub issue for security vulnerabilities.
3. We will acknowledge receipt within 48 hours and provide a remediation timeline.

---

## Dependency Management

- **Frontend**: `npm audit` run in CI on every push; critical/high vulnerabilities block merges.
- **Backend**: `pip-audit` run in CI; known CVEs in `requirements.txt` are flagged.
- **Secret scanning**: TruffleHog runs on every push to detect accidentally committed credentials.
