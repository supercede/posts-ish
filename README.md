# posts-ish

A RESTful API for managing posts.

### Features

- Registration & login with email & password
- Authentication with JWT
- Send an email to a user after registration
- Password reset
- Publish a post
- Fetch a post
- Delete a post
- Edit a post
- A user can upload images

### Prerequisites

Ensure you have the following installed on your local machine:

- [NodeJS](https://nodejs.org/en/download/)
- [MySQL](https://www.mysql.com/downloads/) or use a cloud database hosting service
- [RabbitMQ](https://www.rabbitmq.com/download.html) or a cloud alternative (e.g., [CloudAMQP](https://www.cloudamqp.com/))
- [Redis](https://redis.io/download) or a cloud alternative

### Technologies Used

- [NodeJS](https://nodejs.org/en/download/) - A cross-platform JavaScript runtime
- [ExpressJS](https://expressjs.com/) - NodeJS application framework
- [MySQL](https://www.mysql.com/downloads/) - A relational database management system
- [Sequelize ORM](https://sequelize.org/) - A promise-based Node.js ORM for relational databases
- [RabbitMQ](https://www.rabbitmq.com/download.html) - An open-source message-broker software

## Project Pipeline

- [API Docs](https://documenter.getpostman.com/view/8630438/TzJyaaEP)
- [Hosted API](http://posts-ish.herokuapp.com/)

## HTTP Requests

All API requests are made by sending a secure HTTPS request using one of the following methods, depending on the action being taken:

- `POST` Create a resource
- `GET` Get a resource or list of resources
- `PATCH` Update a resource
- `DELETE` Delete a resource

For `POST` and `PATCH` requests, the body of your request may include a JSON payload.

### HTTP Response Codes

Each response will be returned with one of the following HTTP status codes:

- `200` `OK` The request was successful
- `400` `Bad Request` There was a problem with the request (security, malformed)
- `404` `Not Found` An attempt was made to access a resource that does not exist in the API

### Errors and Status Codes

If a request fails any validations, expect a `400` status code with errors in the following format:

```source-json
{
  "errors":{
    "message": "validation error"
    "errors": {
      "password": "Password is required"
    }
  }
}
```

### Other status codes:

`401` for Unauthorized requests, when a request requires authentication but it isn't provided

`403` for Forbidden requests, when a request may be valid but the Users doesn't have permissions to perform the action

`409` Payload is in conflict with what exists in the server

`412` A precodition to perform an operation was not met

`404` for Not found requests, when a resource can't be found to fulfill the request

## Installing/Running locally

* Clone or fork repo

```bash
  - https://github.com/supercede/posts-ish.git
  - cd posts-ish
```

* Create/configure `.env` environment with your credentials. A sample `.env.example` file has been provided. Make a duplicate of `.env.example` and rename to `.env`, then configure your credentials (ensure to provide the correct details)
* After configuring your database in accordance with the Sequelize config file (`src/config/sequelize-config.js`):

    - npm install
* Run `npm run dev` to start the server and watch for changes

## Documentation/Endpoints

- Check [Postman](https://documenter.getpostman.com/view/8630438/TzJyaaEP) documentation
