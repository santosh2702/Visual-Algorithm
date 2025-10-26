import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, StepForward, RotateCcw, Check, X, Sun, Moon } from "lucide-react";

/**
 * Algorithm Visualizer — Light/Dark Theme
 * --------------------------------------
 * Fundamental DSA patterns with Python/JS code toggle, step-by-step playback,
 * robust test panel, and a theme toggle (Light/Dark) with persistence.
 */

// ---------- Types ----------

type Step = {
  line?: number; // 1-indexed code line highlight
  description: string;
  done?: boolean;
  state: Record<string, any>;
};

type Demo = {
  id: string;
  title: string;
  blurb: string;
  code: { python: string; js: string };
  buildSteps: (params: any) => Step[];
  Controls: React.FC<{ params: any; setParams: (p: any) => void }>;
  initialParams: any;
  kind: "array" | "string" | "other";
};

// ---------- Utilities ----------

function parseArrayInput(input: string): number[] {
  return (input || "")
    .split(/[\,\s]+/)
    .filter(Boolean)
    .map((x) => Number(x.trim()))
    .filter((x) => !Number.isNaN(x));
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// ---------- Pure Solutions (for Test Runner) ----------

function twoSumSolve(arr: number[], target: number): [number, number] {
  let l = 0, r = arr.length - 1;
  while (l < r) {
    const sum = arr[l] + arr[r];
    if (sum === target) return [l, r];
    if (sum < target) l++; else r--;
  }
  return [-1, -1];
}

function longestSubstringSolve(s: string): number {
  let l = 0, best = 0; const pos: Partial<Record<string, number>> = {};
  for (let r = 0; r < s.length; r++) {
    const ch = s[r];
    if (pos[ch] !== undefined && (pos[ch] as number) >= l) l = (pos[ch] as number) + 1;
    pos[ch] = r;
    best = Math.max(best, r - l + 1);
  }
  return best;
}

function binarySearchSolve(arr: number[], target: number): number {
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1;
    if (arr[m] === target) return m;
    if (arr[m] < target) l = m + 1; else r = m - 1;
  }
  return -1;
}

function kadaneSolve(arr: number[]): number {
  let best = -Infinity, cur = 0;
  for (const x of arr) { cur = Math.max(x, cur + x); best = Math.max(best, cur); }
  return best;
}

function subarraySumCountSolve(arr: number[], k: number): number {
  const freq = new Map<number, number>(); freq.set(0, 1);
  let sum = 0, count = 0;
  for (const x of arr) { sum += x; count += freq.get(sum - k) || 0; freq.set(sum, (freq.get(sum) || 0) + 1); }
  return count;
}

function nextGreaterElementSolve(arr: number[]): number[] {
  const n = arr.length, res = new Array(n).fill(-1), st: number[] = [];
  for (let i = 0; i < n; i++) {
    while (st.length && arr[i] > arr[st[st.length - 1]]) { const j = st.pop()!; res[j] = arr[i]; }
    st.push(i);
  }
  return res;
}

function mergeIntervalsSolve(a: number[][]): number[][] {
  const arr = Array.isArray(a) ? a.map((x) => x.slice()).filter((x) => x.length === 2) : [];
  arr.sort((x, y) => x[0] - y[0]);
  const res: number[][] = [];
  for (const it of arr) {
    if (!res.length || it[0] > res[res.length - 1][1]) res.push(it.slice());
    else res[res.length - 1][1] = Math.max(res[res.length - 1][1], it[1]);
  }
  return res;
}

function validParenthesesSolve(s: string): boolean {
  const st: string[] = []; const mp: Record<string, string> = {")":"(", "]":"[", "}":"{"};
  for (const ch of s || "") { if (ch in mp) { if (!st.length || st.pop() !== mp[ch]) return false; } else st.push(ch); }
  return st.length === 0;
}

// ---------- Code Snippets ----------

const twoSumCode = {
  js: `// Two Sum on a sorted array using Two-Pointers
let l = 0, r = arr.length - 1;                   // 1
while (l < r) {                                   // 2
  const sum = arr[l] + arr[r];                    // 3
  if (sum === target) return [l, r];              // 4
  else if (sum < target) l++;                     // 5
  else r--;                                       // 6
}                                                // 7
return [-1, -1];                                  // 8`,
  python: `# Two Sum on a sorted array using Two-Pointers
l, r = 0, len(arr) - 1                           # 1
while l < r:                                     # 2
    s = arr[l] + arr[r]                          # 3
    if s == target:                              # 4
        return [l, r]
    elif s < target:                             # 5
        l += 1
    else:                                        # 6
        r -= 1
# 7
return [-1, -1]                                  # 8`,
};

const lsCode = {
  js: `// Sliding Window: Longest Substring Without Repeating Characters
let l = 0; const pos = {}; let best = 0;          // 1
for (let r = 0; r < s.length; r++) {              // 2
  const ch = s[r];                                 // 3
  if (pos[ch] >= l) l = pos[ch] + 1;              // 4
  pos[ch] = r;                                     // 5
  best = Math.max(best, r - l + 1);                // 6
}                                                  // 7
return best;                                       // 8`,
  python: `# Sliding Window: Longest Substring Without Repeating Characters
l = 0; best = 0; pos = {}                         # 1
for r in range(len(s)):                           # 2
    ch = s[r]                                     # 3
    if ch in pos and pos[ch] >= l:                # 4
        l = pos[ch] + 1
    pos[ch] = r                                   # 5
    best = max(best, r - l + 1)                   # 6
# 7
return best                                       # 8`,
};

const bsCode = {
  js: `// Binary Search — return index or -1 (sorted asc)
let l = 0, r = arr.length - 1;                   // 1
while (l <= r) {                                  // 2
  const m = (l + r) >> 1;                         // 3
  if (arr[m] === target) return m;                // 4
  else if (arr[m] < target) l = m + 1;            // 5
  else r = m - 1;                                 // 6
}                                                 // 7
return -1;                                        // 8`,
  python: `# Binary Search — return index or -1 (sorted asc)
l, r = 0, len(arr) - 1                           # 1
while l <= r:                                    # 2
    m = (l + r) // 2                              # 3
    if arr[m] == target:                          # 4
        return m
    elif arr[m] < target:                         # 5
        l = m + 1
    else:                                         # 6
        r = m - 1
# 7
return -1                                         # 8`,
};

const kadaneCode = {
  js: `// Kadane — maximum subarray sum
let best = -Infinity, cur = 0;                   // 1
for (const x of arr) {                            // 2
  cur = Math.max(x, cur + x);                     // 3
  best = Math.max(best, cur);                     // 4
}                                                 // 5
return best;                                      // 6`,
  python: `# Kadane — maximum subarray sum
best, cur = float('-inf'), 0                     # 1
for x in arr:                                     # 2
    cur = max(x, cur + x)                         # 3
    best = max(best, cur)                         # 4
# 5
return best                                       # 6`,
};

const psCode = {
  js: `// Count subarrays whose sum equals k (handles negatives)
const freq = new Map(); freq.set(0, 1);          // 1
let sum = 0, count = 0;                           // 2
for (const x of arr) {                            // 3
  sum += x;                                       // 4
  count += (freq.get(sum - k) || 0);              // 5
  freq.set(sum, (freq.get(sum) || 0) + 1);        // 6
}                                                 // 7
return count;                                     // 8`,
  python: `# Count subarrays whose sum equals k (handles negatives)
freq = {0: 1}                                     # 1
sum_ = 0; count = 0                               # 2
for x in arr:                                     # 3
    sum_ += x                                     # 4
    count += freq.get(sum_ - k, 0)                # 5
    freq[sum_] = freq.get(sum_, 0) + 1            # 6
# 7
return count                                      # 8`,
};

const ngeCode = {
  js: `// Next Greater Element — monotonic decreasing stack of indices
const res = Array(arr.length).fill(-1);           // 1
const st = [];                                    // 2
for (let i = 0; i < arr.length; i++) {            // 3
  while (st.length && arr[i] > arr[st[st.length-1]]) { // 4
    const j = st.pop();                            // 5
    res[j] = arr[i];                               // 6
  }
  st.push(i);                                      // 7
}                                                  // 8
return res;                                        // 9`,
  python: `# Next Greater Element — monotonic decreasing stack of indices
res = [-1]*len(arr)                               # 1
st = []                                           # 2
for i in range(len(arr)):                         # 3
    while st and arr[i] > arr[st[-1]]:            # 4
        j = st.pop()                               # 5
        res[j] = arr[i]                            # 6
    st.append(i)                                   # 7
# 8
return res                                         # 9`,
};

const miCode = {
  js: `// Merge Intervals — sort by start then sweep
arr.sort((a,b)=>a[0]-b[0]);                        // 1
const res = [];                                    // 2
for (const it of arr) {                            // 3
  if (!res.length || it[0] > res[res.length-1][1]) // 4
    res.push([it[0], it[1]]);                      // 5
  else                                             // 6
    res[res.length-1][1] = Math.max(res[res.length-1][1], it[1]); // 7
}                                                  // 8
return res;                                        // 9`,
  python: `# Merge Intervals — sort by start then sweep
arr.sort(key=lambda x: x[0])                      # 1
res = []                                          # 2
for it in arr:                                     # 3
    if not res or it[0] > res[-1][1]:              # 4
        res.append([it[0], it[1]])                 # 5
    else:                                          # 6
        res[-1][1] = max(res[-1][1], it[1])       # 7
# 8
return res                                         # 9`,
};

const vpCode = {
  js: `// Valid Parentheses — stack
const st = []; const mp = {')':'(', ']':'[', '}':'{'}; // 1
for (const ch of s) {                                   // 2
  if (mp[ch]) {                                         // 3
    if (!st.length || st.pop() !== mp[ch]) return false;// 4
  } else {                                              // 5
    st.push(ch);                                        // 6
  }
}                                                       // 7
return st.length === 0;                                 // 8`,
  python: `# Valid Parentheses — stack
st = []; mp = {')':'(', ']':'[', '}':'{'}              # 1
for ch in s:                                            # 2
    if ch in mp:                                        # 3
        if not st or st.pop() != mp[ch]:                # 4
            return False
    else:                                               # 5
        st.append(ch)                                   # 6
# 7
return len(st) == 0                                     # 8`,
};

// ---------- Step Builders & Controls ----------

function buildTwoSumSteps(params: { arr?: number[]; target?: number }) {
  const steps: Step[] = [];
  const arr = Array.isArray(params?.arr) ? [...params!.arr!] : [];
  const target = Number.isFinite(params?.target as number) ? (params!.target as number) : 0;
  let l = 0, r = arr.length - 1;
  steps.push({ line: 1, description: `Initialize l=0, r=${r}`, state: { view: "array", arr, l, r, target } });
  while (l < r) {
    steps.push({ line: 2, description: `l < r → ${l} < ${r}`, state: { view: "array", arr, l, r, target } });
    const sum = arr[l] + arr[r];
    steps.push({ line: 3, description: `sum=${arr[l]}+${arr[r]}=${sum}`, state: { view: "array", arr, l, r, sum, target } });
    if (sum === target) { steps.push({ line: 4, description: `Found indices [${l}, ${r}]`, state: { view: "array", arr, l, r, sum, target }, done: true }); return steps; }
    else if (sum < target) { steps.push({ line: 5, description: `sum < target → l++`, state: { view: "array", arr, l, r, sum, target } }); l++; }
    else { steps.push({ line: 6, description: `sum > target → r--`, state: { view: "array", arr, l, r, sum, target } }); r--; }
  }
  steps.push({ line: 7, description: `Loop end`, state: { view: "array", arr, l, r, target } });
  steps.push({ line: 8, description: `Return [-1,-1]`, state: { view: "array", arr, l, r, target }, done: true });
  return steps;
}

const TwoSumControls: Demo["Controls"] = ({ params, setParams }) => {
  const [arrInput, setArrInput] = useState(Array.isArray(params?.arr) ? params.arr.join(", ") : "");
  const [target, setTarget] = useState(String(Number.isFinite(params?.target) ? params.target : 14));
  useEffect(() => { setArrInput(Array.isArray(params?.arr) ? params.arr.join(", ") : ""); setTarget(String(Number.isFinite(params?.target) ? params.target : 14)); }, [params]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-gray-600 dark:text-zinc-400">Sorted array (comma/space)</span>
        <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={arrInput} onChange={(e) => setArrInput(e.target.value)} onBlur={() => setParams({ ...params, arr: parseArrayInput(arrInput).sort((a, b) => a - b) })} placeholder="1, 4, 6, 8, 10"/>
      </label>
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-gray-600 dark:text-zinc-400">Target</span>
        <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={target} onChange={(e) => setTarget(e.target.value)} onBlur={() => setParams({ ...params, target: Number(target) })} placeholder="14"/>
      </label>
      <div className="text-xs text-gray-600 dark:text-zinc-400 flex items-end">Tip: I auto-sort the list.</div>
    </div>
  );
};

function buildLSSteps(params: { s?: string }) {
  const steps: Step[] = [];
  const s = typeof params?.s === "string" ? params!.s! : "";
  let l = 0; const pos: Partial<Record<string, number>> = {}; let best = 0;
  steps.push({ line: 1, description: `Init l=0, best=0`, state: { view: "string", s, l, r: -1, best, pos: { ...pos } } });
  for (let r = 0; r < s.length; r++) {
    steps.push({ line: 2, description: `r=${r}`, state: { view: "string", s, l, r, best, pos: { ...pos } } });
    const ch = s[r]; steps.push({ line: 3, description: `ch='${ch}'`, state: { view: "string", s, l, r, ch, best, pos: { ...pos } } });
    if (pos[ch] !== undefined && (pos[ch] as number) >= l) { const prev = pos[ch] as number; steps.push({ line: 4, description: `duplicate at ${prev} → l=${prev + 1}`, state: { view: "string", s, l, r, ch, best, pos: { ...pos } } }); l = prev + 1; }
    else { steps.push({ line: 4, description: `no duplicate in window`, state: { view: "string", s, l, r, ch, best, pos: { ...pos } } }); }
    pos[ch] = r; steps.push({ line: 5, description: `pos['${ch}']=${r}`, state: { view: "string", s, l, r, ch, best, pos: { ...pos } } });
    const len = r - l + 1; const oldBest = best; best = Math.max(best, len);
    steps.push({ line: 6, description: `best=max(${oldBest}, ${len}) → ${best}`, state: { view: "string", s, l, r, ch, best, pos: { ...pos }, windowLen: len } });
  }
  steps.push({ line: 7, description: `Loop finished`, state: { view: "string", s, l, r: s.length - 1, best, pos: { ...pos } } });
  steps.push({ line: 8, description: `Return best=${best}`, state: { view: "string", s, l, r: s.length - 1, best, pos: { ...pos } }, done: true });
  return steps;
}

const LSControls: Demo["Controls"] = ({ params, setParams }) => {
  const [value, setValue] = useState(typeof params?.s === "string" ? params.s : "");
  useEffect(() => setValue(typeof params?.s === "string" ? params.s : ""), [params]);
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-gray-600 dark:text-zinc-400">String</span>
      <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={value} onChange={(e) => setValue(e.target.value)} onBlur={() => setParams({ ...params, s: value })} placeholder="abrkaabcdefghijjxxx"/>
    </label>
  );
};

function buildBSSteps(params: { arr?: number[]; target?: number }) {
  const steps: Step[] = [];
  const arr = Array.isArray(params?.arr) ? [...params!.arr!].sort((a, b) => a - b) : [];
  let target = Number.isFinite(params?.target as number) ? (params!.target as number) : 0;
  let l = 0, r = arr.length - 1;
  steps.push({ line: 1, description: `Init l=0, r=${r}`, state: { view: "array", arr, l, r, target } });
  while (l <= r) {
    steps.push({ line: 2, description: `l<=r → ${l}<=${r}`, state: { view: "array", arr, l, r, target } });
    const m = (l + r) >> 1; steps.push({ line: 3, description: `m=(l+r)//2 → ${m}`, state: { view: "array", arr, l, r, m, target } });
    if (arr[m] === target) { steps.push({ line: 4, description: `arr[m]===target ✓ index=${m}`, state: { view: "array", arr, l, r, m, target }, done: true }); return steps; }
    else if (arr[m] < target) { steps.push({ line: 5, description: `arr[m]<target → l=${m + 1}`, state: { view: "array", arr, l, r, m, target } }); l = m + 1; }
    else { steps.push({ line: 6, description: `arr[m]>target → r=${m - 1}`, state: { view: "array", arr, l, r, m, target } }); r = m - 1; }
  }
  steps.push({ line: 7, description: `Loop end`, state: { view: "array", arr, l, r, target } }); steps.push({ line: 8, description: `Return -1`, state: { view: "array", arr, l, r, target }, done: true }); return steps;
}

const BSControls: Demo["Controls"] = ({ params, setParams }) => {
  const [arrInput, setArrInput] = useState(Array.isArray(params?.arr) ? params.arr.join(", ") : "");
  const [target, setTarget] = useState(String(Number.isFinite(params?.target) ? params.target : 7));
  useEffect(() => { setArrInput(Array.isArray(params?.arr) ? params.arr.join(", ") : ""); setTarget(String(Number.isFinite(params?.target) ? params.target : 7)); }, [params]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-gray-600 dark:text-zinc-400">Array (comma/space)</span>
        <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={arrInput} onChange={(e) => setArrInput(e.target.value)} onBlur={() => setParams({ ...params, arr: parseArrayInput(arrInput) })} placeholder="1,3,5,7,9"/>
      </label>
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-gray-600 dark:text-zinc-400">Target</span>
        <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={target} onChange={(e) => setTarget(e.target.value)} onBlur={() => setParams({ ...params, target: Number(target) })} placeholder="7"/>
      </label>
      <div className="text-xs text-gray-600 dark:text-zinc-400 flex items-end">Array auto-sorted for viz.</div>
    </div>
  );
};

function buildKadaneSteps(params: { arr?: number[] }) {
  const steps: Step[] = [];
  const arr = Array.isArray(params?.arr) ? [...params!.arr!] : [];
  let best = -Infinity, cur = 0;
  steps.push({ line: 1, description: `Init best=-∞, cur=0`, state: { view: "array", arr, best, cur } });
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i]; const newCur = Math.max(x, cur + x);
    steps.push({ line: 2, description: `i=${i}, x=${x}`, state: { view: "array", arr, i } });
    steps.push({ line: 3, description: `cur=max(${x}, ${cur}+${x}) → ${newCur}`, state: { view: "array", arr, i, curBefore: cur, x, cur: newCur } });
    cur = newCur; const newBest = Math.max(best, cur);
    steps.push({ line: 4, description: `best=max(${best}, ${cur}) → ${newBest}`, state: { view: "array", arr, i, cur, best: newBest } });
    best = newBest;
  }
  steps.push({ line: 5, description: `Loop end`, state: { view: "array", arr, best, cur } });
  steps.push({ line: 6, description: `Return best=${best}`, state: { view: "array", arr, best, cur }, done: true });
  return steps;
}

const KadaneControls: Demo["Controls"] = ({ params, setParams }) => {
  const [arrInput, setArrInput] = useState(Array.isArray(params?.arr) ? params.arr.join(", ") : "");
  useEffect(() => setArrInput(Array.isArray(params?.arr) ? params.arr.join(", ") : ""), [params]);
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-gray-600 dark:text-zinc-400">Array (comma/space)</span>
      <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={arrInput} onChange={(e) => setArrInput(e.target.value)} onBlur={() => setParams({ ...params, arr: parseArrayInput(arrInput) })} placeholder="-2,1,-3,4,-1,2,1,-5,4"/>
    </label>
  );
};

function buildPSSteps(params: { arr?: number[]; k?: number }) {
  const steps: Step[] = [];
  const arr = Array.isArray(params?.arr) ? [...params!.arr!] : [];
  const k = Number.isFinite(params?.k as number) ? (params!.k as number) : 0;
  const freq = new Map<number, number>(); freq.set(0, 1);
  let sum = 0, count = 0;
  steps.push({ line: 1, description: `freq={0:1}`, state: { view: "array", arr, k, sum, count, freq: { 0: 1 } } });
  steps.push({ line: 2, description: `sum=0, count=0`, state: { view: "array", arr, k, sum, count } });
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i]; steps.push({ line: 3, description: `i=${i}, x=${x}`, state: { view: "array", arr, i, k, sum, count } });
    sum += x; steps.push({ line: 4, description: `sum+=x → ${sum}`, state: { view: "array", arr, i, k, sum, count } });
    const add = freq.get(sum - k) || 0; count += add; steps.push({ line: 5, description: `add freq(sum-k=${sum - k})=${add} → count=${count}`, state: { view: "array", arr, i, k, sum, count } });
    freq.set(sum, (freq.get(sum) || 0) + 1); steps.push({ line: 6, description: `freq[${sum}]=${freq.get(sum)}`, state: { view: "array", arr, i, k, sum, count } });
  }
  steps.push({ line: 7, description: `Loop end`, state: { view: "array", arr, k, sum, count } });
  steps.push({ line: 8, description: `Return count=${count}`, state: { view: "array", arr, k, sum, count }, done: true });
  return steps;
}

const PSControls: Demo["Controls"] = ({ params, setParams }) => {
  const [arrInput, setArrInput] = useState(Array.isArray(params?.arr) ? params.arr.join(", ") : "");
  const [k, setK] = useState(String(Number.isFinite(params?.k) ? params.k : 3));
  useEffect(() => { setArrInput(Array.isArray(params?.arr) ? params.arr.join(", ") : ""); setK(String(Number.isFinite(params?.k) ? params.k : 3)); }, [params]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-gray-600 dark:text-zinc-400">Array (comma/space)</span>
        <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={arrInput} onChange={(e) => setArrInput(e.target.value)} onBlur={() => setParams({ ...params, arr: parseArrayInput(arrInput) })} placeholder="1,2,3,-2,5"/>
      </label>
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-gray-600 dark:text-zinc-400">k (target sum)</span>
        <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={k} onChange={(e) => setK(e.target.value)} onBlur={() => setParams({ ...params, k: Number(k) })} placeholder="3"/>
      </label>
      <div className="text-xs text-gray-600 dark:text-zinc-400 flex items-end">Handles negatives via prefix-hash.</div>
    </div>
  );
};

function buildNGESteps(params: { arr?: number[] }) {
  const steps: Step[] = [];
  const arr = Array.isArray(params?.arr) ? [...params!.arr!] : [];
  const res = new Array(arr.length).fill(-1);
  const st: number[] = [];
  steps.push({ line: 1, description: `res filled with -1`, state: { view: "array", arr, res: [...res] } });
  steps.push({ line: 2, description: `stack = []`, state: { view: "array", arr, res: [...res], stack: [] } });
  for (let i = 0; i < arr.length; i++) {
    steps.push({ line: 3, description: `i=${i}, val=${arr[i]}`, state: { view: "array", arr, i, stack: [...st], res: [...res] } });
    while (st.length && arr[i] > arr[st[st.length - 1]]) {
      steps.push({ line: 4, description: `arr[i]=${arr[i]} > arr[top]=${arr[st[st.length - 1]]}`, state: { view: "array", arr, i, stack: [...st], res: [...res] } });
      const j = st.pop()!; res[j] = arr[i];
      steps.push({ line: 5, description: `pop j=${j}`, state: { view: "array", arr, i, j, stack: [...st], res: [...res] } });
      steps.push({ line: 6, description: `res[${j}]=${arr[i]}`, state: { view: "array", arr, i, j, stack: [...st], res: [...res] } });
    }
    st.push(i); steps.push({ line: 7, description: `push i=${i}`, state: { view: "array", arr, i, stack: [...st], res: [...res] } });
  }
  steps.push({ line: 8, description: `loop end`, state: { view: "array", arr, stack: [...st], res: [...res] } });
  steps.push({ line: 9, description: `return res`, state: { view: "array", arr, res: [...res] }, done: true });
  return steps;
}

const NGEControls: Demo["Controls"] = ({ params, setParams }) => {
  const [arrInput, setArrInput] = useState(Array.isArray(params?.arr) ? params.arr.join(", ") : "");
  useEffect(() => setArrInput(Array.isArray(params?.arr) ? params.arr.join(", ") : ""), [params]);
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-gray-600 dark:text-zinc-400">Array</span>
      <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={arrInput} onChange={(e) => setArrInput(e.target.value)} onBlur={() => setParams({ ...params, arr: parseArrayInput(arrInput) })} placeholder="2,1,2,4,3"/>
    </label>
  );
};

function buildMISteps(params: { text?: string }) {
  const steps: Step[] = [];
  const raw = (params?.text || "").trim();
  const parsed: number[][] = raw ? raw.split(/\s+/).map((tok) => { const m = tok.match(/\[(.*),(.*)\]/); if (!m) return [0, 0]; return [Number(m[1]), Number(m[2])]; }) : [];
  const arr = parsed.map((x) => x.slice());
  steps.push({ line: 1, description: `sort by start`, state: { view: "array", arr: arr.map((x) => `[${x[0]},${x[1]}]`) } });
  arr.sort((a, b) => a[0] - b[0]);
  const res: number[][] = [];
  steps.push({ line: 2, description: `res=[]`, state: { view: "array", arr: arr.map((x) => `[${x[0]},${x[1]}]`), res: [] } });
  for (const it of arr) {
    steps.push({ line: 3, description: `it=[${it[0]},${it[1]}]`, state: { view: "array", arr: arr.map((x) => `[${x[0]},${x[1]}]`), res: res.map((x) => `[${x[0]},${x[1]}]`) } });
    if (!res.length || it[0] > res[res.length - 1][1]) { res.push([it[0], it[1]]); steps.push({ line: 5, description: `push`, state: { view: "array", res: res.map((x) => `[${x[0]},${x[1]}]`) } }); }
    else { res[res.length - 1][1] = Math.max(res[res.length - 1][1], it[1]); steps.push({ line: 7, description: `merge → [${res[res.length - 1][0]},${res[res.length - 1][1]}]`, state: { view: "array", res: res.map((x) => `[${x[0]},${x[1]}]`) } }); }
  }
  steps.push({ line: 9, description: `return res`, state: { view: "array", res: res.map((x) => `[${x[0]},${x[1]}]`) }, done: true });
  return steps;
}

const MIControls: Demo["Controls"] = ({ params, setParams }) => {
  const [value, setValue] = useState(typeof params?.text === "string" ? params.text : "");
  useEffect(() => setValue(typeof params?.text === "string" ? params.text : ""), [params]);
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-gray-600 dark:text-zinc-400">Intervals (e.g. [1,3] [2,6] [8,10])</span>
      <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={value} onChange={(e) => setValue(e.target.value)} onBlur={() => setParams({ ...params, text: value })} placeholder="[1,3] [2,6] [8,10] [15,18]"/>
    </label>
  );
};

function buildVPSteps(params: { s?: string }) {
  const steps: Step[] = [];
  const s = typeof params?.s === "string" ? params.s : ""; const st: string[] = [];
  const mp: Record<string, string> = {")":"(", "]":"[", "}":"{"};
  steps.push({ line: 1, description: `init stack, map`, state: { view: "string", s, stack: [], mp } });
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]; steps.push({ line: 2, description: `i=${i}, ch='${ch}'`, state: { view: "string", s, i, ch, stack: [...st] } });
    if (mp[ch]) { steps.push({ line: 3, description: `closing '${ch}'`, state: { view: "string", s, i, ch, stack: [...st] } });
      if (!st.length || st.pop() !== mp[ch]) { steps.push({ line: 4, description: `mismatch → false`, state: { view: "string", s, i, ch }, done: true }); return steps; }
      steps.push({ line: 4, description: `match pop`, state: { view: "string", s, i, ch, stack: [...st] } });
    } else { st.push(ch); steps.push({ line: 6, description: `push '${ch}'`, state: { view: "string", s, i, ch, stack: [...st] } }); }
  }
  steps.push({ line: 8, description: `return ${st.length === 0}`, state: { view: "string", s, stack: [...st], valid: st.length === 0 }, done: true });
  return steps;
}

const VPControls: Demo["Controls"] = ({ params, setParams }) => {
  const [value, setValue] = useState(typeof params?.s === "string" ? params.s : "");
  useEffect(() => setValue(typeof params?.s === "string" ? params.s : ""), [params]);
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-gray-600 dark:text-zinc-400">Brackets string</span>
      <input className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 outline-none" value={value} onChange={(e) => setValue(e.target.value)} onBlur={() => setParams({ ...params, s: value })} placeholder="{[()]}"/>
    </label>
  );
};

// ---------- Demo Registry ----------

const DEMOS: Demo[] = [
  { id: "twosum", title: "Two Sum (Two Pointers)", blurb: "Find two indices summing to target in sorted array.", code: twoSumCode, buildSteps: (p) => buildTwoSumSteps(p), Controls: TwoSumControls, initialParams: { arr: [1, 4, 6, 8, 10], target: 14 }, kind: "array" },
  { id: "longest-substring", title: "Longest Substring (Sliding Window)", blurb: "Window with last-seen positions; returns length.", code: lsCode, buildSteps: (p) => buildLSSteps(p), Controls: LSControls, initialParams: { s: "abrkaabcdefghijjxxx" }, kind: "string" },
  { id: "binary-search", title: "Binary Search", blurb: "Index of target in sorted array or -1.", code: bsCode, buildSteps: (p) => buildBSSteps(p), Controls: BSControls, initialParams: { arr: [1, 3, 5, 7, 9], target: 7 }, kind: "array" },
  { id: "kadane", title: "Kadane (Maximum Subarray)", blurb: "Track running sum and global best.", code: kadaneCode, buildSteps: (p) => buildKadaneSteps(p), Controls: KadaneControls, initialParams: { arr: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, kind: "array" },
  { id: "prefix-sum", title: "Prefix Sum (count subarrays = k)", blurb: "Hash map of prefix sums to count subarrays equal to k.", code: psCode, buildSteps: (p) => buildPSSteps(p), Controls: PSControls, initialParams: { arr: [1, 2, 3, -2, 5], k: 3 }, kind: "array" },
  { id: "nge", title: "Next Greater Element (Monotonic Stack)", blurb: "Map each element to next greater value.", code: ngeCode, buildSteps: (p) => buildNGESteps(p), Controls: NGEControls, initialParams: { arr: [2, 1, 2, 4, 3] }, kind: "array" },
  { id: "merge-intervals", title: "Merge Intervals", blurb: "Sort by start then sweep and merge.", code: miCode, buildSteps: (p) => buildMISteps(p), Controls: MIControls, initialParams: { text: "[1,3] [2,6] [8,10] [15,18]" }, kind: "array" },
  { id: "valid-parens", title: "Valid Parentheses (Stack)", blurb: "Push opens, match on close.", code: vpCode, buildSteps: (p) => buildVPSteps(p), Controls: VPControls, initialParams: { s: "{[()]}" }, kind: "string" },
];

// ---------- Visualization Components ----------

const PanelTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-2">{children}</div>
);

function CodeBlock({ code, activeLine }: { code: string; activeLine?: number }) {
  const lines = (code || "").replace(/\t/g, "  ").split("\n");
  return (
    <pre className="bg-gray-50 dark:bg-zinc-950/80 border border-gray-300 dark:border-zinc-800 rounded-2xl p-4 overflow-auto text-sm leading-6">
      {lines.map((ln, i) => (
        <div key={i} className={"whitespace-pre flex gap-3 items-baseline " + (activeLine === i + 1 ? " bg-gray-100 dark:bg-zinc-900 ring-1 ring-gray-300 dark:ring-zinc-700 rounded-lg px-2 -mx-2" : "") }>
          <span className="w-8 text-right select-none pr-2 text-gray-500 dark:text-zinc-500">{i + 1}</span>
          <code className="text-gray-900 dark:text-zinc-100">{ln || " "}</code>
        </div>
      ))}
    </pre>
  );
}

function ArrayViz({ arr, l, r, win }: { arr: (number | string)[]; l?: number; r?: number; win?: [number, number] }) {
  return (
    <div className="flex flex-wrap gap-2 items-end justify-center">
      {arr.map((v, i) => {
        const inWin = win && i >= win[0] && i <= win[1];
        const isL = l === i; const isR = r === i;
        return (
          <div key={i} className="relative">
            <div className={"w-12 h-12 rounded-2xl shadow flex items-center justify-center border " + (inWin ? " ring-2 ring-blue-500 border-blue-400 " : " border-gray-300 dark:border-zinc-800 ") + (isL ? " outline outline-2 outline-green-500 " : "") + (isR ? " outline outline-2 outline-rose-500 " : "") }>
              <span className="font-semibold text-gray-900 dark:text-zinc-100">{String(v)}</span>
            </div>
            {isL && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-green-600">L</div>}
            {isR && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-rose-600">R</div>}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 dark:text-zinc-500">{i}</div>
          </div>
        );
      })}
    </div>
  );
}

function StateInspector({ state }: { state: Record<string, any> }) {
  const entries = Object.entries(state).filter(([k]) => !["view", "arr", "s", "pos"].includes(k));
  return (
    <div className="bg-white dark:bg-zinc-950/60 border border-gray-300 dark:border-zinc-800 rounded-2xl p-3 text-sm">
      <div className="text-xs text-gray-600 dark:text-zinc-400 mb-1">State</div>
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="text-gray-600 dark:text-zinc-400">{k}</span>
            <span className="text-gray-900 dark:text-zinc-100">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Viz({ step }: { step: Step }) {
  if (!step) return null;
  const st = step.state || {};
  if (st.view === "array") {
    const arr: (number | string)[] = st.arr || []; const l: number | undefined = st.l; const r: number | undefined = st.r; const win: [number, number] | undefined = st.window || undefined;
    return (<div className="space-y-4"><ArrayViz arr={arr} l={l} r={r} win={win} /></div>);
  }
  if (st.view === "string") {
    const s: string = st.s || ""; const chars = s.split(""); const l: number | undefined = st.l; const r: number | undefined = st.r; const win: [number, number] | undefined = [l ?? 0, r ?? -1];
    return (<div className="space-y-4"><ArrayViz arr={chars} l={l} r={r} win={win} /></div>);
  }
  return <div className="text-sm text-gray-600 dark:text-zinc-400">(No visualization)</div>;
}

// ---------- Test Runner ----------

type TestResult = { name: string; pass: boolean; got: any; expected: any };

function TestPanel() {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const run = () => {
    const out: TestResult[] = [];
    // Existing tests (unchanged)
    out.push({ name: "TwoSum: [1,4,6,8,10], 14 → [1,4]", expected: [1,4], got: twoSumSolve([1,4,6,8,10],14), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);
    out.push({ name: "TwoSum: [2,3,7,9], 5 → [0,1]", expected: [0,1], got: twoSumSolve([2,3,7,9],5), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);
    out.push({ name: "TwoSum: [2,3,7,9], 100 → [-1,-1]", expected: [-1,-1], got: twoSumSolve([2,3,7,9],100), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);
    out.push({ name: "TwoSum: [1,1,3,4], 2 → [0,1]", expected: [0,1], got: twoSumSolve([1,1,3,4],2), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);

    out.push({ name: "LS: 'abcabcbb' → 3", expected: 3, got: longestSubstringSolve("abcabcbb"), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "LS: 'bbbbb' → 1", expected: 1, got: longestSubstringSolve("bbbbb"), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "LS: 'pwwkew' → 3", expected: 3, got: longestSubstringSolve("pwwkew"), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "LS: '' → 0", expected: 0, got: longestSubstringSolve(""), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "LS: 'dvdf' → 3", expected: 3, got: longestSubstringSolve("dvdf"), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;

    out.push({ name: "Kadane: [-2,1,-3,4,-1,2,1,-5,4] → 6", expected: 6, got: kadaneSolve([-2,1,-3,4,-1,2,1,-5,4]), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "Kadane: [-3,-2,-5] → -2", expected: -2, got: kadaneSolve([-3,-2,-5]), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;

    out.push({ name: "BS: [1,3,5,7,9] find 7 → 3", expected: 3, got: binarySearchSolve([1,3,5,7,9],7), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "BS: [1,3,5,7,9] find 4 → -1", expected: -1, got: binarySearchSolve([1,3,5,7,9],4), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "BS: [] find 1 → -1", expected: -1, got: binarySearchSolve([],1), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;

    // FIXED LINE (was truncated before)
    out.push({ name: "PS: [1,2,3,-2,5], k=3 → 3", expected: 3, got: subarraySumCountSolve([1,2,3,-2,5],3), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "PS: [0,0,0], k=0 → 6", expected: 6, got: subarraySumCountSolve([0,0,0],0), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;

    out.push({ name: "NGE: [2,1,2,4,3] → [4,2,4,-1,-1]", expected: [4,2,4,-1,-1], got: nextGreaterElementSolve([2,1,2,4,3]), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);
    out.push({ name: "NGE: [5,4,3] → [-1,-1,-1]", expected: [-1,-1,-1], got: nextGreaterElementSolve([5,4,3]), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);

    out.push({ name: "MI: [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]", expected: [[1,6],[8,10],[15,18]], got: mergeIntervalsSolve([[1,3],[2,6],[8,10],[15,18]]), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);
    out.push({ name: "MI: [[1,4],[4,5]] → [[1,5]]", expected: [[1,5]], got: mergeIntervalsSolve([[1,4],[4,5]]), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);

    out.push({ name: "VP: '{[()]}' → true", expected: true, got: validParenthesesSolve("{[()]}"), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "VP: '(]' → false", expected: false, got: validParenthesesSolve("(]"), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "VP: '' → true", expected: true, got: validParenthesesSolve(""), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;

    // Additional edge tests (added)
    out.push({ name: "TwoSum: [-3,-1,2,4,5], 1 → [1,2]", expected: [1,2], got: twoSumSolve([-3,-1,2,4,5],1), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);
    out.push({ name: "LS: 'tmmzuxt' → 5", expected: 5, got: longestSubstringSolve("tmmzuxt"), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "BS: [5] find 5 → 0", expected: 0, got: binarySearchSolve([5],5), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "BS: [5] find 1 → -1", expected: -1, got: binarySearchSolve([5],1), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "PS: [1,1,1], k=2 → 2", expected: 2, got: subarraySumCountSolve([1,1,1],2), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;
    out.push({ name: "NGE: [1,1,1] → [-1,-1,-1]", expected: [-1,-1,-1], got: nextGreaterElementSolve([1,1,1]), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);
    out.push({ name: "MI: [[5,6],[1,4],[2,3]] → [[1,4],[5,6]]", expected: [[1,4],[5,6]], got: mergeIntervalsSolve([[5,6],[1,4],[2,3]]), pass: false }); out[out.length-1].pass = JSON.stringify(out[out.length-1].got)===JSON.stringify(out[out.length-1].expected);
    out.push({ name: "VP: '{[(])}' → false", expected: false, got: validParenthesesSolve("{[(])}"), pass: false }); out[out.length-1].pass = out[out.length-1].got===out[out.length-1].expected;

    setResults(out);
  };
  return (
    <div className="bg-white dark:bg-zinc-950/60 border border-gray-300 dark:border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <PanelTitle>Test Cases</PanelTitle>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-900/80" onClick={run}>Run Tests</button>
      </div>
      {results ? (
        <ul className="space-y-2 text-sm">
          {results.map((r, i) => (
            <li key={i} className="flex items-center justify-between bg-gray-50 dark:bg-zinc-950/80 rounded-xl border border-gray-300 dark:border-zinc-800 px-3 py-2">
              <span className="mr-3">{r.name}</span>
              <span className={("inline-flex items-center gap-1 "+(r.pass?"text-emerald-600":"text-rose-500"))}>{r.pass ? <Check size={16} /> : <X size={16} />} {r.pass ? "PASS" : "FAIL"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-gray-600 dark:text-zinc-400">Click "Run Tests" to verify expected outputs.</div>
      )}
      <div className="text-xs text-gray-500 dark:text-zinc-500 mt-3">Note: Some demos auto-sort arrays for clarity.</div>
    </div>
  );
}

// ---------- Main Component ----------

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">((() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('av-theme');
      if (saved === 'light' || saved === 'dark') return saved as any;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  })());
  useEffect(() => { try { window.localStorage.setItem('av-theme', theme); } catch {} }, [theme]);

  const [demoId, setDemoId] = useState(DEMOS[0].id);
  const demo = useMemo(() => DEMOS.find((d) => d.id === demoId)!, [demoId]);
  const [params, setParams] = useState(demo.initialParams);
  useEffect(() => setParams(demo.initialParams), [demo]);

  const steps = useMemo<Step[]>(() => {
    try { const out = demo?.buildSteps?.(params); if (Array.isArray(out)) return out; return [{ description: "Ready", state: {} } as Step]; }
    catch (e) { return [{ description: "(error while building steps — check inputs)", state: { error: String(e) } } as Step]; }
  }, [demo, params]);

  const [idx, setIdx] = useState(0);
  const stepCount = Math.max(1, (steps && steps.length) || 0);
  const step = steps[Math.min(idx, stepCount - 1)] as Step;

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [lang, setLang] = useState<"python" | "js">("python");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { if (timerRef.current) window.clearInterval(timerRef.current); timerRef.current = null; return; }
    if (timerRef.current) window.clearInterval(timerRef.current);
    const interval = clamp(800 / speed, 150, 2000);
    timerRef.current = window.setInterval(() => { setIdx((i) => { if (i >= stepCount - 1) { setPlaying(false); return i; } return i + 1; }); }, interval) as unknown as number;
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); timerRef.current = null; };
  }, [playing, speed, stepCount]);

  useEffect(() => { if (idx > stepCount - 1) setIdx(0); }, [stepCount, idx]);

  const reset = () => { setPlaying(false); setIdx(0); };
  const next = () => setIdx((i) => Math.min(i + 1, stepCount - 1));

  return (
    <div className={theme==='dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Algorithm Visualizer — Fundamental DSA</h1>
              <p className="text-sm text-gray-600 dark:text-zinc-400">Pick a demo → edit inputs → Play/Next. Toggle language to view Python/JS code.</p>
            </div>
            <div className="flex gap-2 items-center">
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-900/80" onClick={() => setTheme(t=>t==='light'?'dark':'light')} aria-label="Toggle theme" title={theme==='dark'?'Switch to light':'Switch to dark'}>
                {theme==='dark' ? <Sun size={16}/> : <Moon size={16}/>}
                {theme==='dark' ? 'Light' : 'Dark'}
              </button>
              <select className="px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-900/80" value={demoId} onChange={(e) => setDemoId(e.target.value)}>
                {DEMOS.map((d) => (<option key={d.id} value={d.id}>{d.title}</option>))}
              </select>
              <select className="px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-900/80" value={lang} onChange={(e) => setLang(e.target.value as any)}>
                <option value="python">Python</option>
                <option value="js">JavaScript</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950/60 border border-gray-300 dark:border-zinc-800 rounded-2xl p-4">
            <PanelTitle>Inputs</PanelTitle>
            <demo.Controls params={params} setParams={setParams} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-950/60 border border-gray-300 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
              <PanelTitle>Playback</PanelTitle>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-900/80" onClick={() => setPlaying((p) => !p)}>
                  {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? "Pause" : "Play"}
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-900/80" onClick={next}>
                  <StepForward size={16} /> Next
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-900/80" onClick={reset}>
                  <RotateCcw size={16} /> Reset
                </button>
                <div className="ml-auto flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-zinc-400">Speed</span>
                  <input type="range" min={0.25} max={2} step={0.25} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
                  <span className="w-10 text-right text-gray-900 dark:text-zinc-100">{speed.toFixed(2)}x</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-zinc-400">Step {Math.min(idx + 1, stepCount)} / {stepCount}</div>
              <div className="text-sm font-medium">{step?.description}</div>
              <Viz step={step} />
              <StateInspector state={step?.state || {}} />
            </div>

            <div className="bg-white dark:bg-zinc-950/60 border border-gray-300 dark:border-zinc-800 rounded-2xl p-4">
              <PanelTitle>Code ({lang.toUpperCase()})</PanelTitle>
              <CodeBlock code={demo.code[lang]} activeLine={step?.line} />
            </div>
          </div>

          <TestPanel />
        </div>
      </div>
    </div>
  );
}
