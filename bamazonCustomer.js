var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    user: "root",

    password: "",
    database: "bamazon_DB"
});

connection.connect(function(err) {
    if (err) throw err;
    //call a function to run etc.
});

//create functions etc