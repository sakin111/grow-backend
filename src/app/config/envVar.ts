import '@dotenvx/dotenvx/config'


export interface EnvType {
    ENV_PORT: number
    DATABASE_URL: string
    EXPRESS_SESSION_SECRET: string
    GOOGLE_CALLBACK_URL: string
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_CLIENT_ID: string
    JWT_ACCESS_SECRET: string
    JWT_ACCESS_EXPIRES: string
    JWT_REFRESH_SECRET: string
    JWT_REFRESH_EXPIRES: string
    SUPER_ADMIN_PASSWORD: string
    SUPER_ADMIN: string
    BCRYPT_SALT_ROUND:string
    FRONTEND_URL:string
}



export const envProvider = (): EnvType => {
    const configKey: string[] = ["ENV_PORT","DATABASE_URL", "EXPRESS_SESSION_SECRET","GOOGLE_CALLBACK_URL","GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_ID","JWT_ACCESS_SECRET","JWT_ACCESS_EXPIRES","JWT_REFRESH_SECRET","JWT_REFRESH_EXPIRES","SUPER_ADMIN_PASSWORD", "SUPER_ADMIN","BCRYPT_SALT_ROUND","FRONTEND_URL"]
    configKey.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing environment variable: ${key}`)
        }
    })

    return {
        ENV_PORT: Number(process.env.ENV_PORT),
        DATABASE_URL: process.env.DATABASE_URL as string,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
        SUPER_ADMIN: process.env.SUPER_ADMIN as string,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string

    }
}


export const envVar = envProvider()