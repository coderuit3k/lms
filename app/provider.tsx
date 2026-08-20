"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { User, UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();

    const [userDetail, setUserDetail] = useState<User | null>(null);

    const createNewUser = async () => {
        try {
            const email = user?.primaryEmailAddress?.emailAddress;

            if (!email) return;

            // fullName có thể rỗng (Clerk sign-up không bắt buộc nhập tên) — API /api/user yêu cầu
            // name khác rỗng, nên phải fallback chứ không truyền thẳng user.fullName.
            const name = user.fullName || user.username || email.split("@")[0];

            const result = await axios.post<User>("/api/user", {
                name,
                email,
            });

            setUserDetail(result.data);
        } catch (error) {
            console.error("Failed to create/get user:", error);
        }
    };

    useEffect(() => {
        if (isLoaded && user) {
            // setState bên trong createNewUser xảy ra sau await (async), không đồng bộ thật —
            // rule set-state-in-effect không phân biệt được việc này với setState đồng bộ thật.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            createNewUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
            {children}
        </UserDetailContext.Provider>
    );
}

export default Provider;