const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
    // Check if the token exists in the request headers
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Extract the token from the Authorization header
    const bearerToken = token.split(' ')[1];

    // Verify the JWT token
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        // Check if the role in the decoded token is 'admin'
        if (decoded.role === 'admin' || req.user.role === 'admin') {
            // If the role is 'admin', proceed to the next middleware
            next();
        } else {
            // If the role is not 'admin', return unauthorized access
            return res.status(401).json({ message: 'Unauthorized access' });
        }
    });
};

const isCustomer = (req, res, next) => {
    console.log(req.user.role)
    if (req.user.role === 'customer') {
        next();
    } else {
        return res.status(401).json({message:"Unauthorized access."})
    }
}

module.exports = { isAdmin, isCustomer};