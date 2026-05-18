---
name: simple-biodata-editor-git-isolation
description: Guidelines for managing multiple GitHub accounts and SSH configurations locally within the simple-biodata-editor repository without affecting other global configurations or repositories.
---

# Git SSH Isolation Skill

This skill outlines the standard operating procedure for configuring repository-specific Git and SSH settings to support multiple GitHub accounts on a single development environment.

## Context & Objectives
- Ensure that pushes/pulls to `git@github.com:Sohidul-Islam/simple-biodata-editor.git` use the designated SSH key for the `Sohidul-Islam` GitHub account.
- Prevent any changes from leaking into the global SSH configuration or affecting other repositories (which may use different accounts like `shaheen2013`).

## Isolation Strategy
1. **Repository-Local Git Config**:
   - Use `git config --local` for all identity configurations (`user.name`, `user.email`).
   - Configure local `core.sshCommand` to point directly to the repository-specific private key:
     `git config --local core.sshCommand "ssh -i ~/.ssh/id_sohidul_islam -o IdentitiesOnly=yes -F /dev/null"`
2. **Key Generation**:
   - Create a dedicated Ed25519 SSH key pair for the repository:
     `ssh-keygen -t ed25519 -C "sishufol.sim@gmail.com" -f ~/.ssh/id_sohidul_islam -N ""`
3. **Verification**:
   - Test connection using: `ssh -i ~/.ssh/id_sohidul_islam -T git@github.com`
