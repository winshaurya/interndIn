This folder is intended to contain the frontend application (renamed from `spotlight-seeker-19`).

Currently the original frontend code remains in `spotlight-seeker-19/` in the repository root.

Steps to adopt the rename locally:
1. Move or rename `spotlight-seeker-19` to `frontend` on your local machine:

   - Windows PowerShell:
     Rename-Item -Path .\\spotlight-seeker-19 -NewName frontend

2. Verify `package.json` scripts and run `npm install` then `npm run build` or `npm run dev`.

If you'd like, I can attempt to move all files in-repo (copy them into `frontend/`) — tell me if you want that done here.
