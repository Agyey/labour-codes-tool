## 2024-05-31 - [Critical] Path Traversal via os.path.join in Python
**Vulnerability:** Path Traversal via os.path.join with attacker-controlled absolute paths.
**Learning:** In Python, if the second argument to `os.path.join` is an absolute path (e.g., `/etc/passwd`), `os.path.join` ignores the base path (the first argument) and returns the absolute path directly. When user input, like a file upload's `filename`, is used as the second argument, an attacker can specify an absolute path to write files outside the intended directory.
**Prevention:** Always sanitize filenames from user input by extracting the basename using `os.path.basename` and stripping out directory separators (including Windows backslashes) before passing them to `os.path.join` or other file-handling functions. Example: `safe_filename = os.path.basename(file.filename.replace('\\', '/'))`.
## 2024-03-19 - Missing Authentication in API Route
**Vulnerability:** The `/api/documents` API route (`src/app/api/documents/route.ts`) was missing authentication checks on all its endpoints (`POST`, `GET`, `PATCH`, `DELETE`), allowing anyone to interact with the backend API without a session.
**Learning:** Next.js App Router API routes must be explicitly protected by checking the user's session with `getServerSession` at the beginning of each handler.
**Prevention:** Always require authentication on API endpoints unless they are explicitly designed to be public (e.g., `/api/health`).
