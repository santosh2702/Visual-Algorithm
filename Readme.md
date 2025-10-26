# Algorithm Visualizer — DSA Fundamentals

Interactive, step‑by‑step visualizer for the most fundamental Data Structures & Algorithms (DSA) patterns. It shows **code (Python/JS)** and the **execution state** side‑by‑side, with **Play/Step/Reset** controls, a **light/dark** theme toggle, and a **built‑in test runner**.

(https://chatgpt.com/canvas/shared/68fcb4eee6d8819186f3170f5fb13477)

---

## ✨ Features

* **Visual playback** of algorithm steps with highlighted code lines
* **Language toggle**: Python ↔ JavaScript
* **Fundamental patterns included**

  * Two Pointers: **Two Sum (sorted)**
  * Sliding Window: **Longest Substring (no repeat)**
  * Search: **Binary Search**
  * DP: **Kadane (max subarray sum)**
  * Prefix Sum + Hash: **Subarray sum equals k**
  * Monotonic Stack: **Next Greater Element**
  * Intervals: **Merge Intervals**
  * Stack: **Valid Parentheses**
* **Test panel**: click *Run Tests* for quick correctness checks
* **Light/Dark** theme with localStorage persistence
* Clean, modern UI (Tailwind), icons (lucide-react)

---

## 📦 Tech Stack

* **React** (TypeScript)
* **Tailwind CSS** (optional but used for the provided UI)
* **lucide-react** (icons)

> You can drop the `App` component into any React project. Tailwind classes can be replaced with your styling if you prefer.

---

## 🚀 Getting Started

### 1) Prerequisites

* Node.js ≥ 18
* A React app scaffold (Vite/CRA/Next). Vite example shown below.

### 2) Create a new Vite + React project (optional)

```bash
npm create vite@latest dsa-visualizer -- --template react-ts
cd dsa-visualizer
npm install
```

### 3) Install dependencies

```bash
npm install lucide-react
# Optional (recommended UI): Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind (if using):

* Add `"./index.html", "./src/**/*.{ts,tsx}"` to `content` in `tailwind.config.js`.
* Add the Tailwind directives to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4) Add the Visualizer component

Create `src/Visualizer.tsx` and paste the component code from this repository (the file that exports `default function App()`), or import it from your package if published.

### 5) Render it

```tsx
// src/main.tsx (Vite default)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Visualizer' // the exported component from this repo
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### 6) Run

```bash
npm run dev
```

Open the local URL shown by Vite.

---

## 🧭 UI Guide

* **Inputs**: Provide array/string parameters for the selected demo (arrays accept comma/space separated numbers). Some demos auto‑sort arrays for clarity.
* **Playback**: `Play/Pause`, `Next`, `Reset`, and `Speed` controls.
* **Code**: Switch between **Python** and **JavaScript**; the current step’s code line is highlighted.
* **Theme**: Toggle **Light/Dark**; your choice is saved.
* **Tests**: Click **Run Tests** to execute a curated set of unit checks across all demos.

---

## 🧩 Algorithms Included

| Pattern           | Demo                          | What it shows               |       Time | Space |
| ----------------- | ----------------------------- | --------------------------- | ---------: | ----: |
| Two Pointers      | Two Sum (sorted)              | Move L/R to match target    |       O(n) |  O(1) |
| Sliding Window    | Longest Substring (no repeat) | Last seen map + window      |       O(n) |  O(Σ) |
| Binary Search     | Binary Search                 | Mid + bounds shrink         |   O(log n) |  O(1) |
| DP                | Kadane                        | Running best subarray       |       O(n) |  O(1) |
| Prefix Sum + Hash | Subarray Sum = k              | Prefix frequency map        |       O(n) |  O(n) |
| Monotonic Stack   | Next Greater Element          | Decreasing stack of indices |       O(n) |  O(n) |
| Intervals         | Merge Intervals               | Sort + sweep merge          | O(n log n) |  O(n) |
| Stack             | Valid Parentheses             | Push opens, match closes    |       O(n) |  O(n) |

> Σ denotes alphabet size for the sliding window demo.

---

## 🧪 Test Panel

The test runner covers happy paths and key edge cases. It **does not** alter the algorithms; it simply displays PASS/FAIL per case.

Add more tests in the `TestPanel()` function by appending to the `out` list:

```ts
out.push({
  name: "BS: [5] find 1 → -1",
  expected: -1,
  got: binarySearchSolve([5], 1),
  pass: false,
});
out[out.length-1].pass = out[out.length-1].got === out[out.length-1].expected;
```

---

## ➕ Adding a New Demo

Each demo implements the following shape:

```ts
 type Demo = {
   id: string;
   title: string;
   blurb: string;
   code: { python: string; js: string };
   buildSteps: (params: any) => Step[]; // the heart of the visualizer
   Controls: React.FC<{ params: any; setParams: (p:any)=>void }>;
   initialParams: any;
   kind: "array" | "string" | "other";
 };
```

### 1) Provide readable code snippets

* Keep both **Python** and **JS** versions
* Annotate logical lines with comments like `// 1`, `# 1` – used for highlighting.

### 2) Build steps for the visualizer

`buildSteps(params)` must return an **array** of step objects:

```ts
 type Step = { line?: number; description: string; done?: boolean; state: Record<string, any> };
```

* `line`: 1‑indexed code line to highlight
* `description`: human‑readable explanation of what happens
* `state.view`: one of `"array" | "string"` to select the renderer (or custom)
* push `done: true` for terminal steps

### 3) Make a small Controls component

* Accept and validate user input; keep it resilient to empty/malformed values.
* Use `setParams` on `onBlur` to keep typing smooth.

### 4) Register the demo

Append to `DEMOS` with `initialParams` and a concise `blurb`.

---

## 🧑‍💻 Development Notes

* **Robustness**: `buildSteps` is wrapped with a try/catch so malformed inputs won’t crash the app; a message is shown instead.
* **Bounds**: Playback clamps at the last step; Reset returns to 0.
* **State Inspector**: Shows the current step’s important variables.
* **Auto‑sort**: Some demos sort input arrays for clarity (not for correctness assertions).

---

## 🛠️ Troubleshooting

### SyntaxError: *Unexpected token, expected "]"* around tests

A test line was previously truncated. Ensure full statements, e.g.

```ts
out.push({ name: "PS: [1,2,3,-2,5], k=3 → 3", expected: 3, got: subarraySumCountSolve([1,2,3,-2,5], 3), pass: false });
out[out.length-1].pass = out[out.length-1].got === out[out.length-1].expected;
```

### TypeError: *Cannot read properties of undefined (reading 'length')*

Make sure `demo.buildSteps(params)` always returns an **array**. The app already guards this, but custom demos must not return `undefined`.

### Unterminated template / Missing comma in objects

Close arrow functions and template strings, and separate object fields with commas, e.g.:

```ts
const next = () => setIdx(i => i + 1);
steps.push({ description: "Loop finished", state: { ... } }); // comma after description
```

### Empty arrays in Binary Search

Handled; returns `-1`. You can add more tests in `TestPanel` to confirm.

---

## 🧷 Accessibility

* High‑contrast **Light/Dark** themes
* Clear focus states and large clickable targets
* Semantic controls with labels

---

## 📂 Project Structure (suggested)

```
src/
  Visualizer.tsx        # main component (this repo’s file)
  index.css             # Tailwind (optional)
  main.tsx              # mount point
```

---

## 🤝 Contributing

PRs are welcome! Please:

1. Keep demos minimal and explanatory
2. Add at least **two** tests per new demo
3. Avoid changing existing tests unless they are demonstrably wrong

---

## 📜 License

D3

---

## 🙋 FAQ

**Q: Two Sum should return indices or values?**
Currently **indices** on sorted input. If you prefer values, adjust the `twoSumSolve` return and tests accordingly.

**Q: Do I need Tailwind?**
No, but the included UI uses it. You can swap classes for your own CSS.

**Q: Can I plug my own algorithms?**
Yes — add a new demo entry, code snippets, and a `buildSteps` that pushes human‑readable steps.
