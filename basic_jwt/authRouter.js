const Router = require("express");
const router = Router();
const controller = require("./authController");
// middleware
const { check } = require("express-validator");
const authMiddleWare = require("./middleware/authMiddleware");
const roleMiddleWare = require("./middleware/roleMiddleware");

router.post(
  "/registration",
  [
    check("username", "username cant be empty").notEmpty(),
    check(
      "password",
      "password should be longer than 4 and shorter than 10 symbols"
    ).isLength({ min: 6, max: 10 }),
  ],
  controller.registration
);
router.post("/login", controller.login);
router.get("/users", roleMiddleWare(["ADMIN"]), controller.getUsers);

module.exports = router;
