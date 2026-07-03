import '@dotenvx/dotenvx/config'


export interface EnvType {
    PORT: number
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
    BCRYPT_SALT_ROUND: string
    FRONTEND_URL: string
    NODE_ENV: string
    EMAIL_HOST: string
    EMAIL_PORT: number
    EMAIL_USER: string
    EMAIL_PASS: string
    EMAIL_FROM: string
    REDIS_URL: string
    CLOUDINARY_CLOUD_NAME: string
    CLOUDINARY_API_KEY: string
    CLOUDINARY_API_SECRET: string
    LIVEKIT_HOST: string
    LIVEKIT_API_KEY: string
    LIVEKIT_API_SECRET: string
    LOG_LEVEL: string
}



export const envProvider = (): EnvType => {
    const configKey: string[] = ["ENV_PORT", "DATABASE_URL", "EXPRESS_SESSION_SECRET", "GOOGLE_CALLBACK_URL", "GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_ID", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES", "JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRES", "SUPER_ADMIN_PASSWORD", "SUPER_ADMIN", "BCRYPT_SALT_ROUND", "FRONTEND_URL", "NODE_ENV", "EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS", "EMAIL_FROM", "REDIS_URL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "LIVEKIT_HOST", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "LOG_LEVEL"]
    configKey.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing environment variable: ${key}`)
        }
    })

    return {
        PORT: Number(process.env.ENV_PORT),
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
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        NODE_ENV: process.env.NODE_ENV as string,
        EMAIL_HOST: process.env.EMAIL_HOST as string,
        EMAIL_PORT: Number(process.env.EMAIL_PORT),
        EMAIL_USER: process.env.EMAIL_USER as string,
        EMAIL_PASS: process.env.EMAIL_PASS as string,
        EMAIL_FROM: process.env.EMAIL_FROM as string,
        REDIS_URL: process.env.REDIS_URL as string,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
        LIVEKIT_HOST: process.env.LIVEKIT_HOST as string,
        LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY as string,
        LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET as string,
        LOG_LEVEL: process.env.LOG_LEVEL as string,
    }
}




export const envVar = envProvider()