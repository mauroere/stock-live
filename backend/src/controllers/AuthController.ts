import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthService } from '../services/AuthService';

export class AuthController {
  /**
   * Registra un nuevo usuario
   */
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      // Validar input
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Crear usuario
      const user = await User.create({
        name,
        email,
        password
      });

      // Generar token
      const token = AuthService.generateToken(user.id);

      // Responder con token y datos del usuario
      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  /**
   * Inicia sesión de usuario
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validar input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      // Buscar usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Validar contraseña
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar token
      const token = AuthService.generateToken(user.id);

      // Responder con token y datos del usuario
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
}