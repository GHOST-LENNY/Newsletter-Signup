//Require all needed npm modules 
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const client = require("@mailchimp/mailchimp_marketing");

const app = express();

//require the other js file (config.js)
const myConfig = require("./myConfig.js");
//for ES6 modules you have to use the .mjs extn & import to add the js file
// import config from "config.mjs";


// public folder holding css and image logo
app.use(express.static("public"));

// Using body-parser
app.use(bodyParser.urlencoded({
    extended: true
}));


app.listen(process.env.PORT || 4000, console.log("Success. Server is running on port 4000"));

// Sending Signup.html file to browser as soon request is made on localhost:4000
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html")
});


// Sign up button pressed, execute this
app.post("/", function (req, res) {
    let lastName = req.body.lName;
    let firstName = req.body.fName;
    let email = req.body.email;

    var list_id = myConfig.LIST_ID;

    // Setting up mailchimp
    client.setConfig({
        apiKey: myConfig.APIKEY,
        server: "us8",
    });

    // Uploading data to server
    const run = async () => {
        const response = await client.lists.batchListMembers(list_id, {
            members: [{
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }

            }]
            
        });
        console.log(response)

        if (response.errors.length) {
            throw new Error(response.errors[0].error)
        } else {
            res.sendFile(`${__dirname}/success.html`)
            console.log(`Successfully added contact as an audience member. The contact's id is ${response.new_members[0].id}.`)

        };

    }

    run()
        .catch(errors => {
            res.sendFile(`${__dirname}/failure.html`)
            console.log(errors, "Kpele bad things happen.");

        })
})

app.post("/failure", function (req, res) {
    res.redirect("/")
});
