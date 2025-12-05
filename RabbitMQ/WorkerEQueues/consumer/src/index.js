import { connect } from "amqplib/callback_api.js";

connect("amqp://localhost", function (error0, connection) {
	if (error0) {
		throw error0;
	}
	connection.createChannel(function (error1, channel) {
		if (error1) {
			throw error1;
		}

		var queue = "task_queue";

		channel.assertQueue(queue, {
			durable: true, // Make sure the queue is durable to survive broker restarts
		});

		channel.prefetch(1);
		console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
		channel.consume(
			queue,
			(msg) => {
				let secs = msg.content.toString().split(".").length - 1;
				console.log(" [x] Received %s", msg.content.toString());
				setTimeout(function () {
					console.log(" [x] Done");
					channel.ack(msg); // Acknowledge message after processing
				}, secs * 1000);
			},
			{
				noAck: false, // Enable manual message acknowledgment
			}
		);
	});
});
