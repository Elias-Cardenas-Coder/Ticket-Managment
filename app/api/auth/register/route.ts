import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';
import { RegisterRequest, ApiResponse, UserWithoutPassword } from '@/lib/types';

const prisma = new PrismaClient();

export async function POST(request: Request): Promise<Response> {
  try {
    const body: RegisterRequest = await request.json();
    const { email, name, password } = body;

    // Validations
    if (!email || !name || !password) {
      return Response.json(
        { success: false, error: 'Missing required fields' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, error: 'Password must be at least 6 characters' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { success: false, error: 'User already exists' } as ApiResponse<null>,
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER',
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return Response.json(
      {
        success: true,
        data: userWithoutPassword as UserWithoutPassword,
        message: 'User registered successfully',
      } as ApiResponse<UserWithoutPassword>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
