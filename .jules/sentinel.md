## 2024-05-31 - [Critical] Path Traversal via os.path.join in Python
**Vulnerability:** Path Traversal via os.path.join with attacker-controlled absolute paths.
**Learning:** In Python, if the second argument to `os.path.join` is an absolute path (e.g., `/etc/passwd`), `os.path.join` ignores the base path (the first argument) and returns the absolute path directly. When user input, like a file upload's `filename`, is used as the second argument, an attacker can specify an absolute path to write files outside the intended directory.
**Prevention:** Always sanitize filenames from user input by extracting the basename using `os.path.basename` and stripping out directory separators (including Windows backslashes) before passing them to `os.path.join` or other file-handling functions. Example: `safe_filename = os.path.basename(file.filename.replace('\\', '/'))`.

## 2024-05-31 - [Critical] Missing Authentication on API Routes
**Vulnerability:** API routes under `src/app/api` were not protected, allowing unauthenticated access to sensitive endpoints (e.g., `/api/documents`, `/api/parser`, `/api/suggestions`).
**Learning:** Next.js App Router API routes must explicitly validate sessions at the beginning of handlers using `getServerSession(authOptions)`.
**Prevention:** Always use `getServerSession(authOptions)` and check if `session` exists at the very beginning of API route handlers.
