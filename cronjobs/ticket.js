// const { getExpiredRemindableSubscriptions, remindSubscription } = require("../services/ticket");

const subscriptionTicketsReminder = async (cron) => {
	try {
		// const { pastReminds, futureReminds } = await getExpiredRemindableSubscriptions();

		// for (let i = 0; i < pastReminds.length; i++) {
		// 	const userTicket = pastReminds[i];
		// 	console.log(`Subscription Ticket Reminder`, userTicket.id, userTicket.remind_at, new Date(userTicket.remind_at).toLocaleTimeString());
		// 	await remindSubscription(userTicket);
		// }

		// for (let j = 0; j < futureReminds.length; j++) {
		// 	const userTicket = futureReminds[j];

		// 	const t = new Date(userTicket.remind_at);
		// 	const scheduleString = `${t.getSeconds()} ${t.getMinutes()} ${t.getHours()} ${t.getDate()} ${t.getMonth() + 1} *`;
		// 	console.log(`Subscription Ticket Reminder`, userTicket.id, userTicket.remind_at, new Date(userTicket.remind_at).toLocaleTimeString());

		// 	cron.schedule(scheduleString, async () => {
		// 		await remindSubscription(userTicket);
		// 	});
		// }

		// for (let i = 0; i < userTickets.length; i++) {
		// 	const userTicket = userTickets[i];
		// 	console.log(`Subscription Ticket Reminder`, userTicket.id, userTicket.remind_at, new Date(userTicket.remind_at).toLocaleTimeString());
		// 	await remindSubscription(userTicket);
		// }
	} catch (error) {
		console.log(error);
	}
}

module.exports.init = async (cron) => {
	await subscriptionTicketsReminder(cron);
}