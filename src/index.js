/* eslint-disable no-undef */
const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const req = require('express/lib/request');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.body;

  const checkUsername = users.find(el => el.username === username);
  if (checkUsername) return response.status(400).json({ message: "user already registered" });

  req.checkUsername = username;

  next();
}

function checkUser(request, response, next) {
  const { username } = request.headers;

  const user = users.find(el => el.username === username);
  if (!user) return response.status(404).json({ message: "user not found" });

  request.user = user;

  return next();
}

app.post('/users', checksExistsUserAccount, (request, response) => {
  const { name, username } = request.body;

  users.push({ id: uuidv4(), name, username, todos: []});

  return response.status(201).json(users[0]);
});

app.get('/todos', checkUser, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checkUser, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(), title, done: false, deadline: new Date(deadline), created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checkUser, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const todo = user.todos.find(el => el.id === id);
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checkUser, (request, response) => {
  const { user } = request;
  const { done } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(el => el.id === id);
  todo.done = done;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checkUser, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const searchToDo = user.todos.findIndex(el => el.id === id);
  if (searchToDo === -1) {
    return response.status(404).json({ error: 'To do not found' });
  }
  user.todos.splice(searchToDo, 1);

  return response.status(204).end();
});

module.exports = app;