import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from 'drizzle-orm';
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
    const { email, name } = await req.json();

    if (!email || !name) {
        return NextResponse.json(
            {
                success: false,
                message: 'Name and Email are required!'
            },
            {
                status: 400
            },
        )
    };

    // If user already exists?
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));

    // If not then insert new user
    if (users?.length === 0) {
        const result = await db.insert(usersTable).values({
            name: name,
            email: email,
        }).returning();

        const newUser = result[0];
        if (newUser) {
            await createNotification(newUser.id, "welcome", "Chào mừng đến với Scholaris!", "Bắt đầu khám phá khoá học đầu tiên của bạn.");
            // Email giao dịch (transactional) — luôn gửi, không cổng theo notification preference nào
            // (những preference đó chỉ áp dụng cho email có thể tắt được, VD product announcements).
            await sendWelcomeEmail(newUser.email, newUser.name);
        }

        return NextResponse.json(result, {status: 201});
    }

    return NextResponse.json(users[0]);
};