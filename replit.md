# Running this project on Replit

This is a Node.js and Express website with static pages, API routes, and media
assets.

- The Replit run command is `npm run dev`.
- The server listens on `0.0.0.0:5000` by default.
- Dependencies are declared in `package.json`.
- Set `ADMIN_PASSWORD` in Replit Secrets to enable the admin dashboard. There is
  intentionally no built-in default password.

The server currently stores contact submissions and uploaded media under
`data/` and `assets/`. Published app filesystems are not persistent, so migrate
that user-generated data to a database or object storage before relying on it
after publishing.