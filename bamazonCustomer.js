// bamazonCustomer.js
// 20/May/2019

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



//============================================================================ Functions
function writeLog (strg) {
    fs.appendFile("log.txt", 
                  strg, 
                  function(err) {
                    if (err) {
                        return console.log("Error writing the log file:", err);
                    };
                  }
                 );
};

// - - - - - - - - - - - - - - 
function actionOrder(){};

// - - - - - - - - - - - - - - Process Options
function processOptions(){
    inquirer
      .prompt (q2)
      .then (
        function (resp) {
            console.log("Respuestas:", resp.q2Id, resp.q2Qty);

            connection.end();
        }
      );
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
          showCatalog(res);
          processOptions();
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


//============================================================================ Execution
connectDb();
