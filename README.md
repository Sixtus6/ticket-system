# niyo-group-assessment

# Task App Backend System

This project is a backend system for a task management application developed using TypeScript, Node.js, Socket.io for real-time notifications, Swagger for API documentation, PostgreSQL with Sequelize for database management, and Express-validator for request body validation. The application is dockerized and can be run using Docker Compose.

## Table of Contents
* [Technologies Used](#technology)
* [Getting Started](#gettingstarted)
* * [Prerequisites](#prerequisites)
* * [Installation](#installation)
* * [Usage](#usage)
* [API Documentation](#documentation)
* [Real-Time Notifications](#socket)
* [Development](#development)
* * [Project Structure](#structure)
* * [Scripts](#script)
* [Docker](#docker)
* * [Docker Compose](#docker-compose)
* [Conclusion](#conclusion)

## Technologies Used
* TypeScript: For writing scalable code.
* Node.js: JavaScript runtime for server-side development.
* Socket.io: For real-time notifications when tasks are created.
* Swagger: For API documentation.
* PostgreSQL: Relational database.
* Sequelize: ORM for PostgreSQL.
* Express-validator: For request body validation.
* Docker: For containerization.
* Docker Compose: For orchestrating multi-container Docker applications.

## Getting Started
### Prerequisites
Make sure you have the following installed:

* Node.js (version 14 or later)
* Docker
* Docker Compose

## Installation
Clone the repository:

bash
Copy code
git clone https://github.com/ralphbetta/niyo-group-assessment.git
cd niyo-group-assessment

##### 1. Clone the repository:
  ```
  $ git clone https://github.com/ralphbetta/niyo-group-assessment.git

  # Go into the repository
  $ cd niyo-group-assessment
  ```

##### 3. Run the application:
  ```
  docker-compose up
  ```

##### 2. Set up environment variables: (OPTIONAL) -  If you intend to run this without docker
* Create a .env file in the root directory and add the necessary environment variables. Refer to .env.example for guidance.
* and ensure your postgres database is running
* you can also change database connection dialect from postgres to mysql if you're using an sql database
```
  # Install all dependences
  $ npm install
```

## Usage
### API Documentation
The API documentation is available at:
  ```
 http://localhost:3035/docs
  ```
This documentation is set up using Swagger and provides detailed information about each endpoint, including request and response formats and model.

## Real-Time Notifications
To receive real-time notifications for task creation:

1. Use a WebSocket client like Postman.
2. Connect to the socket URL with the correct userId:
  ```
 http://localhost:3035?userId=1
  ```
3. Listen to the task event to receive notifications about newly created tasks of user with id of 1.
NB: this should be the userId of the authenticated user


## Development
### Project Structure
```
├── Dockerfile
├── README.md
├── docker-compose.yaml
├── init.sql
├── node_modules
├── package-lock.json
├── package.json
├── src
│   ├── config
│   │   ├── environment.config.ts
│   │   ├── response.config.ts
│   │   └── swagger.config.ts
│   ├── controllers
│   │   ├── account.controller.ts
│   │   └── task.controller.ts
│   ├── docs
│   │   ├── authentication.ts
│   │   └── task.ts
│   ├── index.ts
│   ├── interfaces
│   │   └── index.ts
│   ├── middleware
│   │   └── token.middleware.ts
│   ├── models
│   │   ├── accout.model.ts
│   │   ├── database
│   │   ├── database.connection.ts
│   │   ├── database.relationship.ts
│   │   └── task.model.ts
│   ├── routes
│   │   └── app.routes.ts
│   ├── services
│   │   ├── account.service.ts
│   │   ├── socket.service.ts
│   │   └── task.service.ts
│   └── validators
│       ├── account.validators.ts
│       └── task.validators.ts
├── tsconfig.json
└── tslint.json

```

## Scripts
* npm run start: Start the application.
* npm run dev: Start the application in development mode.
* npm run build: Compile TypeScript to JavaScript.

## Docker
### Docker Compose

The application can be run using Docker Compose. This sets up the necessary containers for the Node.js application and PostgreSQL database.

To start the application with Docker Compose:
```
docker-compose up
```
This will start the services defined in the docker-compose.yml file.

## Conclusion
This project is an assessment submitted to NIYO GROUP.