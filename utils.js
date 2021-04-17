const fs = require('fs');
const dataFile = './bank_data.json';
const readingDataError = 'An error occurred on the server while reading the data. Please try again in a few hours';

// general helper functions
function updateUser(data ,originUser, updatedUser){
  const userIndx = data.indexOf(originUser)
  data.splice(userIndx, 1, updatedUser);
  fs.writeFile(dataFile, JSON.stringify(data), (err) => {
    if (err) console.log(err); 
  });
}
function readDataFile(){
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch(err) {
    console.log(err);
    return false;
  }
}
function newUserValidation(user){
  if (isNaN(user.credit) || isNaN(user.cash)){
    return [400, 'One of the attributes you entered is invalid. Please note that the credit and cash should be a numbers'];
  }
  if (Number(user.credit) < 0 || (Number(user.credit) + Number(user.cash) < 0)){
    return [400, 'One of the attributes you entered is invalid. Please note that the credit can not be a negative number, and that the user can not exceed his credit limit.'];
  }
  const data = readDataFile();
  if (!data) return [502, readingDataError];
  const duplicate = data.find(el => el.id === user.id);
  if (duplicate) return [400, 'The user already exists in the system.'];
  return [201, `User ${user.id} was successfully created`];
}

exports.createUser = function (user) {
  if (!user.hasOwnProperty("id")) return [400, `No ID entered`];
  user["cash"] = user.hasOwnProperty("cash") ? Number(user.cash) : 0;
  user["credit"] = user.hasOwnProperty("credit") ? Number(user.credit) : 0;
  user["isActive"] = user.hasOwnProperty("isActive") ? (user.isActive ? true : false) : true;

  let returnContent = newUserValidation(user);
  if (returnContent[0].toString()[0] === '2') {
    const dataArr = readDataFile();
    if (!dataArr) return [502, readingDataError];
    dataArr.push(user);
    fs.writeFile(dataFile, JSON.stringify(dataArr), (err) => {
      if (err) returnContent = [502, readingDataError]; 
    });
  }
  return returnContent;
}

exports.depositing = function (id, amount) {
  if (isNaN(amount) || Number(amount) < 0){
    return [400, 'Invalid amount. Please note that the amount should be a positive number.'];
  }
  const dataArr = readDataFile();
  console.log(dataArr);
  if (!dataArr) return [502, readingDataError];
  const user = dataArr.find(el => el.id === id);
  if (!user) {
    return [400, `User ${id} does not exist`];
  }
  if (!user.isActive) return [400, `User ${id} is not active`];
  const updatedUser = {...user};
  updatedUser.cash = Number(updatedUser.cash) + Number(amount);
  updateUser(dataArr ,user, updatedUser)
  return [201, `The deposit was made successfully`];
}

exports.updateCredit = function (id, credit) {
  if (isNaN(credit) || Number(credit) < 0){
    return [400, 'Invalid credit. Please note that the credit should be a positive number.'];
  }
  const dataArr = readDataFile();
  if (!dataArr) return [502, readingDataError]; 
  const user = dataArr.find(el => el.id === id);
  if (!user) return [400, `User ${id} does not exist`];
  if (!user.isActive) return [400, `User ${id} is not active`];
  const updatedUser = {...user};
  updatedUser.credit = Number(credit);
  updateUser(dataArr ,user, updatedUser);
  return [201, `Credit updated successfully`];
}

exports.withdrawing = function (id, amount){
  if (isNaN(amount) || Number(amount) < 0){
    return [400, 'Invalid amount. Please note that the amount should be a positive number.'];
  }
  const dataArr = readDataFile();
  if (!dataArr) return [502, readingDataError]; 
  const user = dataArr.find(el => el.id === id);
  if (!user) return [400, `User ${id} does not exist`];
  if (!user.isActive) return [400, `User ${id} is not active`];
  const updatedCash = Number(user.cash) - amount;
  if (updatedCash + Number(user.credit) < 0) return [400, `Please note that the user can not exceed his credit limit`];
  user.cash = updatedCash;
  updateUser(dataArr ,user, user);
  return [201, `The withdraw was made successfully`];
}

exports.transfering = function (user1Id, user2Id, amount){
  if (isNaN(amount) || Number(amount) < 0){
    return [400, 'Invalid amount. Please note that the amount should be a positive number.'];
  }
  const dataArr = readDataFile();
  if (!dataArr) return [502, readingDataError]; 
  const user1 = dataArr.find(el => el.id === user1Id);
  if (!user1) return [400, `User ${user1Id} does not exist`];
  if (!user1.isActive) return [400, `User ${user1Id} is not active`];
  const user2 = dataArr.find(el => el.id === user2Id);
  if (!user2) return [400, `User ${user2Id} does not exist`];
  if (!user2.isActive) return [400, `User ${user2Id} is not active`];

  console.log(user1, user2)
  const withdrawingRes = exports.withdrawing(user1Id, amount);
  if (withdrawingRes[0].toString()[0] === '2'){
    const depositingRes = exports.depositing(user2Id, amount);
    if (depositingRes[0].toString()[0] === '2'){
      return [201, `The transfer was made successfully`];
    } else {
      exports.depositing(user1Id, amount);
      return depositingRes;
    }
  } else {
    return withdrawingRes;
  }
}

exports.getUser = function(id){
  const dataArr = readDataFile();
  if (!dataArr) return [502, readingDataError]; 
  const user = dataArr.find(el => el.id === id);
  if (!user) return [400, `User ${id} does not exist`];
  return [201, user];
}

exports.getAllUsers = function(){
  const data = readDataFile();
  if (!data) return [502, readingDataError]; 
  return [201, data];
}

exports.getFilteredUsers = function(amount){
  if (isNaN(amount)){
    return [400, 'Invalid amount. Please note that the amount should be a number.'];
  }
  const data = readDataFile();
  if (!data) return [502, readingDataError]; 
  const filtered = data.filter(user => user.cash === Number(amount));
  return [201, filtered];
}

exports.getActiveFilteredUsers = function(amount){
  const filteredUsersRes = exports.getFilteredUsers(amount);
  if (filteredUsersRes[0].toString()[0] === '2'){
    return [200, filteredUsersRes[1].filter(user => user.isActive)];
  } else return filteredUsersRes;
}