import amqp from "amqplib/callback_api.js";

amqp.connect("amqp://localhost", (error0, connection) => {
	if (error0) {
		throw error0;
	}
	connection.createChannel((error1, channel) => {
		if (error1) {
			throw error1;
		}

		let queue = "task_queue";
		let msg = process.argv.slice(2).join(" ") || "Hello World!";

		channel.assertQueue(queue, {
			durable: true, // Make sure the queue is durable to survive broker restarts
		});

		channel.sendToQueue(queue, Buffer.from(msg), {
			persistent: true, // Mark messages as persistent
		});
		console.log(" [x] Sent %s", msg);

		setTimeout(() => {
			connection.close();
			process.exit(0);
		}, 500);
	});
});
