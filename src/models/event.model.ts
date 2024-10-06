import { DataTypes, Model, Sequelize } from "sequelize";
import { Account } from './user.model';
import { Booking } from "./booking.model";
import { WaitingList } from "./waiting_list.model";

class Event extends Model {
    public addWaitingList!: (waiting: WaitingList) => Promise<void>;
    public addBooking!: (event: Booking) => Promise<void>;
    public id!: number;
    public name!: string;
    public totalTickets!: number;
    public availableTickets!: number;
    public WaitingLists!: WaitingList;

}

const initializeEventModel = (sequelize: Sequelize) => {
    Event.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            totalTickets: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            availableTickets: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Event',
        }
    );
    return Event;
};

export { Event as EventsModel, initializeEventModel };