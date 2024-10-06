import { body } from 'express-validator';

const AccountValidator = {
    signup: [
        body('email').notEmpty().withMessage('Email field is requred').isString().withMessage('Email must be strings').isEmail().withMessage('Must be a valid email'),
        body('username').notEmpty().withMessage("username field is required").isString().withMessage('Username must be strings'),
        body('name').notEmpty().withMessage("name field is required").isString().withMessage('Name must be strings'),
        body('password').notEmpty().withMessage("password field is required with strong password"),
    ],
    signin: [
        body('email').notEmpty().withMessage('Email field is requred').isString().withMessage('Email must be strings').isEmail().withMessage('Must be a valid email'),
        body('password').notEmpty().withMessage("password field is required with strong password"),
    ]

}

export default AccountValidator;
