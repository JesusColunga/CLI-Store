// bamazonManager.js
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
var fs = require("fs");
var s = "";   // String for general use.

// OBJECTS
// =======================================================================================
var info = {
    menuOpt        : ""
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
    if (info.menuOpt === "Add to Inventory"      ) {} else
    if (info.menuOpt === "Add New Product"       ) {}; 
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