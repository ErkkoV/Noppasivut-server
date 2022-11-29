## Noppasivut-back

### About Noppasivut

Noppasivut is a dice-roller and probability-calculator for a roleplaying system. It enables users to join same session in order to chat and share dicel rolls and probability calculations.

### Stuff used

Noppasivut-back uses node.js to run the back-end, socket.io to connect the back-and front-end and node-postgres for the postgreSQL-database connection.

### Build

With docker:

```
docker-compose up --build -d
```

With npm

```
npm start
```

### Noppasivut front

Noppasivut-back works with Noppasivut-Front:
https://github.com/ErkkoV/Noppasivut-front
