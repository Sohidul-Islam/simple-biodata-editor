'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { hashPassword, comparePassword, createSessionToken } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validation = registerSchema.safeParse({ email, password });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    // Check if duplicate email
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      return { success: false, error: 'Email is already registered' };
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate session token
    const token = await createSessionToken(userId);
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Registration failed' };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate session token
    const token = await createSessionToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
}

export async function forgotPassword(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

      await db
        .update(users)
        .set({ resetToken, resetTokenExpires })
        .where(eq(users.id, user.id));

      // Display reset link in console for development/test testing
      console.log(`\n========================================`);
      console.log(`[Forgot Password] Reset token generated for: ${email}`);
      console.log(`[Forgot Password] Reset Link: http://localhost:3001/reset-password?token=${resetToken}`);
      console.log(`========================================\n`);
    }

    // To prevent user enumeration, always return success message
    return { success: true, message: 'If the email exists, a password reset link has been generated.' };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return { success: false, error: error.message || 'Failed to request password reset' };
  }
}

export async function resetPassword(prevState: any, formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    const validation = resetPasswordSchema.safeParse({ token, password });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.resetToken, token), gt(users.resetTokenExpires, new Date())))
      .limit(1);

    if (!user) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    const hashedPassword = await hashPassword(password);

    // Update password and invalidate the token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message || 'Failed to reset password' };
  }
}
