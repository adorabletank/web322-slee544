const generalController = {
    home: (req, res,) => {
      res.render("home");
    },
    signUp: (req, res) => {
      res.render("sign-up");
    },
    logIn: (req, res) => {
      res.render("log-in");
    },
    welcome: (req, res) => {
      res.render("welcome");
    },
};
  
module.exports = generalController;
