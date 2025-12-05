# DockerRunner

A simple Express.js API that spins up Docker containers to run Python scripts.

## Features

- Spin up multiple Docker containers running a Python script
- Supports both **sequential** and **parallel** execution modes
- Containers are automatically removed after execution

## Usage

```bash
npm start
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/containers` | Spin up N containers sequentially |
| GET | `/containers/:number` | Spin up N containers sequentially |
| POST | `/containers/parallel` | Spin up N containers in parallel |
| GET | `/containers/parallel/:number` | Spin up N containers in parallel |
| GET | `/health` | Health check |

### Example

```bash
# Sequential execution
curl -X POST http://localhost:3000/containers -H "Content-Type: application/json" -d '{"number": 3}'

# Parallel execution
curl http://localhost:3000/containers/parallel/3
```

## Requirements

- Node.js
- Docker
