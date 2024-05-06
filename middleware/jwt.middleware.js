
const User = require("../models/User_Model")
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log(decoded);
                if (decoded.email == process.env.AdminEmail) {
                    if (decoded.password == process.env.AdminPassword) {
                        req.user = {
                            role: "admin",
                            email: process.env.AdminEmail
                        }
                    }
                    else {
                        throw new Error('Not Authorized token expired, Please Login again.');
                    }
                }
                else {
                    const findUser = await User.findOne({ email: decoded.email });

                    console.log(findUser);

                    if (!findUser) {
                        throw new Error("User not found");
                    }
                    req.user = findUser;

                }

                next();
            }
        } catch (error) {
            console.error(error.message);
            return res.status(401).json({ error: "Not Authorized token expired, Please Login again" });
        }
    } else {
        return res.status(401).json({ error: "There is no token attached to header" });
    }
};



function getTokenFromHeaders(req) {

    console.log('this is the header from AUthenticated', req.headers.authorization)

    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
}

module.exports = { authMiddleware }