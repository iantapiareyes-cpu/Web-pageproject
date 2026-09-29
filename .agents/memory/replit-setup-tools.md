---
name: Replit setup tool behavior
description: Workspace-specific requirements for changing Replit configuration and installing project dependencies.
---

## Replit configuration

For `.replit` changes, write the complete TOML to a temporary file inside the workspace and pass its absolute path to `verifyAndReplaceDotReplit`. Direct patch edits are blocked by the schema guard.

**Why:** The guard validates Replit run, workflow, port, and deployment settings before replacing the configuration.

**How to apply:** Preserve existing workflow and port settings in the replacement file, then verify the resulting workflow and deployment configuration.

## Package installation

`installLanguagePackages` may widen package version ranges in `package.json` to currently available versions even when the imported project already declares its dependencies.

**Why:** Installing dependencies changed the source manifest, which would have introduced unrelated package drift.

**How to apply:** Review `package.json` after installation; if preserving imported ranges, restore them and reconcile or remove any generated lockfile.