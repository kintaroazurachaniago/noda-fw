# Noda-fw
  
This framework was made by kintaro azura chaniago from bencoolen city, indonesia.

# Instalation

```console
$ npm install noda-fw
```

or you can do this

```console
$ npm install github:kintaroazurachaniago/noda-fw
```

# Quick Start

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

```console
$ node index
```

the output in the console should be like this

```console
Server running on port 4120
Database exist!         :       Using "app" database
Table exist!            :       Using "users" table
Working on C:\coding\Space\Tutorial\Nodejs\v1
```

Now you can try to visite http://127.0.0.1:4120 on your browser app.

# How to use?

### Route

Route object has two method which is get() and post(). both of them need two parameter which is the url as the first one and the callback as the second one. look at here

```js
// Get method
Route.get('/user/create', (req, res) => {
  res.end(`<form action="/user/save" method="post"><input type="text" name="username"/><button>Create</button></form>`)
})

// Post method
Route.post('/user/save', (req, res) => {
  res.end(JSON.stringify(req.form))
})
```

### Controller

We can store the second parameter of Route.get() and Route.post() method into the other module which is called **Controller**. in this controller we just need to export the callbacks. and we can also use the local-db as well in the controller file

```js
module.exports = {

  home : {
  
    index : (req, res) => {
      res.end('Hello world')
    }
    
  },
  
  user : {
  
    create : (req, res) => {
      res.end(`<form action="/user/save" method="post"><input type="text" name="username"/><button>Create</button></form>`)
    },
    
    save : (req, res) => {
      res.end(JSON.stringify(req.form))
    }
    
  }
  
}
```
