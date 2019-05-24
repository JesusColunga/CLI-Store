// bamazonManager.js
// 23/May/2019

// GLOBAL VARIABLES
//============================================================================ Variables
var inquirer = require("inquirer");
var mysql = require("mysql");
var connection = mysql.createConnection ({
    host:     "localhost",
    port:     3306,
    user:     "jc",
    password: "jcs",
    database: "bamazon"
});
var menuOps = [{
    type:    "list",
    message: "What do you want to do?",
    choices: ["View Products for Sale",
              "View Low Inventory",
              "Add to Inventory",
              "Add New Product",
              "Exit"],
    name:    "action"
}];


// Functions
//============================================================================ 
function processMenu(){
    inquirer
      .prompt (menuOps)
      .then ( function (resp) { 

    } );
};

// Execution
//============================================================================
processMenu();