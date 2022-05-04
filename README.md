# Noda-fw
  [![NPM Version][npm-version-image]][npm-url]
  [![NPM Install Size][npm-install-size-image]][npm-install-size-url]
  [![NPM Downloads][npm-downloads-image]][npm-downloads-url]
This framework was made by kintaro azura chaniago from bencoolen city, indonesia.

# Instalation

```console
$ npm install noda-fw
```

or you can do this

```console
$ npm install github:kintaroazurachaniago/noda-fw
```

# Usage

Create one index file. here we create new one index file named "index.js" in the root directory of the project

```js
// getting noda-fw from node_modules
const { Start, Route, Controller } = require('noda-fw')
const { home } = Controller

// register visitable routes
Route.get('/', home.index)

// starting the project
Start(Route, 4120, _ => console.log('Server running on port 4120'))
```

that's all.

and then try to run this file by execute this command

> node index

the output in the console should be like this

```console
Server running on port 4120
Database exist!         :       Using "app" database
Table exist!            :       Using "users" table
Working on C:\coding\Space\Tutorial\Nodejs\v1
```

Now you can try to visite http://127.0.0.1:4120 on your browser app.
