import { createContext } from "react";

export interface User {
    id: number;
    name: string;
    email: string;
    subscription?: string | null;
    role: string;
    avatarUrl?: string | null;
}

interface UserDetailContextType {
    userDetail: User | null;
    setUserDetail: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserDetailContext = createContext<UserDetailContextType | null>(null);