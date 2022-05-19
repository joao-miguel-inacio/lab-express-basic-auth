const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { isLoggedIn } = require("../middlewares/isLoggedIn.js");
const { isLoggedOut } = require("../middlewares/isLoggedOut.js");

//const { create } = require("hbs");

router.get("/signup", isLoggedOut, (req, res, next) => {
    res.render("auth/signup");
});

router.post("/signup", isLoggedOut, async (req, res) => {
    const { username, password } = req.body;

    //check if password and username was provided
    if (!password || !username) {
        const errorMessage = `Your password or username are not valid`;
        res.render("auth/signup", { errorMessage });
        return;
    }

    //regex code would come here

    try {
        //try to find user by username
        const foundUser = await User.findOne({ username });

        if (foundUser) {
            const errorMessage = `You are already registered !`;
            res.render("auth/signup", { errorMessage });
            return;
        }

        //encrypt password
        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const createdUser = await User.create({
			username,
			password: hashedPassword,
		});
        res.redirect("/login");
    } catch (e) {
        console.log(e);
    }
});

router.get("/login", isLoggedOut, (req, res) => {
	res.render("auth/login");
});

router.post("/login", isLoggedOut, async (req, res, next) => {
	const { username, password } = req.body;

    //check if username and password have been provided
	if (!username || !password) {
		return res.render("auth/login", {
			errorMessage: "Please provide an email and a password",
		});
	}

	try {
        //try to find user by username
		const foundUser = await User.findOne({ username });

		if (!foundUser) {
			return res.render("auth/login", {
				errorMessage: "Wrong credentials",
			});
		}

		const checkPassword = bcrypt.compareSync(password, foundUser.password);
		//compare passwords
        if (!checkPassword) {
			res.render("auth/login", {
				errorMessage: "Wrong credentials",
			});
		}
        if (checkPassword) {    
            //authenticate user and active session
            req.session.loggedInUser = foundUser;
            req.app.locals.isLoggedIn = true;

            //redirect user to a private route
            res.redirect("/profile");
        }
	} catch (e) {
		next(e);
	}
});

router.post("/logout", isLoggedIn, async (req, res, next) => {
    try {
        await req.session.destroy();
        res.redirect("/");
    } catch (e) {
        next(e);
	}
  });

/*
router.get("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/auth/login");
  });
*/

//private route
router.get("/profile", isLoggedIn, async (req, res, next) => {
    try {
        const foundUser = await req.session.loggedInUser;
	    res.render("profile", {foundUser});
    } catch (e) {
        next(e);
    }
});

module.exports = router;