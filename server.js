import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import cors from '@fastify/cors'

const prisma = new PrismaClient()
const fastify = Fastify({ logger: true })

// Configuração de CORS (Essencial para Vercel -> Render)
await fastify.register(cors, { origin: true })

// --- ROTAS CRUD ---

// [READ] - Listar todos
fastify.get('/posts', async (request, reply) => {
    try {
        return await prisma.post.findMany()
    } catch (error) {
        return reply.status(500).send({ error: "Erro ao buscar posts" })
    }
})

// [READ] - Buscar um específico
fastify.get('/posts/:id', async (request, reply) => {
    const { id } = request.params
    try {
        const post = await prisma.post.findUnique({ where: { id: Number(id) } })
        return post || reply.status(404).send({ error: "Post não encontrado" })
    } catch (error) {
        return reply.status(500).send({ error: "Erro ao buscar post" })
    }
})

// [CREATE] - Criar novo
fastify.post('/posts', async (request, reply) => {
    const { title, content } = request.body 
    try {
        const newPost = await prisma.post.create({
            data: { title, content, published: true }
        })
        return reply.status(201).send(newPost) 
    } catch (error) {
        return reply.status(500).send({ error: "Erro ao criar post" })
    }
})

// [UPDATE] - Editar post existente
fastify.put('/posts/:id', async (request, reply) => {
    const { id } = request.params
    const { title, content } = request.body 
    try {
        return await prisma.post.update({
            where: { id: Number(id) },
            data: { title, content }
        })
    } catch (error) {
        return reply.status(404).send({ error: "Post não encontrado" })
    }
})

// [DELETE] - Apagar post
fastify.delete('/posts/:id', async (request, reply) => {
    const { id } = request.params
    try {
        await prisma.post.delete({ where: { id: Number(id) } })
        return { message: "Post deletado com sucesso! 🗑️" }
    } catch (error) {
        return reply.status(404).send({ error: "Erro ao deletar" })
    }
})

// --- INICIALIZAÇÃO (Padrão Render) ---
const start = async () => {
    try {
        // process.env.PORT é o segredo para o Render não dar erro
        await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
        console.log("🚀 API Online e pronta para receber requisições!")
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()