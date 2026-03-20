import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import cors from '@fastify/cors'

const prisma = new PrismaClient()
const fastify = Fastify({ 
  logger: true 
})

// --- CONFIGURAÇÕES (Plugins) ---

// Registrar o CORS para permitir que o seu index.html acesse a API
await fastify.register(cors, { 
  origin: true 
})

// --- ROTAS ---

// 1. Rota de Boas-vindas
fastify.get('/', async (request, reply) => {
  return { hello: 'Bem-vindo à API do meu Blog!' }
})

// 2. Rota para LISTAR os posts (READ)
fastify.get('/posts', async (request, reply) => {
  try {
    const posts = await prisma.post.findMany()
    return posts
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ error: "Erro ao buscar posts" })
  }
})

// 3. Rota para BUSCAR UM POST ESPECÍFICO pelo ID (READ Único)
fastify.get('/posts/:id', async (request, reply) => {
  const { id } = request.params
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) }
    })

    if (!post) {
      return reply.status(404).send({ error: "Post não encontrado" })
    }
    return post
  } catch (error) {
    return reply.status(500).send({ error: "Erro ao buscar o post" })
  }
})

// 4. Rota para CRIAR um novo post (CREATE)
fastify.post('/posts', async (request, reply) => {
  const { title, content } = request.body 
  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        published: true 
      }
    })
    return reply.status(201).send(newPost) 
  } catch (error) {
    console.error("ERRO DETALHADO DO PRISMA:", error)
    return reply.status(500).send({ error: "Erro ao criar post" })
  }
})

// 5. Rota para ATUALIZAR um post (UPDATE)
fastify.put('/posts/:id', async (request, reply) => {
  const { id } = request.params
  const { title, content } = request.body 
  try {
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: { title, content }
    })
    return updatedPost
  } catch (error) {
    return reply.status(404).send({ error: "Post não encontrado para editar" })
  }
})

// 6. Rota para DELETAR um post (DELETE)
fastify.delete('/posts/:id', async (request, reply) => {
  const { id } = request.params
  try {
    await prisma.post.delete({
      where: { id: Number(id) }
    })
    return { message: "Post deletado com sucesso! 🗑️" }
  } catch (error) {
    return reply.status(404).send({ error: "Post não encontrado para deletar" })
  }
})

// --- INICIALIZAÇÃO ---

const start = async () => {
  try {
    // Usamos 0.0.0.0 para que o servidor aceite conexões externas (como seu index.html)
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log("🚀 Servidor voando em http://localhost:3000")
  } catch (err) {
    fastify.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()