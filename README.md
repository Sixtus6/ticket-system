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
git clone https://github.com/your-repository-url.git
cd your-repository-name
