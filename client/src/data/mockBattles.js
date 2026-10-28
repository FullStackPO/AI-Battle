export const initialBattles = [
  {
    id: "battle-1042",
    title: "Distributed Rate Limiter Duel",
    category: "System Design & Concurrency",
    model1: {
      id: "gemini-1.5-pro",
      name: "Model Alpha",
      version: "Gemini 1.5 Pro",
      color: "#00f0ff",
      colorClass: "primary-container",
      badge: "Atomic Lockless"
    },
    model2: {
      id: "claude-3.5-sonnet",
      name: "Model Beta",
      version: "Claude 3.5 Sonnet",
      color: "#a855f7",
      colorClass: "secondary",
      badge: "MULTI / EXEC Pipeline"
    },
    judge: {
      name: "Synapse Arbiter Core",
      engine: "GPT-4o Judge Engine (Zero-Shot Dual Run)",
      color: "#10b981"
    },
    rounds: [
      {
        roundNumber: 1,
        title: "Two Sum Extreme Precision Edge Cases",
        isCollapsed: true,
        data: {
          problem: "Implement an ultra-high performance twoSum algorithm in Python handling large 64-bit integers with O(N) time and minimizing hash map bucket collisions across 10^6 elements.",
          solution_1: `### Optimized Single-Pass Hash Indexer

To achieve deterministic $O(N)$ execution with minimal collision overhead on massive 64-bit integers, we utilize Python's native dictionary with custom integer pre-hashing and direct pointer caching.

\`\`\`python
from typing import List, Tuple, Optional

class OptimizedTwoSum:
    @staticmethod
    def find_pair(nums: List[int], target: int) -> Optional[Tuple[int, int]]:
        """
        Single-pass lookup with memory-localized complementary hashing.
        Time Complexity: O(N) average, Space Complexity: O(N)
        """
        seen = {}
        for index, val in enumerate(nums):
            complement = target - val
            if complement in seen:
                return (seen[complement], index)
            seen[val] = index
        return None
\`\`\`

#### Key Highlights:
- **Zero Sorting Overhead**: Avoids $O(N \\log N)$ sorting bottlenecks.
- **Immediate Return**: Returns upon encountering the earliest valid pair.
- **Linear Memory Locality**: Exploits Python 3.7+ compact dict layout.`,
          solution_2: `### Dual-Pointer In-Place Two Sum

We sort the array first, then converge with dual pointers from opposite ends.

\`\`\`python
def two_sum_two_pointer(numbers: list[int], target: int):
    # Requires sorting index pairs
    indexed = sorted((val, idx) for idx, val in enumerate(numbers))
    left, right = 0, len(indexed) - 1
    
    while left < right:
        current_sum = indexed[left][0] + indexed[right][0]
        if current_sum == target:
            return (indexed[left][1], indexed[right][1])
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return None
\`\`\`

#### Trade-offs:
- **Time**: $O(N \\log N)$ due to initial sorting of index pairs.
- **Space**: $O(N)$ auxiliary memory for index tracking tuples.`,
          judge_response: {
            solution_1_score: 9.8,
            solution_2_score: 8.9,
            solution_1_feedback: "Model Alpha achieved optimal O(N) runtime using single-pass hash indexing without any sort overhead. Python's compact dictionary provides cache-friendly lookups even on 10^6 elements.",
            solution_2_feedback: "Model Beta's two-pointer approach introduces an unnecessary O(N log N) sorting step and allocates supplementary tuples, degrading throughput on massive datasets."
          }
        },
        telemetry: {
          solution_1_latency: "0.82s",
          solution_2_latency: "1.15s",
          solution_1_tokens: 412,
          solution_2_tokens: 388,
          winner: "solution_1"
        }
      },
      {
        roundNumber: 2,
        title: "Distributed Rate Limiter with Redis",
        isCollapsed: false,
        data: {
          problem: "Implement a distributed token bucket rate limiter in Python using Redis, handling race conditions and clock drift gracefully.",
          solution_1: `### Distributed Token Bucket using Redis Lua Script

To eliminate race conditions in a distributed multi-node architecture, the token replenishment, capacity clamping, and consumption logic must execute **atomically on the Redis server instance** via a Lua script.

\`\`\`python
import time
import redis

# Embedded Lua script executes atomically within Redis engine
LUA_TOKEN_BUCKET = """
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4] or 1)

local data = redis.call('HMGET', key, 'tokens', 'last_updated')
local tokens = tonumber(data[1])
local last_updated = tonumber(data[2])

if not tokens then
    tokens = capacity
    last_updated = now
else
    local delta = math.max(0, now - last_updated)
    tokens = math.min(capacity, tokens + delta * refill_rate)
end

if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
    redis.call('PEXPIRE', key, math.ceil((capacity / refill_rate) * 2000))
    return {1, tokens}  -- Allowed
else
    redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
    return {0, tokens}  -- Denied
end
"""

class RedisTokenBucketLimiter:
    def __init__(self, client: redis.Redis):
        self.redis = client
        self._script = self.redis.register_script(LUA_TOKEN_BUCKET)

    def allow_request(self, user_id: str, capacity: int = 100, refill_per_sec: float = 10.0, tokens: int = 1) -> bool:
        """
        Executes atomic token check & consumption.
        - Race Condition Safe: Script runs uninterrupted on Redis single-thread.
        - Clock Drift Safe: Uses monotonic server or caller timestamp passed explicitly.
        """
        now = time.time()
        res = self._script(
            keys=[f"rate_limit:{user_id}"],
            args=[capacity, refill_per_sec, now, tokens]
        )
        return bool(res[0])
\`\`\`

#### Architectural Advantages:
1. **Zero Race Conditions**: Guaranteed single-cycle atomicity on Redis engine without distributed lock overhead.
2. **Clock Drift Resilience**: Monotonic timestamp evaluation prevents backward jumps.
3. **Automatic Garbage Collection**: \`PEXPIRE\` purges dormant user keys after bucket refills to capacity.`,
          solution_2: `### Sliding Window Rate Limiter using Redis Pipeline

This solution implements a sliding-window counter using Redis sorted sets (ZSET) inside a transactional \`WATCH / MULTI / EXEC\` pipeline block.

\`\`\`python
import time
import redis

class RedisSlidingLimiter:
    def __init__(self, client: redis.Redis):
        self.client = client

    def acquire_slot(self, user_id: str, limit: int = 100, window_seconds: int = 60) -> bool:
        now = time.time()
        clear_before = now - window_seconds
        key = f"limiter:{user_id}"

        with self.client.pipeline() as pipe:
            try:
                pipe.watch(key)
                pipe.multi()
                # 1. Prune expired entries
                pipe.zremrangebyscore(key, "-inf", clear_before)
                # 2. Count remaining hits
                pipe.zcard(key)
                # 3. Add current request timestamp
                pipe.zadd(key, {f"{now}": now})
                # 4. Set TTL
                pipe.expire(key, window_seconds + 5)
                results = pipe.execute()
                
                request_count = results[1]
                return request_count < limit
            except redis.WatchError:
                # Contention retry failure
                return False
\`\`\`

#### Potential Bottlenecks:
- **Watch Conflicts**: Under 5,000+ RPS concurrency, \`WatchError\` triggers cascade transaction aborts.
- **Memory Footprint**: $O(N)$ elements per window instead of $O(1)$ token counter state.`,
          judge_response: {
            solution_1_score: 10,
            solution_2_score: 8,
            solution_1_feedback: "Outstanding implementation. Using server-side Redis Lua script guarantees 100% atomic execution without optimistic lock collisions or network round trips. PEXPIRE auto-eviction maintains clean memory hygiene.",
            solution_2_feedback: "Model Beta implemented a sliding-log ZSET rather than a token bucket. The WATCH/MULTI/EXEC construct suffers severe contention collapse and retry storms under high concurrent load, plus O(N) memory consumption."
          }
        },
        telemetry: {
          solution_1_latency: "1.24s",
          solution_2_latency: "1.78s",
          solution_1_tokens: 842,
          solution_2_tokens: 916,
          winner: "solution_1"
        }
      }
    ]
  },
  {
    id: "battle-1043",
    title: "Quantum BB84 Simulation Duel",
    category: "Cryptography & Quantum",
    model1: {
      id: "gemini-1.5-pro",
      name: "Model Alpha",
      version: "Gemini 1.5 Pro",
      color: "#00f0ff",
      colorClass: "primary-container",
      badge: "Matrix Operators"
    },
    model2: {
      id: "claude-3.5-sonnet",
      name: "Model Beta",
      version: "Claude 3.5 Sonnet",
      color: "#a855f7",
      colorClass: "secondary",
      badge: "State Sifting Protocol"
    },
    judge: {
      name: "Synapse Arbiter Core",
      engine: "GPT-4o Judge Engine",
      color: "#10b981"
    },
    rounds: [
      {
        roundNumber: 1,
        title: "Quantum Key Distribution Protocol Simulation",
        isCollapsed: false,
        data: {
          problem: "Write a complete Python simulation of the BB84 Quantum Key Distribution protocol between Alice and Bob, with an optional eavesdropper (Eve) who induces quantum state collapse and bit error rate detection.",
          solution_1: `### BB84 Simulation with Density Matrix Collapse

Simulating the 4 polarization states ($|0\\rangle, |1\\rangle, |+\\rangle, |-\\rangle$) across Rectilinear ($+$) and Diagonal ($\\times$) measurement bases.

\`\`\`python
import random
from typing import List, Tuple

def simulate_bb84(n_qubits: int = 100, eve_present: bool = False):
    # 1. Alice generates random bits & basis choices (0: +, 1: x)
    alice_bits = [random.randint(0, 1) for _ in range(n_qubits)]
    alice_bases = [random.randint(0, 1) for _ in range(n_qubits)]
    
    # Photons in flight
    channel_qubits = list(zip(alice_bits, alice_bases))
    
    # 2. Optional Eve interception (Breaks quantum superposition)
    if eve_present:
        eve_bases = [random.randint(0, 1) for _ in range(n_qubits)]
        intercepted = []
        for (bit, a_base), e_base in zip(channel_qubits, eve_bases):
            measured_bit = bit if a_base == e_base else random.randint(0, 1)
            intercepted.append((measured_bit, e_base))
        channel_qubits = intercepted

    # 3. Bob chooses random measurement bases
    bob_bases = [random.randint(0, 1) for _ in range(n_qubits)]
    bob_bits = []
    for (bit, q_base), b_base in zip(channel_qubits, bob_bases):
        bob_bits.append(bit if q_base == b_base else random.randint(0, 1))

    # 4. Sifting phase: Public basis exchange
    sifted_alice = [b for b, ab, bb in zip(alice_bits, alice_bases, bob_bases) if ab == bb]
    sifted_bob = [b for b, ab, bb in zip(bob_bits, alice_bits, bob_bases) if ab == bb]

    # Calculate Bit Error Rate (QBER)
    sample_len = len(sifted_alice) // 2
    errors = sum(1 for a, b in zip(sifted_alice[:sample_len], sifted_bob[:sample_len]) if a != b)
    qber = (errors / sample_len) if sample_len > 0 else 0.0

    return {
        "sifted_key_length": len(sifted_alice) - sample_len,
        "qber": qber,
        "intercept_detected": qber > 0.11 # Theoretical threshold
    }
\`\`\`
`,
          solution_2: `### BB84 Protocol with Formal QBER Calculation & Privacy Amplification

\`\`\`python
import secrets
from dataclasses import dataclass

@dataclass
class BB84Result:
    shared_key: str
    error_rate: float
    eavesdropper_detected: bool

class BB84Simulator:
    def __init__(self, num_photons: int = 256):
        self.num_photons = num_photons

    def run(self, eve_active: bool = False) -> BB84Result:
        # Cryptographically secure random bits
        a_bits = [secrets.randbelow(2) for _ in range(self.num_photons)]
        a_bases = [secrets.randbelow(2) for _ in range(self.num_photons)]
        b_bases = [secrets.randbelow(2) for _ in range(self.num_photons)]
        
        b_bits = []
        for i in range(self.num_photons):
            bit = a_bits[i]
            base = a_bases[i]
            
            if eve_active:
                eve_base = secrets.randbelow(2)
                if eve_base != base:
                    bit = secrets.randbelow(2)
                    base = eve_base
                    
            if b_bases[i] == base:
                b_bits.append(bit)
            else:
                b_bits.append(secrets.randbelow(2))
                
        # Sifting
        matching = [i for i in range(self.num_photons) if a_bases[i] == b_bases[i]]
        alice_sifted = [a_bits[i] for i in matching]
        bob_sifted = [b_bits[i] for i in matching]
        
        # Test sample
        test_size = len(matching) // 3
        mismatches = sum(a != b for a, b in zip(alice_sifted[:test_size], bob_sifted[:test_size]))
        qber = mismatches / test_size if test_size else 0.0
        
        key = "".join(str(b) for b in alice_sifted[test_size:])
        return BB84Result(shared_key=key, error_rate=qber, eavesdropper_detected=qber > 0.11)
\`\`\`
`,
          judge_response: {
            solution_1_score: 9.1,
            solution_2_score: 9.7,
            solution_1_feedback: "Solution 1 correctly models basis sifting and quantum measurement collapse, but has an index alignment bug in `sifted_bob` line where `ab == bb` references `alice_bits` instead of `alice_bases`.",
            solution_2_feedback: "Model Beta produces a cleaner, bug-free implementation using `secrets` for cryptographic randomness, typed dataclass output, and accurate state alteration upon eavesdropping."
          }
        },
        telemetry: {
          solution_1_latency: "1.45s",
          solution_2_latency: "1.62s",
          solution_1_tokens: 680,
          solution_2_tokens: 720,
          winner: "solution_2"
        }
      }
    ]
  }
];

export const sampleChallengePrompts = [
  {
    title: "System Design Rate Limiter",
    prompt: "Implement a distributed token bucket rate limiter in Python using Redis, handling race conditions and clock drift gracefully."
  },
  {
    title: "Two Sum Leetcode Edge Cases",
    prompt: "Implement an ultra-high performance twoSum algorithm in Python handling large 64-bit integers with O(N) time and minimizing hash collisions."
  },
  {
    title: "Quantum BB84 Simulation",
    prompt: "Write a complete Python simulation of the BB84 Quantum Key Distribution protocol between Alice and Bob, with eavesdropper detection."
  },
  {
    title: "Async LRU Cache in Python",
    prompt: "Build a thread-safe Async LRU Cache in Python with TTL expiration, O(1) operations, and asyncio.Lock synchronization."
  },
  {
    title: "Distributed Lock with Redlock",
    prompt: "Design a fault-tolerant distributed lock mechanism in Python adhering to Martin Kleppmann's Redlock critique and fencing tokens."
  },
  {
    title: "React Custom Hook for Search",
    prompt: "Create an advanced production-ready React hook `useDebouncedSearch` with abort controller cancellation, caching, and loading state."
  }
];
