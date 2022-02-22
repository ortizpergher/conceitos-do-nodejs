const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({error: 'User not found.'})
  }

  request.user = user;
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const find = users.some((user) => user.username === username);

  if(find) {
    return response.status(400).json({error: 'User already exists.'})
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos:[]
  })

  return response.status(201).json({message: 'User registered.'})
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  return response.status(201).json({message: 'TODO registered.'})
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find(todo => todo.id = id);

  if(!todo) {
    return response.status(404).json({error: 'TODO not found.'})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(200).json({message: 'TODO Updated'})
});


app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id = id);

  if(!todo) {
    return response.status(404).json({error: 'TODO not found.'})
  }

  user.todos.splice(todo, 1);

  return response.status(200).json({message: 'TODO deleted'})
});

module.exports = app;