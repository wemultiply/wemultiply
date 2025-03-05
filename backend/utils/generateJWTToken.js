import jwt from 'jsonwebtoken';
/**
 * Generates a JWT token and sets it as an HTTP-only cookie.
 * @param {object} response - The HTTP response object.
 * @param {string} userId - The user ID to be included in the JWT payload.
 * @returns {string} - The generated JWT token.
 */
export const generateJWTToken = (response, userId) => {
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in the environment variables.');
        throw new Error('Server configuration error.');
    }

    try {
        // Generate JWT token
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
       
        });

        // Set token in an HTTP-only cookie
        response.cookie('token', token, {
            httpOnly: true, // Prevent access via client-side scripts
            Credentials:true,
            secure: process.env.NODE_ENV === 'production', // use secure cookies in production
            sameSite: 'strict', // Mitigate CSRF attacks
            maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 1 day
            path: '/', // Cookie available across the entire site
        });

        return token;
    } catch (error) {
        console.error('Error generating JWT token:', error);
        throw new Error('Failed to generate token.');
    }
};
