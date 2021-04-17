const express = require('express');
const { 
  createUser,
  depositing,
  updateCredit,
  withdrawing,
  transfering,
  getUser,
  getAllUsers,
  getFilteredUsers,
  getActiveFilteredUsers
} = require("./utils");
const app = express();
app.use(express.json());

// Add users
app.post("/api/bank/add-user", (req, res) => {
  console.log(req.body);
  const [statusCode, msg] = createUser(req.body);
  res.status(statusCode).send(msg);
});
// Depositing
app.post("/api/bank/users/:id/deposit", (req, res) => {
  const { id } = req.params;
  const amount = req.query.amount;
  const [statusCode, msg] = depositing(id, amount);
  res.status(statusCode).send(msg);
})
// Update credit
app.post("/api/bank/users/:id/update-credit", (req, res) => {
  const { id } = req.params;
  const credit = req.query.credit;
  const [statusCode, msg] = updateCredit(id, credit);
  res.status(statusCode).send(msg);
})
// Withdraw money
app.post("/api/bank/users/:id/withdraw", (req, res) => {
  const { id } = req.params;
  const amount = req.query.amount;
  const [statusCode, msg] = withdrawing(id, amount);
  res.status(statusCode).send(msg);
});
// Transferring
app.post("/api/bank/transfer", (req, res) => {
  const user1 = req.query.user1;
  const user2 = req.query.user2;
  const amount = req.query.amount;
  const [statusCode, msg] = transfering(user1, user2, amount);
  res.status(statusCode).send(msg);
});
// Show details of user
app.get("/api/bank/users/:id", (req, res) => {
  const { id } = req.params;
  const [statusCode, msg] = getUser(id);
  res.status(statusCode).send(msg);
});
// Show details of all users
app.get("/api/bank/users", (req, res) => {
  const [statusCode, msg] = getAllUsers();
  res.status(statusCode).send(msg);
});

// Can fetch users by amount of cash they have
app.get("/api/bank/filtered-users/filter-by-cash", (req, res) => {
  const amount = req.query.amount;
  const [statusCode, msg] = getFilteredUsers(amount);
  res.status(statusCode).send(msg);
});
app.get("/api/bank/filtered-users/active-users-filter-by-cash", (req, res) => {
  const amount = req.query.amount;
  const [statusCode, msg] = getActiveFilteredUsers(amount);
  res.status(statusCode).send(msg);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("listening..");
});
