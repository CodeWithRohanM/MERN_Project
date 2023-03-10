const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 3000;
const hbs = require("hbs");
const cookieParse = require("cookie-parser");

const authenticate = require("./src/Authetication/authenticateUser");

require("./src/DB/connection");
const userData = require("./src/Model/userDataModel");
const userRouter = require("./src/Routers/userDetailsRouter");
const cookieParser = require("cookie-parser");

app.use(express.json());

app.use(cookieParse());

app.use(userRouter);

app.use(express.urlencoded({ extended: false }));



// app.use(express.static("/Users/rohanmote/Desktop/Thapa Projects/Mini Projects/LogInForm Node_Express/logIn/BackEnd/public"));

app.set("view engine", "hbs");
hbs.registerPartials("/Users/rohanmote/Desktop/Thapa Projects/Mini Projects/LogInForm Node_Express/logIn/BackEnd/Partials");


app.get("/", (req, res) => {
    res.render("indexFile");
})

app.get("/register", (req, res) => {
    res.render("registrationPage");
});

app.get("/logIn", (req, res) => {
    res.render("LogInPage");
});

app.get("/welcome", (req, res) => {
    res.render("WelcomePage");
});

app.get("/error", (req, res) => {
    res.render("ErrorPage");
});

app.get("/resetPassword", (req, res) => {
    res.render("ResetPassword");
});

app.get("/secretPage", authenticate, (req, res) => {

    res.render("SecretPage.hbs");
    console.log(req.getData);

})

app.get("/signOut", authenticate, async (req, res) => {
    try {

        // LOGOUT FROM A SINGLE DEVICE
        // req.getData.tokenVal = req.getData.tokenVal.filter((curValue)=>{
        //      return curValue.firstToken !== req.token;
        // });




        //LOGOUT FROM MULTIPLE / ALL DEVICES
        req.getData.tokenVal = [];


        

        res.clearCookie("logInCookie");

        console.log("Cookie Cleared..");
        console.log(req.getData);

        await req.getData.save();
        res.render("LogInPage");
    } catch (err) {
        res.send("<h1>Cant Access!!</h1>")
    }

})





//REGISTERING THE USER AND STORING DETAILS IN DATABASE..
app.post("/registerUser", async (req, res) => {
    try {
        const getPassWord = req.body.password;
        const getconfirmPassword = req.body.confirmPassword;

        if (getPassWord === getconfirmPassword) {
            const insertData = new userData({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword,
                mobile: req.body.mobile,
            });

            //MIDDLEWARE FOR GENERATING REGISTRATION TOKEN
            const registerToken = await insertData.createToken();
            console.log("Register Token = " + registerToken);

            //ADD COOKIE TO A SITE WHEN USER REGISTERS HIMSELF ON THE SITE
            // IT ACCEPTS 2 PARAMETERS, FIRST IS ANY NAME YOU WANT TO GIVE TO COOKIE AND SECOND IS THE TOKEN GENERATED WHILE REGISTERING
            res.cookie("firstHandCookie", registerToken);




            const getData = await insertData.save();
            res.status(201).render("indexFile");
        }
        else {
            res.send("Please Enter Matching Passwords..");
        }
    } catch (err) {
        res.send(err);
    }

});


//CHECKING USER CREDENTIALS TO LOG HIM IN..
app.post("/loginUser", async (req, res) => {
    try {
        const getUserEmail = req.body.email;
        const getUserPassword = req.body.password;

        const getData = await userData.findOne({ email: getUserEmail });
        const getActualDatabasePassword = await getData.password;


        const getPasswordValidation = await bcrypt.compare(getUserPassword, getActualDatabasePassword);

        console.log(getPasswordValidation);

        if (getPasswordValidation) {

            // GENERATING LOGIN TOKEN
            const logInToken = await getData.createToken();
            console.log("Log In Token = " + logInToken);


            //adding cookie of Login Details
            res.cookie("logInCookie", logInToken);

            res.render("WelcomePage");
        }
        else {
            res.render("ErrorPage");
        }
    } catch (err) {
        res.send("Invalid LogIn Credentials, Please Try Again....");
    }

});





//RESET PASSWORD..
app.post("/resetPassword", async (req, res) => {
    try {
        // GET TO BE CHANGED PASSWORD INPUT FROM USER AND ALSO EMAIL
        const getEmail = req.body.email;
        const getNewPassword = req.body.changedPassword;
        const confirmNewPassword = req.body.confirmChangedPassword;

        // GET COMPLETE DOCUMENT DATA USING EMAIL FROM USER
        const getData = await userData.findOne({ email: getEmail });
        const getActualDatabasePassword = await getData.password;

        console.log("Data -> " + getData + "\n\nEmail = " + getEmail + "\nPassword Before = " + getActualDatabasePassword);

        //CHECK IF USER ENTERED MATCHING INPUTS ('TO BE CHANGED' PASSWORDS)
        if (getNewPassword === confirmNewPassword) {

            getData.password = bcrypt.hash(getNewPassword, 9);

            console.log("Password Changed");
            console.log("Password After = " + getData.password);
            res.render("indexFile");
        } else {
            res.send("<h1>Passwords Does Not Match..</h1>")
        }


    } catch (err) {
        res.send("Invalid Credentials, Please Check & Try Again..");
    }
})




//SETTING JWT TOKEN









app.listen(PORT, "127.0.0.1", () => {
    console.log("Server Started Successfully....");
});