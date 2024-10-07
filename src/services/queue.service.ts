import amqp from 'amqplib';
import { RABBITMQ_HOST, RABBITMQ_PASS, RABBITMQ_PORT, RABBITMQ_USER } from '../config/environment.config';
import { Account, Booking, db, EventsModel, WaitingList } from '../models/database.connection';


class QueueService {

    static connectionInstance: any;
    static channelInstance: any;
    static QUEUE_NAME = 'waiting_list_queue';


    static connectRabbitMQ = async (retries = 5, timeout = 5000) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const connection = await amqp.connect({
                    protocol: 'amqp',
                    hostname: RABBITMQ_HOST,
                    port: RABBITMQ_PORT,
                    username: RABBITMQ_USER,
                    password: RABBITMQ_PASS,
                });

                this.connectionInstance = connection;
                this.channelInstance = await connection.createChannel();
                console.log('Connected to RabbitMQ');
                return;
            } catch (error) {
                console.error(`Failed to connect to RabbitMQ (Attempt ${attempt} of ${retries})`, error);

                if (attempt < retries) {
                    console.log(`Retrying in ${timeout / 1000} seconds...`);
                    await new Promise(res => setTimeout(res, timeout));
                } else {
                    throw new Error('Failed to connect to RabbitMQ after multiple attempts');
                }
            }
        }
    };


    static setupQueue = async (channel: any, queueName: any) => {
        await channel.assertQueue(queueName, {
            durable: true,
        });
        console.log(`Queue "${queueName}" is set up`);
    };


    static enqueueWaitingList = async (userId: number, eventId: number) => {

        if (!this.channelInstance) {
            throw new Error('RabbitMQ channel is not initialized. Call connectRabbitMQ first.');
        }

        const message = JSON.stringify({ userId, eventId });
        const user = await Account.findByPk(userId)
        const event = await EventsModel.findByPk(eventId);
        await event!.reload({ include: [Booking, WaitingList] });

        this.channelInstance.sendToQueue(this.QUEUE_NAME, Buffer.from(message), { persistent: true });
        let data: any = { event: event!.name, totalTickets: event!.totalTickets, availableTickets: event!.availableTickets }

        console.log(`****************************\nEnqueued user ${user?.username} with userId of ${userId} for event ${event?.name} to the waiting queue \n****************Event-details*******************\nevent_name: ${data.event}\ntotal_tickets:${data.totalTickets}\navailable_ticket:${data.availableTickets}\nqueue_length:${event!.WaitingLists.length}\n****************************`);
    };

    // Process messages from the waiting list queue
    static processWaitingListQueue = async () => {
        if (!this.channelInstance) {
            throw new Error('RabbitMQ channel is not initialized. Call connectRabbitMQ first.');
        }

        console.log('Waiting for messages in the waiting list queue...');

        this.channelInstance.consume(this.QUEUE_NAME, async (msg: any) => {
            if (msg !== null) {
                const { userId, eventId } = JSON.parse(msg.content.toString());

                const transaction = await db.sequelize.transaction();

                try {
                    // Lock the event row to avoid race conditions
                    const event = await EventsModel.findByPk(eventId, {
                        lock: transaction.LOCK.UPDATE,
                        transaction,
                    });

                    if (event && event.availableTickets > 0) {
                        //Looks for the first person that joined the waitingList
                        const waitingUser = await WaitingList.findOne({
                            where: { eventId },
                            order: [['createdAt', 'ASC']], // Order by createdAt in ascending order
                            transaction,
                        });

                        //If there is no user on the queue cancel the operation
                        if (!waitingUser) {
                            await transaction.commit();
                            this.channelInstance.ack(msg);
                            console.log('There is no user to assign the Ticket to at the moment')
                            return;
                        }
                        const userNewAssignee = await Account.findByPk(waitingUser!.userId)
                        const userThatCancled = await Account.findByPk(userId)
                        // Assign the ticket to the user from the waiting list
                        const bookInstance = await Booking.create({ userId: waitingUser!.userId, eventId, status: 'BOOKED', reallocated: true }, { transaction });
                        if (bookInstance) {
                            console.log(`assigned user ${userThatCancled?.username} event ticket to ${userNewAssignee?.username}`)
                        }
                        event.availableTickets -= 1;
                        console.log('set event availableTickets');
                        await event.save({ transaction })
                        // await transaction.commit();
                        // Remove the user from the waiting list
                        const deletedUser = await WaitingList.destroy({ where: { userId, eventId }, transaction });
                        if (deletedUser) {
                            console.log(`removed user ${userThatCancled?.username} with id of ${userThatCancled?.id} from the Queue`)
                        }
                        await transaction.commit();

                        await userNewAssignee?.addBooking(bookInstance);
                        await event?.addBooking(bookInstance);
                        await event!.reload({ include: [Booking, WaitingList] });
                        await waitingUser.reload()
                        console.log(`****************************\nProcessed ticket allocation for user ${userThatCancled?.username} with userId of ${userId} to ${userNewAssignee?.username} with userId of ${userNewAssignee?.id} for ${event.name} event\n****************Event-details*******************\nevent_name: ${event.name}\ntotal_tickets:${event.totalTickets}\navailable_ticket:${event.availableTickets}\nqueue_length:${event!.WaitingLists.length}\n****************************`);
                    } else {
                        console.log('eles');
                        await transaction.commit();
                    }

                    this.channelInstance.ack(msg);
                } catch (error) {
                    //  await transaction.rollback();
                    console.error('Error processing waiting list', error);


                }
            }
        });
    };
}

export default QueueService;