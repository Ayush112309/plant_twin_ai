# 🛡 Security & Compliance Policy

## Reporting Security Vulnerabilities

The PlantTwin AI Engineering team takes security seriously. If you discover a vulnerability or security flaw, please do NOT create a public GitHub issue. 

Please report vulnerabilities directly to our security response team:
- **Email**: `security@planttwin.ai`

---

## 🔒 Security Architecture Standards

1. **Authentication & JWT**:
   - Access tokens are signed using HMAC-SHA256 (HS256) algorithms.
   - Tokens contain user ID, tenant organization ID, and RBAC persona roles.

2. **Audit Logging & Governance**:
   - All industrial write operations (e.g. PLC memory writes via S7comm or Modbus) are recorded in an append-only SOC-2 compliant audit trail (`/api/v1/identity/audit`).

3. **Role-Based Access Control (RBAC)**:
   - Enforced across frontend action buttons and FastAPI endpoint dependencies (`Depends(require_admin)`).
