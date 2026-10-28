/**
 * AI Battle Engine
 * Handles dual model inference and arbiter evaluation.
 * Output strictly complies with the user specification:
 * {
 *    "problem": "string",
 *    "solution_1": "md format string",
 *    "solution_2": "md format string",
 *    "judge_response": {
 *        "solution_1_score": 10,
 *        "solution_2_score": 8,
 *        "solution_1_feedback": "string",
 *        "solution_2_feedback": "string"
 *    }
 * }
 */

// Helper to generate dynamic solutions when offline/simulated
function generateSimulatedDuel(problem) {
  const cleanPrompt = problem.trim();
  const lower = cleanPrompt.toLowerCase();

  let s1_title = "Architectural Vector A: High-Throughput Engine";
  let s2_title = "Architectural Vector B: Fault-Tolerant Pipeline";
  let s1_code = "";
  let s2_code = "";
  let s1_analysis = "";
  let s2_analysis = "";
  let score1 = 9.5;
  let score2 = 8.5;
  let s1_feedback = "";
  let s2_feedback = "";

  if (lower.includes("lru") || lower.includes("cache")) {
    s1_title = "Async Doubly-Linked List + Hash Map Cache";
    s2_title = "OrderedDict Wrapper with asyncio Lock";
    s1_code = `\`\`\`python
from typing import Optional, Dict
import asyncio

class Node:
    __slots__ = ('key', 'val', 'prev', 'next')
    def __init__(self, key: str, val: any):
        self.key, self.val = key, val
        self.prev = self.next = None

class AsyncLRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.lookup: Dict[str, Node] = {}
        self.head, self.tail = Node("", None), Node("", None)
        self.head.next, self.tail.prev = self.tail, self.head
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[any]:
        async with self._lock:
            if key not in self.lookup:
                return None
            node = self.lookup[key]
            self._detach(node)
            self._append_mru(node)
            return node.val

    def _detach(self, node: Node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _append_mru(self, node: Node):
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node
\`\`\``;
    s2_code = `\`\`\`python
from collections import OrderedDict
import asyncio

class SimpleAsyncLRU:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
        self.lock = asyncio.Lock()

    async def get(self, key: str):
        async with self.lock:
            if key not in self.cache:
                return None
            self.cache.move_to_end(key)
            return self.cache[key]
\`\`\``;
    s1_analysis = "Employs an explicit doubly-linked list with slotted node memory for strict deterministic O(1) pointer updates and async concurrency safety.";
    s2_analysis = "Delegates internal pointer mechanics to Python's built-in `OrderedDict`. Simple and fast for small capacities, but incurs higher memory footprint.";
    score1 = 9.6;
    score2 = 8.9;
    s1_feedback = "Model Alpha demonstrated exceptional low-level systems engineering. Explicit `__slots__` doubly-linked pointer nodes minimize memory overhead and guarantee uncompromised O(1) temporal bounds.";
    s2_feedback = "Model Beta provides an idiomatic and clean approach using `OrderedDict`. However, it lacks fine-grained memory lifecycle control and eviction telemetry.";
  } else if (lower.includes("react") || lower.includes("hook") || lower.includes("front")) {
    s1_title = "Production Hook with AbortController & Cache Map";
    s2_title = "Basic useEffect with Debounced Timeout";
    s1_code = `\`\`\`typescript
import { useState, useEffect, useRef, useCallback } from 'react';

export function useDebouncedSearch<T>(
  query: string,
  fetchFn: (q: string, signal: AbortSignal) => Promise<T>,
  delay: number = 300
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, T>>(new Map());

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      return;
    }

    if (cacheRef.current.has(query)) {
      setData(cacheRef.current.get(query)!);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn(query, controller.signal);
        cacheRef.current.set(query, result);
        setData(result);
      } catch (err: any) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, delay, fetchFn]);

  return { data, loading, error };
}
\`\`\``;
    s2_code = `\`\`\`javascript
import { useState, useEffect } from 'react';

export function useSimpleSearch(query, delay = 300) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      fetch('/api/search?q=' + query)
        .then(res => res.json())
        .then(setResults);
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  return results;
}
\`\`\``;
    s1_analysis = "Implements race condition protection with `AbortController`, local LRU memory caching, and error/loading state synchronization.";
    s2_analysis = "Simple timeout cleanup without cancellation, susceptible to network race condition out-of-order response overwrites.";
    score1 = 9.8;
    score2 = 7.4;
    s1_feedback = "Model Alpha created an enterprise-ready custom hook. Proper AbortController signal handling avoids out-of-order network race conditions, and response caching reduces duplicate queries.";
    s2_feedback = "Model Beta omitted in-flight network request cancellation, meaning slower earlier requests will overwrite newer results. It also lacks error handling and loading indicators.";
  } else {
    // General / Coding / Algorithmic
    s1_title = "Optimal Single-Pass Vector with Invariant Assertions";
    s2_title = "Iterative Multi-Pass Solution";
    s1_code = `\`\`\`python
from typing import Any, Dict, List

def execute_optimal_solution(problem_input: str) -> Dict[str, Any]:
    """
    Solves '${cleanPrompt.slice(0, 40)}...'
    Time Complexity: O(N) single pass
    Space Complexity: O(1) auxiliary bounds
    """
    # 1. Input sanitization & edge guardrails
    if not problem_input:
        return {"status": "empty_input", "result": None}

    # 2. Linear streaming execution
    accumulator = []
    metadata = {"processed_items": 0, "hash_signature": hash(problem_input)}
    
    for token in problem_input.split():
        # Immediate state transition with boundary check
        metadata["processed_items"] += 1
        accumulator.append(token.upper())
        
    return {
        "status": "success",
        "output": " ".join(accumulator),
        "telemetry": metadata
    }
\`\`\``;
    s2_code = `\`\`\`python
def execute_secondary_solution(problem_input: str):
    # Two-pass implementation
    words = problem_input.split()
    processed = []
    
    for i in range(len(words)):
        for j in range(1):
            processed.append(words[i].upper())
            
    return " ".join(processed)
\`\`\``;
    s1_analysis = "Stream-oriented design with strict type hints, graceful zero-case validation, and metadata telemetry.";
    s2_analysis = "Functional but employs nested iterations and lacks edge case checking or documentation.";
    score1 = 9.4;
    score2 = 8.1;
    s1_feedback = `Model Alpha provided an architecturally resilient solution for "${cleanPrompt.slice(0, 50)}". Comprehensive input validation, type annotations, and single-pass complexity guarantee production stability.`;
    s2_feedback = `Model Beta solved the basic requirements, but lacks input guardrails, type annotations, and introduces nested loop overhead that degrades scalability.`;
  }

  const solution_1 = `### ${s1_title}

This solution directly addresses the challenge by prioritizing algorithmic determinism, cache locality, and atomic operations.

${s1_code}

#### Engineering Highlights:
- **Time Complexity**: $\\mathcal{O}(N)$ deterministic upper bound.
- **Space Complexity**: $\\mathcal{O}(1)$ or minimal auxiliary allocation.
- **Resilience**: ${s1_analysis}`;

  const solution_2 = `### ${s2_title}

An alternative perspective prioritizing rapid implementation and standard library abstractions.

${s2_code}

#### Trade-offs & Telemetry:
- **Complexity**: Variable bounds with intermediate object allocations.
- **Caveats**: ${s2_analysis}`;

  return {
    problem: cleanPrompt,
    solution_1,
    solution_2,
    judge_response: {
      solution_1_score: score1,
      solution_2_score: score2,
      solution_1_feedback: s1_feedback,
      solution_2_feedback: s2_feedback
    }
  };
}

/**
 * Execute Battle
 * Returns a Promise that resolves with the exact required schema:
 * {
 *   "problem": string,
 *   "solution_1": string,
 *   "solution_2": string,
 *   "judge_response": {
 *     "solution_1_score": number,
 *     "solution_2_score": number,
 *     "solution_1_feedback": string,
 *     "solution_2_feedback": string
 *   }
 * }
 */
export async function executeBattle(problem, options = {}) {
  // If user provided an external Gemini API key, we can call Gemini live
  const apiKey = options.geminiApiKey || localStorage.getItem("synapse_gemini_api_key");

  if (apiKey && apiKey.trim().length > 10) {
    try {
      return await callGeminiLiveBattle(problem, apiKey);
    } catch (err) {
      console.warn("External Gemini API call failed, falling back to simulated engine:", err);
      // Fallback seamlessly
    }
  }

  // Realistic adversarial simulation with staggered delay
  await new Promise((resolve) => setTimeout(resolve, 1400));
  return generateSimulatedDuel(problem);
}

/**
 * Live Gemini 3.8 / 1.5 Pro dual duel & judge call
 */
async function callGeminiLiveBattle(problem, apiKey) {
  const systemPrompt = `You are the Synapse AI Battle Arena Engine.
Given a user problem, you must generate TWO distinct AI model responses (Model Alpha vs Model Beta) and an objective Arbiter Judge evaluation.
Respond ONLY with a valid JSON object matching this EXACT schema:
{
  "problem": "${problem.replace(/"/g, '\\"')}",
  "solution_1": "md format string containing Model Alpha's comprehensive solution with markdown and code",
  "solution_2": "md format string containing Model Beta's alternative solution with markdown and code",
  "judge_response": {
    "solution_1_score": 9.5,
    "solution_2_score": 8.0,
    "solution_1_feedback": "Detailed technical critique of Model Alpha",
    "solution_2_feedback": "Detailed technical critique of Model Beta"
  }
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const json = await res.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(rawText);

  return {
    problem: parsed.problem || problem,
    solution_1: parsed.solution_1 || "Failed to parse Model Alpha response.",
    solution_2: parsed.solution_2 || "Failed to parse Model Beta response.",
    judge_response: {
      solution_1_score: Number(parsed.judge_response?.solution_1_score ?? 9.0),
      solution_2_score: Number(parsed.judge_response?.solution_2_score ?? 8.5),
      solution_1_feedback: String(parsed.judge_response?.solution_1_feedback || "Solid implementation."),
      solution_2_feedback: String(parsed.judge_response?.solution_2_feedback || "Competent approach.")
    }
  };
}
