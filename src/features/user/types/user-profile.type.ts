export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    provider: 'LOCAL' | 'GOOGLE';
    phone: string | null;
    gender: Gender | null;
    avatar: string | null;
    role: 'USER' | 'ADMIN';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserProfileRequest {
    fullName?: string;
    phone?: string;
    avatar?: string;
    gender?: Gender;
}