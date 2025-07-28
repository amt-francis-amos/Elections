import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
  
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token is missing or malformed' });
        }

   
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

       
        if (tokenDecode.id) {
            req.body.userId = tokenDecode.id; 
            next();
        } else {
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
    }
};

export default auth;
