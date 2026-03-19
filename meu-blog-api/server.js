import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const fastify = Fastify({ 
  logger: true 
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

// 3. Rota para CRIAR um novo post (CREATE)
fastify.post('/posts', async (request, reply) => {
  // Pegamos os dados que você envia no Thunder Client
  const { title, content } = request.body 

  try {
    const newPost = await prisma.post.create({
      data: {
        title: title,
        content: content,
        published: true 
      }
    })
    return reply.status(201).send(newPost) 
  } catch (error) {
    // Esse log vai aparecer no seu terminal do VS Code se o erro 500 voltar
    console.error("ERRO DETALHADO DO PRISMA:", error)
    return reply.status(500).send({ 
      error: "Erro ao criar post",
      message: error.message 
    })
  }
})

// --- INICIALIZAÇÃO ---

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log("🚀 Servidor voando em http://localhost:3000")
  } catch (err) {
    fastify.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// 4. Rota para BUSCAR UM POST ESPECÍFICO pelo ID (GET único)
fastify.get('/posts/:id', async (request, reply) => {
  // O Fastify pega o valor que você digitar na URL e coloca em request.params
  const { id } = request.params

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(id) // Convertemos para número porque o ID no banco é Int
      }
    })

    // Se o post não existir, avisamos ao usuário
    if (!post) {
      return reply.status(404).send({ error: "Post não encontrado" })
    }

    return post
  } catch (error) {
    return reply.status(500).send({ error: "Erro ao buscar o post" })
  }
})

// 5. Rota para DELETAR um post (DELETE)
fastify.delete('/posts/:id', async (request, reply) => {
  const { id } = request.params

  try {
    await prisma.post.delete({
      where: {
        id: Number(id)
      }
    })

    return reply.status(200).send({ message: "Post deletado com sucesso! 🗑️" })
  } catch (error) {
    // Se tentar deletar um ID que não existe, o Prisma gera um erro
    return reply.status(404).send({ error: "Não foi possível encontrar o post para deletar" })
  }
})

// 6. Rota para ATUALIZAR um post (UPDATE)
fastify.put('/posts/:id', async (request, reply) => {
  const { id } = request.params
  const { title, content } = request.body // Novos dados para o post

  try {
    const updatedPost = await prisma.post.update({
      where: {
        id: Number(id)
      },
      data: {
        title: title,
        content: content
      }
    })

    return updatedPost
  } catch (error) {
    return reply.status(404).send({ error: "Post não encontrado para editar" })
  }
})

start()