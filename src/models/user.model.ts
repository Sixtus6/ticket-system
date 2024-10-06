import { Association, DataTypes, Model, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import { Booking } from './booking.model';
import { WaitingList } from './waiting_list.model';


class User extends Model {
    public id!: number;
    public name!: string;
    public username!: string;
    public email!: string;
    public password!: string;
    public isAdmin!: boolean;
    public addBooking!: (book: Booking) => Promise<void>;
    public addWaitingList!: (waiting: WaitingList) => Promise<void>;
    public async comparePassword(password: string): Promise<boolean> {

        return bcrypt.compare(password, this.password);
    }

    public async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}

const initializeAccountModel = (sequelize: Sequelize) => {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: "",
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: "",
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: "",
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        sequelize,
        tableName: 'User',
        timestamps: true
    });

    // HOOKS

    User.beforeCreate(async (account, options) => {
        const hashedPassword = await bcrypt.hash(account.password, 10);
        account.password = hashedPassword;
    });

    User.prototype.comparePassword = async function (password) {

        return bcrypt.compare(password, this.password);
    };

    User.prototype.hashPassword = async function (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    };
    return User;
};

export { User as Account, initializeAccountModel };
