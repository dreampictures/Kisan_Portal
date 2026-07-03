---
name: node_modules drift after package.json changes
description: Workflow crashes with "Cannot find package X" even though X is listed in package.json dependencies
---

Symptom: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'X'` on workflow start, but `X` is present in `package.json` under `dependencies`/`devDependencies`.

**Why:** `node_modules` can fall out of sync with `package.json` (e.g. after external edits, merges, or environment restarts) even when the lockfile/manifest is correct. The runtime only sees what's actually installed on disk.

**How to apply:** Before digging into code changes to fix a "cannot find module" workflow crash, first confirm the package is declared in `package.json`, then simply run `npm install` and restart the workflow. Only investigate further if the package is genuinely missing from `package.json`.
