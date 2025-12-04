import os
import time
import math

# Get the container number from environment variable
container_number = os.environ.get('CONTAINER_NUMBER', 'unknown')

print(f"Hello from {container_number} - Starting heavy task...")

# CPU-intensive task: Calculate prime numbers
def find_primes(limit):
    """Find all prime numbers up to a limit using trial division."""
    primes = []
    for num in range(2, limit):
        is_prime = True
        for i in range(2, int(math.sqrt(num)) + 1):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    return primes

# RAM-intensive task: Create large data structures
def memory_intensive_task(size_mb):
    """Allocate memory by creating large lists."""
    data = []
    # Each integer in Python takes about 28 bytes, strings take more
    # Create chunks of data to consume memory
    chunk_size = 1024 * 1024  # 1MB worth of characters
    for _ in range(size_mb):
        data.append('X' * chunk_size)
    return len(data)

# Perform CPU-intensive calculations
start_time = time.time()
print(f"Container {container_number}: Finding prime numbers up to 100000...")
primes = find_primes(1000)
cpu_time = time.time() - start_time
print(f"Container {container_number}: Found {len(primes)} primes in {cpu_time:.2f} seconds")

# Perform memory-intensive task
print(f"Container {container_number}: Allocating ~100MB of memory...")
start_time = time.time()
mem_chunks = memory_intensive_task(100)
mem_time = time.time() - start_time
print(f"Container {container_number}: Allocated {mem_chunks}MB in {mem_time:.2f} seconds")

# Additional CPU work: Matrix-like operations
print(f"Container {container_number}: Performing matrix calculations...")
start_time = time.time()
size = 500
matrix = [[i * j for j in range(size)] for i in range(size)]
# Sum all elements
total = sum(sum(row) for row in matrix)
matrix_time = time.time() - start_time
print(f"Container {container_number}: Matrix sum = {total}, computed in {matrix_time:.2f} seconds")

print(f"Hello from {container_number} - Heavy task completed!")
