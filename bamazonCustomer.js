// bamazonCustomer.js
// 22/May/2019

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
function processUpdateDb(resp, res){};

function processSubtractQtySold(resp, res){
/*
    var query = connection.query(
        "SELECT * FROM products WHERE ?",
        {item_id: resp.q2Id},
        function(err, reg) {
          processExistenceValidate (resp, reg);
        }
      );

*/
    console.log("resp:", resp, "\nres:", res);
    connection.end();
    /*
However, if your store _does_ have enough of the product,
you should fulfill the customer's order.
- This means updating the SQL database to reflect the remaining quantity.
- Once the update goes through, show the customer the total cost of their purchase.
    */

};

function processCustomerOrder (resp, res){
    var st = "\nProcessing your order:" +
             "\nQuantity:    "          + 
             resp.q2Qty                 +
             "\nProduct Id:  "          +
             resp.q2Id                  +
             "\nDescription: "          +
             res[0].product_name        +
             "\n";
    console.log(st);
    writeLog(st);
    processSubtractQtySold(resp, res);
};

function processExistenceValidate (resp, res){
    var orderQty = parseFloat(resp.q2Qty);
    if (res.length <= 0) {
        console.log("Error identifing the product Id you typed.");
    } else {
        if (orderQty <= 0) {
            console.log("Quantity must be grater than cero.");
        } else
        if (parseFloat(res[0].stock_quantity) >= orderQty ) {
            processCustomerOrder(resp, res);
        } else {
            console.log("There is Insufficient Quantity of the product for your request!");
        };
    };
};

function checkExistence(resp){
    var query = connection.query(
        "SELECT * FROM products WHERE ?",
        {item_id: resp.q2Id},
        function(err, reg) {
          processExistenceValidate (resp, reg);
        }
      );
};

function askOrder(){
    inquirer
      .prompt (q2)
      .then ( function (resp) { checkExistence(resp); } );
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


//============================================================================ Execution
connectDb();

/*
lo que sigue:
7. Once the customer has placed the order,
   your application should check if your store has enough of the product to meet the customer's request.
   
   - If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.
8. However, if your store _does_ have enough of the product, you should fulfill the customer's order.
   - This means updating the SQL database to reflect the remaining quantity.
   - Once the update goes through, show the customer the total cost of their purchase.
   */