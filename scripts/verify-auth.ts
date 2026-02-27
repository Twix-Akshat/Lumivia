import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("--- Verifying Auth Data ---");

    const users = await prisma.user.findMany({
        take: 10,
        select: {
            id: true,
            email: true,
            role: true,
            passwordHash: true,
            oauthGoogleId: true,
        }
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`User: ${user.email}, Role: ${user.role}, HasPassword: ${!!user.passwordHash}, ID: ${user.id}`);

        // Test password 'password123' against hash if present
        if (user.passwordHash) {
            const isMatch = await bcrypt.compare("password123", user.passwordHash);
            if (isMatch) {
                console.log(`  -> Password is 'password123'`);
            }
        }
    }

    // Check if test user exists
    const testEmail = "patient@example.com";
    const testUser = users.find(u => u.email === testEmail);

    if (!testUser) {
        console.log(`\nTest user ${testEmail} not found. Creating...`);
        const hashedPassword = await bcrypt.hash("password123", 10);
        try {
            const newUser = await prisma.user.create({
                data: {
                    email: testEmail,
                    passwordHash: hashedPassword,
                    role: "patient",
                    fullName: "Test Patient",
                }
            });
            console.log(`Created test user: ${testEmail} / password123`);
        } catch (e) {
            console.error("Failed to create test user:", e);
        }
    } else {
        console.log(`\nTest user ${testEmail} exists.`);
        if (!testUser.passwordHash) {
            console.log("  -> Warning: No password hash set.");
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
