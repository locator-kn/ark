[![Stories in Ready](https://badge.waffle.io/locator-kn/backend.svg?label=ready&title=Ready)](http://waffle.io/locator-kn/ark)
[![Build Status](https://travis-ci.org/locator-kn/ark.svg?branch=master)](https://travis-ci.org/locator-kn/ark)
[![Coverage Status](https://coveralls.io/repos/locator-kn/ark/badge.svg)](https://coveralls.io/r/locator-kn/ark)

# Locator 


# use

> **Prerequisite:** You need to have installed io.js, npm, gulp and ImageMagick.

 - Clone this repository
```bash
git clone https://github.com/locator-kn/ark.git
```
```bash
cd ark
npm install
```
(you might need to fix various errors on Windows systems)

 - Now set up the database:
 Install couchdb and create a new database named 'app'. Then:
```bash
npm run setup
```

 - Set up the web-app
```bash
./build-webapp-dependency
```
 - To run the application, enter the following in to the terminal:
```bash
gulp
```

You can now open http://localhost:3001

If you want to see a swagger ui, go to [http://localhost:3001/documentation](http://localhost:3001/documentation)

# Documentation
This application is build on top of [iojs](https://iojs.org/) and used [hapijs](http://hapijs.com/) as the server framework.
The following plugins were design and included in the server:
 - [ark-chat](https://github.com/locator-kn/ark-chat)
 - [ark-locationpool](https://github.com/locator-kn/ark-locationpool)
 - [ark-database](https://github.com/locator-kn/ark-database)
 - [ark-trip](https://github.com/locator-kn/ark-trip)
 - [ark-user](https://github.com/locator-kn/ark-user)
 - [ark-mailer](https://github.com/locator-kn/ark-mailer)
 - [ark-realtime](https://github.com/locator-kn/ark-realtime)
 - [ark-authentication](https://github.com/locator-kn/ark-authentication)
