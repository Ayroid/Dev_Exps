#!/usr/bin/env node

import { connect } from 'amqplib/callback_api.js';

connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    let exchange = 'direct_logs';
    let args = process.argv.slice(2);
    let msg = args.slice(1).join(' ') || 'Hello World!';
    let severity = (args.length > 0) ? args[0] : 'info';

    channel.assertExchange(exchange, 'direct', {
      durable: false
    });
    channel.publish(exchange, severity, Buffer.from(msg));
    console.log(" [x] Sent %s: '%s'", severity, msg);
  });

  setTimeout(function() {
    connection.close();
    process.exit(0);
  }, 500);
});