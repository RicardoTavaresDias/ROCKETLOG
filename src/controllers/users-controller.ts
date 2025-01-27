import { Request, Response } from "express";
import { z } from "zod"
import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class UserController {
  async create(request: Request, response: Response){
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      email: z.string().email(),
      password: z.string().min(6)
    })

    //destruturar bodySchema já validados
    const { name, email, password } = bodySchema.parse(request.body)

    const userWithSameEmail = await prisma.user.findFirst({ where: { email } })

    if(userWithSameEmail) {
      throw new AppError("User with sam email already exists")
    }

    // Para Gerar criptografia no password
    const hashedPassaword = await hash(password, 8)

    const user = await prisma.user.create({ 
      data: {
        name,
        email,
        password: hashedPassaword
      }
     })

     const { password: _, ...userWithoutPassword } = user

    return response.status(201).json(userWithoutPassword)
  }
}

export { UserController }