import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token geçersiz' });
  }
};

export const authorizeDoctor = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Doktor yetkisi gerekli' });
  }
  next();
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin yetkisi gerekli' });
  }
  next();
};