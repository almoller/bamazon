var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    user: "root",

    password: "Precip@22A",
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    //call a function to run etc.
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
                    console.log("You are requesting " + answer.quantity + " " + res[0].product_name + "(s).");

                    if (answer.quantity > res[0].stock_quantity) {
                        console.log("Sorry. Not enough in stock to fulfill order.");
                        console.log("-------------------------\n");
                        return shopMore();
                    }
                    else {
                        console.log("You're in Luck! We currently have " + res[0].stock_quantity + " in stock.\n");
                        console.log("Your Total purchase comes to: $" + (answer.quantity * res[0].price));
                        console.log("-------------------------\n");

                        var query = "UPDATE products SET ? WHERE ?";
                        //var qty = res[0].stock_quantity;
                        connection.query(query, [{ stock_quantity: (res[0].stock_quantity - answer.quantity) },{ item_ID: answer.ID }], function(err, res) {
                        console.log("Can You See Me?");
                        });
                        
                        return shopMore();
                    }
                });
            });
    });

};


// function updateProducts() {
//     var query = "UPDATE products SET ?";
//     //var qty = res[0].stock_quantity;
//     connection.query(query, { stock_quantity: stock_quantity - answer.quantity }, function (err, res) {
//         console.log("now there are " + res[0].stock_quantity + " in stock.");
//     })
// };

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
                console.log("\nThanks! Come again!");
                connection.end();
            }
        });

};