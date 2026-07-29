# Lego Block: `validation/cron-parser`

Standard 5-field crontab pattern parser to validate schedules and resolve subsequent matching execution timestamps.

> [!NOTE]
> **AI Agent Context:** Use this block to parse standard crontab patterns ('* * * * *') and compute the next scheduled execution times.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/cron-parser
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `cronString` | `string` | ⚠️ Yes | *-* | The crontab configuration pattern (5 fields: minute hour dayOfMonth month dayOfWeek). |


### Tags

*None*

### Use Cases

*None*

---

## System Compatibility

| Runtime Environment | Status |
|---|---|
| **Browsers (Chrome, Safari, Firefox, Edge)** | ✅ Supported |
| **Node.js** | ✅ Supported |
| **Deno** | ✅ Supported |
| **Bun** | ✅ Supported |

---

## Computational Complexity

* **Time Complexity:** `O(D) cron intervals validation search steps`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
