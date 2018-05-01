require("dotenv").config();

var keys = require("./keys.js");
var mysql = require("mysql");
var inquirer = require("inquirer");

//get SQL Password from .env file
//store SQL Password in a variable
var sql_PW = keys.mySQL_DB.SQL_key

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    user: "root",

    password: sql_PW,
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    runBamazon();
});

//create functions etc
function runBamazon() {
    console.log("\nWELCOME TO BAMAZON")
    console.log("Here are all products for purchase...");
    console.log("------------------------------------------------------------");
    connection.query("SELECT item_ID, product_name, price FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log("ID--" + res[i].item_ID
                + ":  " + res[i].product_name
                + " -- ($" + res[i].price + ")");
        }
        console.log("------------------------------------------------------------");

        inquirer
            .prompt([
                {
                    name: "ID",
                    type: "input",
                    message: "What is the ID # of the product you want?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many do you want?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (answer) {
                var query = "SELECT product_name, price, stock_quantity FROM products WHERE ?";
                connection.query(query, { item_ID: answer.ID }, function (err, res) {
                    console.log("\n-------------------------");
                    console.log("You are requesting " + answer.quantity + " " + res[0].product_name + "(s) "
                                + "for $" + res[0].price + "/ea");

                    if (res[0].stock_quantity === 0) {
                        console.log("Sorry. Item Currently Out of Stock.");
                        console.log("-------------------------\n");
                        return shopMore();
                    }

                    else if (answer.quantity > res[0].stock_quantity) {
                        console.log("Sorry. Not enough in stock to fulfill order.");
                        console.log("-------------------------\n");
                        return shopMore();
                    } 
                                    
                    else {
                        console.log("You're in Luck! We still have " + res[0].stock_quantity + " in stock.");
                        console.log("-------------------------\n");

                        inquirer
                            .prompt(
                                {
                                    name: "confirm",
                                    type: "confirm",
                                    message: "Would you like to continue with purchase?",
                                    default: true
                                })
                            .then(function (answer2) {
                                if (answer2.confirm) {
                                    console.log("\nTHANK YOU");
                                    console.log("-------------------------");
                                    console.log("Your Total purchase comes to: $" + (answer.quantity * res[0].price).toFixed(2));
                                    console.log("-------------------------\n");

                                    var query = "UPDATE products SET ? WHERE ?";
                                    var new_Qty = res[0].stock_quantity - answer.quantity;
                                    connection.query(query, 
                                        [
                                        { 
                                            stock_quantity: new_Qty 
                                        }, 
                                        { 
                                            item_ID: answer.ID
                                        }
                                        ], 
                                        function(err, res) {
                                        });
                        
                                    return shopMore();
                                }
                                else {
                                    console.log("---");
                                    return shopMore();
                                }
                            });

                        
                    }
                });
            });
    });

};


function shopMore() {
    inquirer
        .prompt(
            {
                name: "confirm",
                type: "confirm",
                message: "Would you like to shop again?",
                default: true
            })
        .then(function (answer) {
            if (answer.confirm) {
                runBamazon();
            }
            else {
                console.log("\nThanks! Come again!\n");
                connection.end();
            }
        });

};