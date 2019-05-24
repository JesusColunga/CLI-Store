// bamazonCustomer.js
// 24/May/2019

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
var q1 = [{
      type:    "list",
      message: "What do you want to do?",
      choices: ["Place an order of these products", "Exit"],
      name:    "action"
}];
var q2 = [
    {type:    "number",
     message: "Please type the 'id' of the product you want to buy:",
     name:    "q2Id"},
    {type:    "number",
     message: "How many units of the product would you like to buy?",
     name:    "q2Qty"}
    ];
var fs = require("fs");
var s = "";   // String for general use.

// OBJECTS
// =======================================================================================
var order = {
    item_id        : "",
    orderedQty     : 0,
    product_name   : "",
    price          : 0,
    stock_quantity : 0
};

// Functions
//============================================================================ 
function writeLog (strg) {
    fs.appendFile("logCst.txt", 
                  strg, 
                  function(err) {
                    if (err) {
                        return console.log("Error writing the log file:", err);
                    };
                  }
                 );
};

// - - - - - - - - - - - - - - 
function processUpdatedDb(resp){
    if (resp !== undefined) {
        console.log(resp.changedRows + " product updated!\n");
        console.log(
            "\nTotal amount of your order: $" + 
            (order.orderedQty * order.price)
        );
    };
    connection.end();
};

function processSubtractQtySold(){
	var query = connection.query(
		"UPDATE products SET ? WHERE ?",
		[ {stock_quantity: order.stock_quantity - order.orderedQty},
		  {item_id: order.item_id} ],
		function (err, resp) {
            if (err) throw err;
            processUpdatedDb(resp);
		}
	);
};

function processCustomerOrder (){
    var st = "\nProcessing your order:" +
             "\nQuantity:    "          + 
             order.orderedQty           +
             "\nProduct Id:  "          +
             order.item_id              +
             "\nDescription: "          +
             order.product_name         +
             "\n";
    console.log(st);
    writeLog(st);
    processSubtractQtySold();
};

function processExistenceValidate (reg){
    if (reg.length <= 0) {
        connection.end();
        console.log("Error identifing the product Id you typed.");
    } else {
        order.product_name = reg[0].product_name;
        if (order.orderedQty <= 0) {
            connection.end();
            console.log("Quantity must be grater than cero.");
        } else {
            order.stock_quantity = parseFloat(reg[0].stock_quantity);
            order.price = parseFloat(reg[0].price);
            if (order.stock_quantity >= order.orderedQty) {
                processCustomerOrder();
            } else {
                connection.end();
                console.log("There is Insufficient Quantity of the product for your request!");
            };
        }
    };
};

function checkExistence(){
    var query = connection.query(
        "SELECT * FROM products WHERE ?",
        {item_id: order.item_id},
        function(err, reg) {
            if (err) throw err;
            processExistenceValidate (reg);
        }
      );
};

function askOrder(){
    inquirer
      .prompt (q2)
      .then ( function (resp) { 
          order.item_id = resp.q2Id;
          if ( !isNaN(resp.q2Qty) ) {
            order.orderedQty = parseFloat(resp.q2Qty);
            checkExistence(); 
          } else {
              console.log("Not a valid quantity.");
              writeLog("Not a valid quantity.");
              connection.end();
          }
        } );
};

function showProducts(item, index){
    var id    = "" + item.item_id;
    var name  = item.product_name;
    var price = "" + item.price;
    s += "\n|| "            + 
         id.padStart(3)     + "  ||  " + 
         name.padEnd(40)    + "  ||  " + 
         price.padStart(6)  + "  ||  ";
};

function showTitles(){
    return "\n"             + 
           "=".repeat(68)   +
           "\n||  id  ||"   +
           " ".repeat(16)   +
           "product"        +
           " ".repeat(21)   +
           "||   price  ||" +
           "\n"             +
           "=".repeat(68);
};

function showCatalog(res){
    var strCat = showTitles();
    res.forEach(showProducts);
    strCat += s + "\n" + "=".repeat(68) + "\n";
    console.log(strCat);
    writeLog(strCat);
};

function processProducts(){
    var query = connection.query(
        "SELECT item_id, product_name, price FROM products",
        function(err, res) {
            if (err) throw err;  
            showCatalog(res);
            askOrder();
        }
      );
};

function connectDb() {
    connection.connect(function(err) {
        if (err) throw err;
        writeLog("connected as id " + connection.threadId + "\n");
        processProducts();
      });
};

// Execution
//============================================================================
connectDb();


/*
USE bamazon;

CREATE TABLE products (
  item_id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_name    VARCHAR(200)  NULL,
  department_name VARCHAR(100)  NULL,
  price           DECIMAL(10,2) NULL,
  stock_quantity  DECIMAL(10,2) NULL
);
*/