
import sequelize from "sequelize/types/sequelize";
import app from "..";
import ApiResponse from "../config/response.config";
import { Account, Booking, db, EventsModel, WaitingList } from "../models/database.connection";

class TicketService {

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
        await event!.reload({ include: [Booking, WaitingList] });
        if (!event) {
            response = { error: true, message: ApiResponse.fail.not_found, data: {} }
            return { code: ApiResponse.code.not_found, body: response };
        }
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
            user!.addWaitingList(waitingListEntry);
            event!.addWaitingList(waitingListEntry);

            // Add user to the Bull Queue for future reallocation
            // waitingQueue.add({ userId, eventId });

            response = { error: false, message: ApiResponse.pass.waiting_list, data: { event: event.name, totalTickets: event.totalTickets, availableTickets: event.availableTickets, eventQueues: event.WaitingLists.length } }
            await transaction.commit();
            return { code: ApiResponse.code.success, body: response };
        }

    }

    static async getStatus(id: any): Promise<any> {

        let response: {};
        const event = await EventsModel.findByPk(id, {
            include: [Booking, WaitingList],
        });

        if (!event) {
            response = { error: true, message: ApiResponse.fail.not_found, data: {} }
            return { code: ApiResponse.code.not_found, body: response };
        }

        const status = {
            eventName: event.name,
            totalTickets: event.totalTickets,
            availableTickets: event.availableTickets,
            bookedTickets: event.totalTickets - event.availableTickets,
            waitingListCount: event.WaitingLists.length
        };

        response = { error: false, message: ApiResponse.pass.ticket, status }
        return { code: ApiResponse.code.success, body: response };


    }

    static async cancelEvent(body: any): Promise<any> {
        const transaction = await db.sequelize.transaction();
        let response: {};
        const { userId, eventId } = body;
        const booking = await Booking.findOne({ where: { userId, eventId, status: 'BOOKED' }, transaction });
        if (!booking) {
            response = { error: true, message: ApiResponse.fail.cannot_book, data: {} }
            return { code: ApiResponse.code.not_found, body: response };
        }
        booking.status = 'CANCELED';
        await booking.save({ transaction });
        const event = await EventsModel.findByPk(eventId, {
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        event!.availableTickets += 1;
        await event!.save({ transaction });

        await transaction.commit();
        // Let Bull Queue handle reassigning tickets to users on the waiting list
        // waitingQueue.add({ userId: null, eventId }); 
        response = { error: false, message: ApiResponse.pass.booking_canceled, data: { event: event!.name, totalTickets: event!.totalTickets, availableTickets: event!.availableTickets } }
        return { code: ApiResponse.code.success, body: response };
    }

}

export default TicketService;