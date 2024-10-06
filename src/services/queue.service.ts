import amqp from 'amqplib';
import { RABBITMQ_HOST, RABBITMQ_PASS, RABBITMQ_PORT, RABBITMQ_USER } from '../config/environment.config';
import { Booking, db, EventsModel, WaitingList } from '../models/database.connection';

class QueueService {

    static connectionInstance: any;
    static channelInstance: any;
    static QUEUE_NAME = 'waiting_list_queue';


    static connectRabbitMQ = async () => {
        try {
            const connection = await amqp.connect({
                protocol: 'amqp',
                hostname: RABBITMQ_HOST,
                port: RABBITMQ_PORT,
                username: RABBITMQ_USER,
                password: RABBITMQ_PASS,
            });

            const channel = await connection.createChannel();
            console.log('Connected to RabbitMQ');
            this.connectionInstance = connection;
            this.channelInstance = channel;

            // Ensure queue is set up once on connection
            await this.setupQueue(channel, this.QUEUE_NAME);
        } catch (error) {
            console.error('Failed to connect to RabbitMQ', error);
            throw error;
        }
    };


    static setupQueue = async (channel: any, queueName: any) => {
        await channel.assertQueue(queueName, {
            durable: true,  // Messages survive RabbitMQ restarts
        });
        console.log(`Queue "${queueName}" is set up`);
    };


    static enqueueWaitingList = async (userId: number, eventId: number) => {
        if (!this.channelInstance) {
            throw new Error('RabbitMQ channel is not initialized. Call connectRabbitMQ first.');
        }

        const message = JSON.stringify({ userId, eventId });

        // Publish the message to the queue
        this.channelInstance.sendToQueue(this.QUEUE_NAME, Buffer.from(message), { persistent: true });

        console.log(`Enqueued user ${userId} for event ${eventId} to the waiting list queue`);
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
                        // Assign the ticket to the user from the waiting list
                        await Booking.create({ userId, eventId, status: 'BOOKED' }, { transaction });
                        event.availableTickets -= 1;
                        await event.save({ transaction });

                        // Remove the user from the waiting list
                        await WaitingList.destroy({ where: { userId, eventId }, transaction });

                        console.log(`Processed ticket allocation for user ${userId} for event ${eventId}`);
                    }

                    await transaction.commit();

                    this.channelInstance.ack(msg);
                } catch (error) {
                    await transaction.rollback();
                    console.error('Error processing waiting list', error);


                }
            }
        });
    };
}

export default QueueService;