const isAdmin = (req, res, next) => {
    console.log(req.user.role)
    if(req.user.role === 'admin'){
        next();
    } else {
        return res.status(401).json({message:"Unauthorized access."})
    }
}


const isCustomer = (req, res, next) => {
    console.log(req.user.role)
    if (req.user.role === 'customer') {
        next();
    } else {
        return res.status(401).json({message:"Unauthorized access."})
    }
}

module.exports = { isAdmin, isCustomer};