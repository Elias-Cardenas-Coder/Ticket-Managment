import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@/lib/auth';
import { LoginRequest, ApiResponse, UserWithoutPassword } from '@/lib/types';

const prisma = new PrismaClient();

export async function POST(request: Request): Promise<Response> {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validations
    if (!email || !password) {
      return Response.json(
        { success: false, error: 'Missing required fields' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { success: false, error: 'Invalid credentials' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { success: false, error: 'Invalid credentials' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return Response.json(
      {
        success: true,
        data: userWithoutPassword as UserWithoutPassword,
        message: 'Login successful',
      } as ApiResponse<UserWithoutPassword>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
