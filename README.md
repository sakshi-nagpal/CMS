BALOO is the next generation content authoring tool for myITLabGrader project. The application architecture has been created using the popular [MEAN](https://github.com/meanjs/mean) stack framework.

## Before You Begin
Before you begin we recommend you read about the basic building blocks that assemble the BALOO application:

* MongoDB - http://mongodb.org/
* Express - http://expressjs.com/
* AngularJS - http://angularjs.org/
* Node.js - http://nodejs.org/

## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:

* Node.js - [Download & Install Node.js](http://www.nodejs.org/download/) and the npm package manager. If you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages. Make sure you've installed Node.js and npm first, then install bower globally using npm:

```bash
$ npm install -g bower
```

* Grunt - You're going to use the [Grunt Task Runner](http://gruntjs.com/) to automate your development process. Make sure you've installed Node.js and npm first, then install grunt globally using npm:

```bash
$ npm install -g grunt-cli
```

## Installing BALOO Application (Development Environment)
To install BALOO Application, you need to clone its repository and setup its database.

### Cloning The GitHub Code Repository
You can also use Git to directly clone the BALOO repository:

```bash
$ git clone "https://devops-tools.pearson.com/stash/scm/baloo/baloo_app_code.git"
```

This will clone the latest version of the BALOO repository to a **baloo_app_code** folder.

### Getting the database
Since the MongoDB will already be installed by now:

* start mongo: open cmd, type **mongod**, you will need to create "data/db" folders in your current drive (e.g. Windows C: Drive, create C:\Data\db).
* get latest dev database from ``` https://github.com/sakshi-nagpal/CMS.git ```
* in the data/db directory, copy the 2 “baloo-dev” data files(“baloo-dev.0”,”baloo-dev.ns”) from baloo_app_content\dev

### Compiling Your Application

The first thing you should do is install the Node.js dependencies. The application comes pre-bundled with a package.json file that contains the list of modules you need to start your application.

To install Node.js dependencies you're going to use npm again. In the application folder run this in the command-line:

```bash
$ npm install
```

The second thing you need to do is to create an application directory in user-home

* On Command Prompt inside <user home>, e.g (‘C:\Users\<user-name>’) write: **mkdir .baloo** (for keeping project configuration files)

### Running Your Application

* On Command Prompt inside your project home folder, write:
```bash
$ grunt
```

Your application should run on port 3000, so in your browser just go to [http://localhost:3000](http://localhost:3000)

That's it! Your application should be running by now.

## Testing Your Application
You can run the full test suite with the test task:

```
$ grunt test
```

**More Informantion

This will run both the server-side tests (located in the app/tests/ directory) and the client-side tests (located in the public/modules/*/tests/).

To execute only the server tests, run the test:server task:

```
$ grunt test:server
```

And to run only the client tests, run the test:client task:

```
$ grunt test:client
```