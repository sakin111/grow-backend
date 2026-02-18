import dotenv from "dotenv"

dotenv.config()


export interface EnvType {
    ENV_PORT: number
    DATABASE_URL: string
    EXPRESS_SESSION_SECRET:string
    GOOGLE_CALLBACK_URL : string
    GOOGLE_CLIENT_SECRET:string
    GOOGLE_CLIENT_ID:string
}



export const envProvider = (): EnvType => {
    const configKey : string[] = ["ENV_PORT", "DATABASE_URL","EXPRESS_SESSION_SECRET","GOOGLE_CALLBACK_URL","GOOGLE_CLIENT_SECRET","GOOGLE_CLIENT_ID"]
    configKey.forEach((key) => {
        if(!process.env[key]){
            throw new Error(`Missing environment variable: ${key}`)
        }
    })

    return{
        ENV_PORT: Number(process.env.ENV_PORT),
        DATABASE_URL: process.env.DATABASE_URL as string,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID as string,
        
    }
}


export const envVar = envProvider()