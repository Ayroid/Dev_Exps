# RabbitMQ Hello World

A basic RabbitMQ producer-consumer example using Node.js.

## Structure

- **producer/** - Sends "Hello World!" messages to the queue
- **consumer/** - Listens and receives messages from the queue

## Usage

```bash
# Start RabbitMQ server first

# Terminal 1 - Start consumer
cd consumer && npm start

# Terminal 2 - Send a message
cd producer && npm start
```

## Requirements

- Node.js
- RabbitMQ server running on `localhost`
