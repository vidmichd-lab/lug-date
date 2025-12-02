export interface User {
    id: string;
    telegramId: number;
    username?: string;
    firstName: string;
    lastName?: string;
    photoUrl?: string;
    bio?: string;
    age?: number;
    isBanned?: boolean;
    isModerated?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Event {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    location?: string;
    date?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface Like {
    id: string;
    fromUserId: string;
    toUserId: string;
    eventId?: string;
    createdAt: Date;
}
export interface Match {
    id: string;
    userId1: string;
    userId2: string;
    eventId?: string;
    createdAt: Date;
}
export interface Message {
    id: string;
    matchId: string;
    senderId: string;
    content: string;
    createdAt: Date;
}
