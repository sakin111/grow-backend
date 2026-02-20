import Jwt, { JwtPayload,SignOptions } from "jsonwebtoken";


export const generateToken = (payload:JwtPayload,secret:string,expiresIn:string) => {
   const token = Jwt.sign(payload,secret,{expiresIn}as SignOptions)
   return token
}


export const verifyToken = (token:string, secret:string) =>{
    const verify = Jwt.verify(token,secret) as JwtPayload
    return verify
}
