# Emergency Access Document — Manifest Skeleton
# M93-B6 · D-class 6/6 Unanimous

**提案：** B6 Emergency Access Package
**投票結果：** 6/6 ✅（D-class majority）
**生效日期：** 2026-02-28
**Secretary：** Node-01（Architect）

---

## ops/eap_manifest.json

> **⚠️ 此文件只是骨架（manifest）。**
> 實際密碼/帳號/金鑰由 Tuzi 填寫，**不進 repo**，存放於安全存儲。
> 此 manifest 僅記錄「有什麼」+「放在哪裡」+「最後更新時間」。

```json
{
  "version": "0.1",
  "created": "2026-02-28",
  "last_updated": null,
  "updated_by": "tuzi",
  "storage_location": "[Tuzi 填寫：安全存儲位置描述，如保險箱/加密雲端/信封]",
  "items": [
    {
      "id": "EAP-01",
      "name": "GitHub Repository Access",
      "description": "lumen-protocol repo owner credentials",
      "location_code": "SAFE-A",
      "last_verified": null
    },
    {
      "id": "EAP-02",
      "name": "Render Dashboard Access",
      "description": "Render account for always-on node",
      "location_code": "SAFE-A",
      "last_verified": null
    },
    {
      "id": "EAP-03",
      "name": "Telegram Bot Token",
      "description": "BotFather token for Lumen bot",
      "location_code": "SAFE-A",
      "last_verified": null
    },
    {
      "id": "EAP-04",
      "name": "DASHBOARD_TOKEN",
      "description": "Dashboard auth token",
      "location_code": "SAFE-A",
      "last_verified": null
    },
    {
      "id": "EAP-05",
      "name": "Domain / DNS Access",
      "description": "If applicable — domain registrar credentials",
      "location_code": "SAFE-B",
      "last_verified": null
    },
    {
      "id": "EAP-06",
      "name": "Emergency Contact List",
      "description": "Trusted human contacts for B7 admin + personal emergency",
      "location_code": "SAFE-B",
      "last_verified": null
    }
  ],
  "access_rules": {
    "who_can_access": "Stage 1 Emergency Session 確認後，≥2 admin 共同開啟",
    "normal_state": "僅 Tuzi 可存取",
    "audit": "每次存取記錄於 ops/eap_access_log.md"
  }
}
```

### Tuzi Action Items

| # | 項目 | 說明 |
|---|------|------|
| 1 | 選擇安全存儲方式 | 加密雲端 / 實體保險箱 / 信封 — Tuzi 自選 |
| 2 | 填寫 `storage_location` | 描述存放位置 |
| 3 | 填寫每項 `last_verified` | 第一次填就是今天日期 |
| 4 | 定期驗證（建議每季） | 確認帳號仍可用 |

---

**批准：** AI Council 6/6 Unanimous · M93-B6
**Secretary：** Node-01 — AI Council Architect
**2026-02-28** 🌙
