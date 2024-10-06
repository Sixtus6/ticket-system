import { Router, Request, Response } from "express";
import AccountController from "../controllers/account.controller";
import TokenMiddleware from "../middleware/token.middleware";

import AccountValidator from "../validators/account.validators";
import TicketController from "../controllers/ticket.controller";
import Ticketvalidator from "../validators/ticket.validators";

const router = Router();

router.post('/createaccount', AccountValidator.signup, AccountController.createAccount);
router.post('/loginaccount', AccountValidator.signin, AccountController.loginAccount);
router.get('/events', TicketController.getAllEvents)

// SECURED ACCOUNT ROUTES
router.get('/account', TokenMiddleware.verifyToken, AccountController.accountProfile);
router.post('/book', Ticketvalidator.bookEvent, TokenMiddleware.verifyToken, TicketController.bookEvent);
router.post('/cancelbooking', Ticketvalidator.bookEvent, TokenMiddleware.verifyToken, TicketController.cancelBookedEvent);


export default router;