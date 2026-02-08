import dotenv from "dotenv"

dotenv.config()


export interface EnvType {
    ENV_PORT: number
    DATABASE_URL: string
}



export const envProvider = (): EnvType => {
    const configKey : string[] = ["ENV_PORT", "DATABASE_URL"]
    configKey.forEach((key) => {
        if(!process.env[key]){
            throw new Error(`Missing environment variable: ${key}`)
        }
    })

    return{
        ENV_PORT: Number(process.env.ENV_PORT),
        DATABASE_URL: process.env.DATABASE_URL as string
    }
}


export const envVar = envProvider()