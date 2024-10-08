
import sequelize from "sequelize/types/sequelize";
import app from "..";
import ApiResponse from "../config/response.config";
import { Account, Booking, db, EventsModel, WaitingList } from "../models/database.connection";
import QueueService from "./queue.service";

class TicketService {
    static delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

    static async initEvent(body: any): Promise<any> {
        let response: {};
        const { name, totalTickets } = body;

        const event = await EventsModel.create({
            name,
            totalTickets,
            availableTickets: totalTickets,
        });

        response = { error: false, message: ApiResponse.pass.sucess_event, data: event }
        return { code: ApiResponse.code.success, body: response };
    }


    static async getAllEvents(): Promise<any> {

        let response: {};

        const eventInstances = await EventsModel.findAll({});

        response = { error: false, message: eventInstances.length <= 0 ? ApiResponse.fail.not_event_found : ApiResponse.pass.create, data: eventInstances }
        return { code: ApiResponse.code.success, body: response };
    }

    static async bookEvent(body: any): Promise<any> {
        const transaction = await db.sequelize.transaction();
        let response: {};
        const { userId, eventId } = body;
        const user = await Account.findByPk(userId)

        const event = await EventsModel.findByPk(eventId, {
            lock: transaction.LOCK.UPDATE,
            transaction,
        });

        if (!event) {
            response = { error: true, message: ApiResponse.fail.not_found, data: {} }
            return { code: ApiResponse.code.not_found, body: response };
        }
        await event!.reload({ include: [Booking, WaitingList] });
        if (event.availableTickets > 0) {
            // Book the ticket immediately if available
            const bookInstance = await Booking.create({ userId, eventId, status: 'BOOKED' }, { transaction });
            event.availableTickets -= 1;
            await event.save({ transaction });
            await transaction.commit();
            await user?.addBooking(bookInstance);
            await event?.addBooking(bookInstance);
            response = { error: false, message: ApiResponse.pass.ticket, data: { event: event.name, totalTickets: event.totalTickets, availableTickets: event.availableTickets } }
            return { code: ApiResponse.code.success, body: response };
        } else {
            // No tickets available, add to waiting list
            const waitingListEntry = await WaitingList.create({ userId, eventId }, { transaction });
            if (waitingListEntry) {
                await transaction.commit();
                // Add user to the  Queue for future reallocation
                await user!.addWaitingList(waitingListEntry);
                await event!.addWaitingList(waitingListEntry);
                await QueueService.enqueueWaitingList(userId, eventId);
                await event!.reload({ include: [Booking, WaitingList] })
            }

            response = { error: false, message: ApiResponse.pass.waiting_list, data: { event: event.name, totalTickets: event.totalTickets, availableTickets: event.availableTickets, eventQueues: event.WaitingLists.length } }

            return { code: ApiResponse.code.success, body: response };
        }

    }

    static async getStatus(id: any): Promise<any> {

        let response: {};
        const event = await EventsModel.findByPk(id, {
            include: [
                {
                    model: Booking,
                    required: false
                },
                {
                    model: WaitingList,
                    include: [
                        {
                            model: Account,
                            required: false
                        }
                    ],
                    required: false // Optional
                }
            ],
        });

        if (!event) {
            response = { error: true, message: ApiResponse.fail.not_found, data: {} }
            return { code: ApiResponse.code.not_found, body: response };
        }

        let users = event.WaitingLists

        users.forEach((waitingListEntry: any) => {
            waitingListEntry.dataValues = {
                userId: waitingListEntry.dataValues.User.id,
                username: waitingListEntry.dataValues.User.username,
                email: waitingListEntry.dataValues.User.email
            }
        })

        const status = {
            eventName: event.name,
            totalTickets: event.totalTickets,
            availableTickets: event.availableTickets,
            bookedTickets: event.totalTickets - event.availableTickets,
            queueLength: event.WaitingLists.length,
            usersInQueue: users
        };

        response = { error: false, message: ApiResponse.pass.ticket, status }
        return { code: ApiResponse.code.success, body: response };


    }

    static async cancelEvent(body: any): Promise<any> {

        const transaction = await db.sequelize.transaction();
        let response: {};
        const { userId, eventId } = body;

        console.log([userId, eventId])
        const user = await Account.findByPk(userId)
        const booking = await Booking.findOne({ where: { userId, eventId, status: 'BOOKED' }, transaction });

        if (!booking) {
            await transaction.rollback();
            response = { error: true, message: ApiResponse.fail.cannot_book, data: {} }
            return { code: ApiResponse.code.not_found, body: response };
        }


        booking.status = 'CANCELED';

        await booking.save({ transaction });
        const event = await EventsModel.findByPk(eventId, {
            lock: transaction.LOCK.UPDATE,
            transaction,
        });

        await transaction.commit();
        await event!.reload({ include: [Booking, WaitingList] });
        if (QueueService.channelInstance) {

            await QueueService.channelInstance.sendToQueue(QueueService.QUEUE_NAME, Buffer.from(JSON.stringify({ userId: userId, eventId })), {
                persistent: true,
            });
            console.log(`****************************\n${event?.name} event is cancelled by user ${user?.name} with userId of ${userId}\nreallocating process initiated\n****************************`);
        } else {
            console.error('RabbitMQ channel is not initialized.');
        }
        await TicketService.delay(50);
        await event!.reload({
            include: [
                {
                    model: Booking,
                    where: {
                        userId: userId,
                        eventId: eventId,
                        status: 'BOOKED',
                    },
                },
                {
                    model: WaitingList,
                    // You can add conditions for WaitingList here if needed
                },
            ]
        })
        response = { error: false, message: ApiResponse.pass.booking_canceled, data: { event: event!.name, totalTickets: event!.totalTickets, availableTickets: event!.availableTickets, queueLength: event!.WaitingLists.length } }
        return { code: ApiResponse.code.success, body: response };
    }

}

export default TicketService;