import { Provider } from "@prisma/client";


export interface IAuthProvider {
    provider: Provider
    providerId: string;
}


export interface CreateUserPayload {
  email: string
  password: string
  confirmPassword: string
  name: string
}