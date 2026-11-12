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
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('animar-ao-rolar');
      observador.unobserve(entrada.target); // Trava o elemento no lugar original para sempre
    }
  });
}, { 
  rootMargin: '0px 0px -10% 0px' // Dispara um pouco antes do item chegar no meio da tela
});

document.querySelectorAll('.escondido').forEach((elemento) => observador.observe(elemento));
// --- ANIMAÇÃO DE PONTOS CINZAS ESTÁTICOS + ESTRELAS VERDES LENTAS ---
const canvas = document.getElementById('bg-dots');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let dots = [];
    const spacing = 55; // Mesma quantidade e espaçamento exato

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initDots();
    }

    function initDots() {
        dots = [];
        // Alinhamento perfeito em grade limpa
        for (let x = 25; x < width; x += spacing) {
            for (let y = 25; y < height; y += spacing) {
                dots.push({
                    x: x,
                    y: y,
                    isGlowing: Math.random() < 0.25,
                    glowSpeed: (0.001 + Math.random() * 0.0025) * 0.5, // Velocidade reduzida e suave
                    glowOffset: Math.random() * Math.PI * 2
                });
            }
        }
    }

    window.addEventListener('resize', resize);

    function animate(timestamp) {
        ctx.clearRect(0, 0, width, height);

        dots.forEach(dot => {
            // 1. PONTO CINZA FIXO E ALINHADO NA POSIÇÃO ORIGINAL
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(160, 170, 180, 0.4)';
            ctx.fill();

            // 2. PONTO VERDE PISCANDO SUAVEMENTE EM CIMA DO MESMO LUGAR
            if (dot.isGlowing) {
                let wave = Math.sin(timestamp * dot.glowSpeed + dot.glowOffset);
                let opacity = (wave + 1) / 2;

                if (opacity > 0.65) {
                    let intensity = (opacity - 0.65) / 0.35;

                    // Halo verde suave ao redor
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, 3.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(82, 183, 136, ${intensity * 0.15})`;
                    ctx.fill();

                    // Miolo do ponto verde acendendo na posição exata do cinza
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, 1.8, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(82, 183, 136, ${intensity * 0.85})`;
                    ctx.fill();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    resize();
    requestAnimationFrame(animate);
}