import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { fullName, email, password, role } = await req.json();

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user using mapped field names where necessary
    // Prisma model: fullName, passwordHash, role (enum), email
    const user = await prisma.user.create({
      data: {
        fullName: fullName,
        email,
        passwordHash: hashedPassword,
        // Ensure role is cast to the Enum type if TypeScript complains, 
        // but passing string usually works if it matches enum value
        role: role.toLowerCase() as any,
      },
    });

    // Send welcome notification to new user
    await createNotification({
      userId: user.id,
      type: "general",
      message: `Welcome to the platform, ${user.fullName}! Your account has been created successfully.`,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
