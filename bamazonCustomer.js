// bamazonCustomer.js
// 18/May/2019

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


//============================================================================ Functions
function actionOrder(){};

// - - - - - - - - - - - - - - Process Options
function processOptions(){
    inquirer
      .prompt (q1)
      .then (
        function (resp) {
            if (resp.action === "Place an order of these products") { actionOrder() };
            if (resp.action === "Exit"                            ) { connection.end(); };
        }
      );
};

function showProducts(item, index){
    var id    = "" + item.item_id;
    var name  = item.product_name;
    var price = "" + item.price;
    console.log("|| " + 
                id.padStart(3)     + "  ||  " + 
                name.padEnd(40)    + "  ||  " + 
                price.padStart(6)  + "  ||  ");
};

function showTitles(){
    console.log("=".repeat(68));
    console.log("||  id  ||" +
                " ".repeat(16) +
                "product" +
                " ".repeat(21) +
                "||   price  ||");
    console.log("=".repeat(68));
};

function showCatalog(res){
    showTitles();
    res.forEach(showProducts);
    console.log("=".repeat(68));
};

function processProducts(){
    var query = connection.query(
        "SELECT item_id, product_name, price FROM products",
        function(err, res) {
          //console.log("res:", res, "err:", err);
          showCatalog(res);
          processOptions();
        }
      );
};

function connectDb() {
    connection.connect(function(err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");
        processProducts();
      });
};


//============================================================================ Execution
connectDb();
