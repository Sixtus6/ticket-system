# Event Ticket Booking System

This repository contains the source code for an **Event Ticket Booking System** built using **Node.js**, **Express**, and **Sequelize ORM**. The system manages event ticket bookings, a waiting list, and ticket reallocations via **RabbitMQ** for queueing, supporting concurrent ticket booking and cancellation.

## User Stories

### 1. As a User:
- I want to create an account and log in so I can book event tickets.
- I want to view all available events.
- I want to book an event ticket if available.
- If no tickets are available, I want to be added to a waiting list.
- I want to cancel my booking and release the ticket for others on the waiting list.

### 2. As an Admin:
- I want to create an admin account to manage events and bookings.
- I want to initialize new events with a specified number of tickets.
- I want to see the status of any event, including the number of booked and available tickets, and the length of the waiting list.
- I want to view all users' accounts.

---

## Project Setup

### Prerequisites

Make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Project

You can run the project using Docker and Docker Compose.

1. Clone the repository:

    ```bash
    git clone https://github.com/Sixtus6/ticket-system
    cd your-repository-name
    ```

After cloning the repository, navigate into the project directory to start the setup process.

2. Build and run the Docker containers:

    ```bash
    docker-compose up --build
    ```

3. Your application will be available at:

    ```
    http://localhost:3000
    ```

---

## API Documentation

### Base URL

- **User Routes**: `/api`
- **Admin Routes**: `/admin`

### **User Routes**:

| HTTP Method | Route                       | Description                                    |
|-------------|-----------------------------|------------------------------------------------|
| POST        | `/createaccount`            | Create a new user account                      |
| POST        | `/loginaccount`             | Log in as a user                               |
| GET         | `/events`                   | Get all available events                       |
| GET         | `/account`                  | Get user account details (secured)             |
| POST        | `/book`                     | Book a ticket for an event (secured)           |
| POST        | `/cancelbooking`            | Cancel an existing booking (secured)           |

### **Admin Routes**:

| HTTP Method | Route                       | Description                                      |
|-------------|-----------------------------|--------------------------------------------------|
| POST        | `/createaccount`            | Create an admin account                          |
| GET         | `/accounts`                 | Get all user accounts (secured for admins)       |
| POST        | `/initialize`               | Initialize a new event with a ticket count       |
| GET         | `/status/:eventId`          | Get the status of a specific event               |

---

## Design Choices

### 1. **Event Ticket Booking with Concurrency Handling**
   - The system allows multiple users to book tickets concurrently. To prevent race conditions during booking, the event row is locked using the `transaction.LOCK.UPDATE` to ensure that multiple users cannot simultaneously book the last remaining tickets.
   - The transaction ensures that either a ticket is successfully booked, or the user is placed on the waiting list if no tickets are available.

### 2. **Waiting List and Reallocation using RabbitMQ**
   - RabbitMQ is used to queue users on the waiting list. When a user cancels a booking, RabbitMQ triggers a consumer to process the waiting list, reallocating the ticket to the first user in the queue.
   - This asynchronous reallocation ensures that tickets are reallocated efficiently without overloading the server.

### 3. **Atomic Transactions**
   - All operations related to ticket booking and cancellation are wrapped in database transactions. This guarantees that either all operations complete successfully or none of them do, ensuring data consistency.
   - When a booking or cancellation fails due to any reason (e.g., no tickets available or database issues), the transaction is rolled back to prevent partial updates.

### 4. **Security**
   - User routes are secured using JWT-based token authentication (`TokenMiddleware.verifyToken`).
   - Admin routes are secured using a separate admin token validation (`TokenMiddleware.verifyAdminToken`), ensuring that only admins can initialize events and view sensitive data.

---

## Handling Concurrency

### 1. **Concurrency in Ticket Booking**:
   - When a user attempts to book a ticket, the system uses a **database transaction** with `LOCK UPDATE` to lock the event row. This ensures that only one user can book a ticket at any given time, even if multiple requests are made concurrently. If another user attempts to book the same ticket, they must wait until the transaction is completed or fail if no tickets remain.
   - This approach effectively prevents **race conditions** when booking the last remaining tickets.

### 2. **Concurrency in Reallocation**:
   - RabbitMQ is used to queue users in the waiting list. When a ticket becomes available (due to a cancellation), the queue consumer automatically reallocates the ticket to the next user in line. The consumer processes one message at a time, ensuring that only one user is assigned the available ticket.
   - The transaction ensures that ticket reallocation happens atomically, preventing issues like double allocation of a single ticket.

---
