## 2025-02-23 - Memoizing Expensive List Operations
**Learning:** React components were computing derived state (filtering and counting arrays of hundreds of items) directly within the render body. This meant O(n) or even O(n * m) operations were running on every keystroke (e.g., when updating a search query).
**Action:** Extract expensive list processing into `useMemo` hooks with tight dependency arrays. Combine multiple pass loops (like calculating separate counts for Healthy, Warning, and Critical statuses) into a single pass loop within a `useMemo` block.
