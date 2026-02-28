# schemas/ — Schema Registry

本目錄收錄 Lumen ISSP 的所有資料結構定義（schemas）。

---

## 命名規則（Naming Convention）

為避免同名覆寫，所有 schema 檔案必須遵守以下命名規則：

- 格式：`<schema-name>-v<MAJOR>.<MINOR>.json`
- 範例：`forecast-result-v1.0.json`、`layer2a-mapping-v0.1.json`

---

## 版本規則（Versioning Rules）

- MAJOR 版本變更：必須更新 `golden/Manifest.json`
- MINOR 版本變更：建議更新 `golden/Manifest.json`
- 舊版本檔案保留，不得刪除或覆寫

---

## 特殊檔案

- `malicious-nodes.schema.json`：狀態 Draft，未正式啟用
