const mainCron = require('node-cron');
const schedulerCron = require('node-cron');
const ticketJob = require('./ticket');

//check everyday 00.00.00 UTC or when restart
const scheduleJobs = async () => {
    try {
        const prevTasks = Array.from(schedulerCron.getTasks().values());
        prevTasks.forEach(prevTask => {
            if (prevTask.id != 'main') {
                prevTask.stop();
            }
        });

        await ticketJob.init(schedulerCron);
    } catch (error) {
        console.log(`error`, error);
    }
}

const task = mainCron.schedule('0 0 * * *', async () => {
    console.log('cron job main', new Date());
    scheduleJobs();
});
task.id = 'main';

module.exports = { scheduleJobs };