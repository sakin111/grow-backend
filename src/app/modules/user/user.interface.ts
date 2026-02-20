import { Provider } from "@prisma/client";


export interface IAuthProvider {
    provider: Provider
    providerId: string;
}