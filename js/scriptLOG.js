document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value.trim()
    const senha = document.getElementById('senha').value
    const mensagem = document.getElementById('mensagem')

    mensagem.innerText = ''

    try {
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        })

        const resultado = await resposta.json()

        if (resposta.ok) {
            const dadosUsuario = resultado.usuario || resultado

            // Salva a sessão no navegador
            localStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario))

            // Redirecionamento por tipo de perfil
            if (dadosUsuario.tipo === 'admin') {
                window.location.href = 'painel_admin.html'
            } else if (dadosUsuario.tipo === 'mei') {
                window.location.href = 'painel_mei.html'
            } else if (dadosUsuario.tipo === 'empresa' || dadosUsuario.tipo === 'empresa_grande') {
                window.location.href = 'painel_empresa.html'
            } else {
                window.location.href = 'catalogo.html'
            }
        } else {
            mensagem.style.color = 'red'
            mensagem.innerText = resultado.erro || resultado.error || 'E-mail ou senha incorretos.'
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro)
        mensagem.style.color = 'red'
        mensagem.innerText = 'Erro ao conectar com o servidor Node.js.'
    }
});
