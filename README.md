<h1 align="center">
  <img alt="taxi-api" title="taxi-api" src=".github/logo.png" width="100px" />
</h1>

<h3 align="center">
  Taxi api - Api for book a trip
</h3>

<h4 align="center">
  NestJS + Docker + Typescript
</h4>
</br>

<p align="center">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/AlexandreMacedo/taxi-api?color=%2304D361">

  <a href="https://github.com/AlexandreMacedo">
    <img alt="Made by Alexandre" src="https://img.shields.io/badge/made%20by-Alexandre-%2304D361">
  </a>

  <img alt="License" src="https://img.shields.io/badge/license-MIT-%2304D361">

  <a href="https://github.com/AlexandreMacedo/user/stargazers">
    <img alt="Stargazers" src="https://img.shields.io/github/stars/AlexandreMacedo/taxi-api?style=social">
  </a>
</p>

<p align="center">
  <a href="#needed">Needed</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#how-to-use">How to use</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#endpoints">Endpoints</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#api-documentation">Api documentation</a>
</p>

# taxi-api

This project was built with NestJS and TypeScript to book trips

## Needed

- Git (https://git-scm.com/)
- Node (https://nodejs.org/en/)
- Docker (https://www.docker.com/products/docker-desktop)

## How to use

To clone and run this application, you'll need [Git](https://git-scm.com), [Node.js][nodejs] or higher installed on your computer. From your command line:

Cloning

```bash
# Clone this repository
$ git clone https://github.com/alexandremacedo/taxi-api.git

# Go into the repository
$ cd taxi-api
```

To run in dev mode

```bash
# Install all dependencies
$ npm install

# Start the dev server
$ npm run start:dev

# Server is running at http://localhost:3000
```

To run with containers

```bash
# Create and start the production server
$ docker-compose up --build -d

# Server is running at http://localhost:3000
```

To easily test the api requests
```bash
# You will need to download the REST Client extension
# And access the path /api/client.http
```

To run the tests

```bash
# Running all tests
$ npm run test

# Running test coverage
$ npm run test:cov
```

## Endpoints

Routes:

| Method | Endpoint                | Controller               | Action         | Authentication |
| ------ | ----------------------- | ------------------------ | -------------- | -------------- |
| POST   | /passenger/trip         | \src\trip\trip.controler | create trip    | yes            |
| POST   | /driver/:tripId/confirm | \src\trip\trip.controler | confirm trip   | yes            |
| POST   | /driver/:tripId/finish  | \src\trip\trip.controler | finish trip    | yes            |
| GET    | /driver/trip            | \src\trip\trip.controler | list all trips | yes            |
| DELETE | /driver/:tripId         | \src\trip\trip.controler | cancel trip    | yes            |

## Decisions

About the software

- The software was built with NestJS + Typescript.
- NestJS has multiple tools that keep the software simple and scalable.
- It's easy to implement microservices and event design concepts.
- I've used Ports and Adapters architectural pattern, to loosely-coupled interchangeable components

Business rules

- Passenger only book a trip if there's no trips in progress.
- Only driver could cancel a trip.
- Driver could cancel a trip if it's not confirmed.
- Once a trip is confirmed all pending trips for passenger and driver are soft deleted.

Future implementation

- Should validate all inputs, using class-validator package

## API Documentation

[Swagger Documentation](https://app.swaggerhub.com/apis/alexandremacedo/taxi-api/1.0.0#/Waypoints)

Disclaimer
- The authentication is mocked by adding the query parameter "user_id"
- Requests for /passenger the parameter will act like "passenger_id"
- Requests for /driver the parameter will act like "driver_id"
- The GET /driver/trip is for tests porpouses only

# License

The taxi-api is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

[nodejs]: https://nodejs.org/
