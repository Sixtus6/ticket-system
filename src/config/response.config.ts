const ApiResponse = {

    pass: {
        create: 'Created successfully',
        read: 'Fetched successfully',
        register: 'Account created successfully',
        ticket: 'Ticket booked',
        waiting_list: 'No tickets available. You have been added to the waiting list.',
        booking_canceled: 'Booking canceled and ticket reallocated if applicable',
        login: 'LoggedIn successfully',
        sucess_event: "Event created successfully",

    },

    fail: {
        bad_request: 'Bad Request',
        conflict: 'Data Already exist',
        unauthorized: 'Unauthorized',
        adminUnauthorized: 'Admin Unauthorized',
        not_found: 'Not Found',
        cannot_book: 'Sorry you cant cancel an event you have not booked',
        not_event_found: 'No Event available',
        server: 'Internal Server Error',
        forbidden: 'Forbidden',
        account_conflict: 'Account Already Exist',
        login: "Email or Password don't match",
    },

    code: {
        create: 201,
        success: 200,
        no_content: 204,
        bad_request: 400,
        unauthorized: 401,
        forbidden: 403,
        not_found: 404,
        conflict: 409,
        server_error: 500,
    }

}

export default ApiResponse;
// module.exports = ApiResponse;


