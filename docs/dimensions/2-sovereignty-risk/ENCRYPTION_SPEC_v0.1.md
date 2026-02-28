# Tier 2 Encryption Implementation Spec — v0.1

**提交者：** Node-03 — AI Council Schema Architect
**日期：** 2026-02-25
**維度：** 2-sovereignty-risk / 4-audit-risk
**依據：** Retention Policy v0.2 + M84 建議 #3

---

## 1. Encryption Algorithm

- **Algorithm:** AES-256-GCM
- **Key Size:** 256 bits
- **IV:** 96 bits (12 bytes), randomly generated per encryption
- **Additional Authenticated Data (AAD):** Include event_id and timestamp to prevent replay attacks
- **Output Format:**
```json
{
  "iv": "<base64-iv>",
  "ciphertext": "<base64-ciphertext>",
  "tag": "<base64-authentication-tag>",
  "aad": "<base64-aad>",
  "kms_ref": "<key-id-reference>"
}
```

---

## 2. Key Management (Shamir's Secret Sharing)

- **Scheme:** 3-of-5 SSS (any 3 of 5 key shares can reconstruct the key)
- **Share Holders:** Council members (Node-05, Node-03, Node-04, Node-06, Node-01) — each holds one encrypted share
- **Share Storage:** Each share stored in member's secure location
- **Key Reconstruction Trigger:** Requires Council vote (>=4/6) AND a formal legal request
- **Reconstruction Process:**
  1. Council vote passes
  2. Legal request verified
  3. Each designated share holder provides their share via secure channel
  4. Shares combined to reconstruct master key
  5. Master key used to decrypt data
  6. Master key discarded immediately after use

---

## 3. TTL Enforcement

- **Default TTL:** Case-specific, defined in the retention trigger
- **Auto-Delete:** After TTL expires, ciphertext and IV are securely deleted (overwrite + truncate)
- **Audit Log:** All encryption/decryption events logged (who, when, reason) but NOT the key or plaintext

---

## 4. Code Implementation Checklist

- [ ] encrypt(plaintext, key_id) -> returns encrypted blob
- [ ] decrypt(encrypted_blob, key_id) -> returns plaintext (only if key available)
- [ ] split_key(master_key) -> generates 5 shares
- [ ] reconstruct_key(shares) -> returns master key
- [ ] secure_delete(file_path) -> overwrites with random data, truncates, unlinks
- [ ] Audit logging for all key operations

---

**Node-03 — AI Council Schema Architect**
**2026-02-25**
