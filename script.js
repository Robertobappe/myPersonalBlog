// URL da sua API no Render (Mantenha a sua URL real aqui)
const API_URL = 'https://mypersonalblog-pyna.onrender.com/posts';

// Função para buscar posts da API e colocar no HTML
async function carregarPosts() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        
        const container = document.getElementById('posts-container');
        container.innerHTML = posts.length === 0 ? '<p>Nenhum post encontrado.</p>' : '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <button class="btn-delete" onclick="deletarPost(${post.id})">Apagar</button>
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <small>ID: ${post.id} - Criado em: ${new Date(post.createdAt).toLocaleDateString()}</small>
            `;
            container.appendChild(postElement);
        });
    } catch (error) {
        document.getElementById('posts-container').innerText = 'Erro ao conectar com o servidor.';
    }
}

// Escuta o formulário para criar novo post
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        document.getElementById('postForm').reset();
        carregarPosts(); 
    } catch (err) {
        alert('Erro ao salvar post');
    }
});

// Função para deletar (precisa ser global para o onclick do HTML funcionar)
window.deletarPost = async function(id) {
    if (confirm('Deseja apagar este post?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            carregarPosts();
        } catch (err) {
            alert('Erro ao deletar');
        }
    }
}

// Carregar ao abrir a página
carregarPosts();