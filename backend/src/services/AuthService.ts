import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthService {
  /**
   * Genera un token JWT para un usuario
   * @param userId - ID del usuario
   * @returns Token JWT
   */
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
  }

  /**
   * Verifica un token JWT
   * @param token - Token JWT a verificar
   * @returns Payload decodificado o null si el token es inválido
   */
  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }
}