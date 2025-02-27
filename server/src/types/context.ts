export interface Context {
    user?: {
        _id: unknown;
        username: string;
        email: string;
    };
}