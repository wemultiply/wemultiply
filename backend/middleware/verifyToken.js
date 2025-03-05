import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    // Check if token is present
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Set the user ID from the decoded token payload
        req.userId = decoded.userId;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.log(error);  // Corrected the typo here
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
