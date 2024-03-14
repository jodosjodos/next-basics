import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { z } from 'zod';
import Credentials from 'next-auth/providers/credentials';
import { User } from './app/lib/definitions';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) return undefined;
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) return user;
        }
        console.log('invalid credentials');

        return null;
      },
    }),
  ],
});
