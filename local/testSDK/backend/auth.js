export const verifyZKAuthToken = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
  
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (!decoded.publicKey) {
        return res.status(401).json({ error: 'Invalid token format' });
      }
  
      req.user = { publicKey: decoded.publicKey };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };