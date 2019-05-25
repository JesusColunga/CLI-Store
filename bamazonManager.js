// bamazonManager.js
// 25/May/2019

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
var q1 = [
    {type:    "number",
     message: "Please type the 'id' of the product you want to increment:",
     name:    "q1Id"},
    {type:    "number",
     message: "How many units of the product would you like to add?",
     name:    "q1Qty"}
    ];
var q2 = [
    {type:    "input",
     message: "Please type the product name to add:",
     name:    "q2ProdName"},
     {type:    "input",
     message: "Type the product department:",
     name:    "q2Dep"},
     {type:    "number",
     message: "Type the product price:",
     name:    "q2Price"},
     {type:    "number",
     message: "Stock quantity:",
     name:    "q2Qty"},
    ];
var fs = require("fs");
var s = "";   // String for general use.

// OBJECTS
// =======================================================================================
var info = {
    menuOpt        : "",
    q1Id           : "",
    q1Qty          : 0,
    stock_quantity : 0,
    q2ProdName     : "",
    q2Dep          : "",
    q2Price        : 0,
    q2Qty          : 0
};

// Functions
//============================================================================ 
function writeLog (strg) {
    fs.appendFile("logMgr.txt", 
                  strg, 
                  function(err) {
                    if (err) {
                        return console.log("Error writing the log file:", err);
                    };
                  }
                 );
};
// - - - - - - - - - - - - - - Add New Product
function queryNewProd(){
    var query = connection.query(
        // agregar el producto nuevo - "UPDATE products SET ? WHERE ?",
        "INSERT INTO products SET ?",
		{ product_name    : info.q2ProdName,
          department_name : info.q2Dep,
          price           : info.q2Price,
          stock_quantity  : info.q2Qty
        },
        function(err, reg) {
            if (err) throw err;
            console.log("\nProduct added.\n");
            writeLog("\nProduct added.\n");
            processProducts();
        }
      );
};

function processNewProd(){
    inquirer
      .prompt (q2)
      .then ( function (resp) { 
          info.q2ProdName = resp.q2ProdName;
          info.q2Dep      = resp.q2Dep;

          if ( !isNaN(resp.q2Price) ) {
            info.q2Price = parseFloat(resp.q2Price);
          } else {
              console.log("Not a valid price.");
              writeLog("Not a valid price.");
              connection.end();
              return;
          };

          if ( !isNaN(resp.q2Qty) ) {
            info.q2Qty = parseFloat(resp.q2Qty);
          } else {
              console.log("Not a valid quantity.");
              writeLog("Not a valid quantity.");
              connection.end();
              return;
          };

          queryNewProd();
        } );
};

// - - - - - - - - - - - - - - Add to Inventory
function addExistence(){
    var query = connection.query(
		"UPDATE products SET ? WHERE ?",
		[ {stock_quantity: info.stock_quantity + info.q1Qty},
		  {item_id: info.q1Id} ],
        function(err, reg) {
            if (err) throw err;
            console.log("\nQuantity updated.\n");
            writeLog("\nQuantity updated.\n");
            processProducts();
        }
      );
};

function processExistenceValidate (reg){
    if (reg.length <= 0) {
        connection.end();
        console.log("Error identifing the product Id you typed.");
    } else {
        info.stock_quantity = parseFloat(reg[0].stock_quantity);
        addExistence();
    };
};

function checkExistence(){
    var query = connection.query(
        "SELECT * FROM products WHERE ?",
        {item_id: info.q1Id},
        function(err, reg) {
            if (err) throw err;
            processExistenceValidate (reg);
        }
      );
};

function processAddInv(){
    inquirer
      .prompt (q1)
      .then ( function (resp) { 
          info.q1Id = resp.q1Id;
          if ( !isNaN(resp.q1Qty) ) {
            info.q1Qty = parseFloat(resp.q1Qty);
            checkExistence(); 
          } else {
              console.log("Not a valid quantity.");
              writeLog("Not a valid quantity.");
              connection.end();
          }
        } );
};

// - - - - - - - - - - - - - - Common to some processes
function showProducts(item, index){
    var id    = "" + item.item_id;
    var name  = item.product_name;
    var price = "" + item.price;
    var stock = "" + item.stock_quantity;
    s += "\n|| "            + 
         id.padStart(3)     + "  ||  " + 
         name.padEnd(40)    + "  ||  " + 
         price.padStart(6)  + "  ||  " +
         stock.padStart(5)  + "  ||";
};

function showTitles(){
    return "\n"             + 
           "=".repeat(79)   +
           "\n||  id  ||"   +
           " ".repeat(16)   +
           "product"        +
           " ".repeat(21)   +
           "||   price  ||" +
           "  stock  ||"    +
           "\n"             +
           "=".repeat(79);
};

function showCatalog(resp){
    var strCat = showTitles();
    resp.forEach(showProducts);
    strCat += s + "\n" + "=".repeat(79) + "\n";
    console.log(strCat);
    writeLog(strCat);
    connection.end();
};
// - - - - - - - - - - - - - - View Low Inventory
function processLowInv(){
    var query = connection.query(
        "SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5",
        function(err, resp) {
            if (err) throw err;  
            showCatalog(resp);
        }
      );
};

// - - - - - - - - - - - - - - View Products for Sale
function processProducts(){
    var query = connection.query(
        "SELECT item_id, product_name, price, stock_quantity FROM products",
        function(err, resp) {
            if (err) throw err;  
            showCatalog(resp);
        }
      );
};

// - - - - - - - - - - - - - - Menu
function checkMenuOption () {
    if (info.menuOpt === "View Products for Sale") processProducts(); else
    if (info.menuOpt === "View Low Inventory"    ) processLowInv();   else
    if (info.menuOpt === "Add to Inventory"      ) processAddInv();   else
    if (info.menuOpt === "Add New Product"       ) processNewProd(); 
};

function connectDb() {
    connection.connect(function(err) {
        if (err) throw err;
        writeLog("connected as id " + connection.threadId + "\n");
        checkMenuOption();
      });
};

function processMenu(){
    inquirer
      .prompt (menuOps)
      .then ( function (resp) {
          info.menuOpt = resp.action;
          if (info.menuOpt !== "Exit"){
                connectDb();
              };
       });
};

// Execution
//============================================================================
processMenu();