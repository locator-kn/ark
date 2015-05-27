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
```
```bash
npm install
```
(you might need to fix various errors on Windows systems)

 - Now set up the database:
 
set up database // TODO

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
