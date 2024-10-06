import { body } from 'express-validator';

const Ticketvalidator = {

    initEvent: [
        body('name').notEmpty().withMessage('name field is requred').isString().withMessage('name must be strings'),
        body('totalTickets').notEmpty().withMessage("totaltickets field is required"),
    ],

    bookEvent: [
        body('eventId')
            .notEmpty().withMessage("eventId field is required")
            .isNumeric().withMessage("eventId must be a number"),
    ]

}

export default Ticketvalidator;
