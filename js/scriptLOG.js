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
// --- ANIMAÇÃO DE GRID COM FLUIDEZ SUAVE E MÍNIMO DESLOCAMENTO ---
const canvas = document.getElementById('bg-dots');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    const spacing = 18; 
    const mouse = { x: -1000, y: -1000, radius: 190 }; 

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    }

    function initParticles() {
        particles = [];
        for (let x = 10; x < width; x += spacing) {
            for (let y = 10; y < height; y += spacing) {
                particles.push({
                    baseX: x,             
                    baseY: y,             
                    x: x,                 
                    y: y,                 
                    baseSize: 1.0,
                    currentSize: 1.0,
                    maxSize: 2.7,
                    activation: 0
                });
            }
        }
    }

    if (!isMobile()) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });
    }

    window.addEventListener('resize', resize);

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const activeMouse = isMobile() ? { x: -1000, y: -1000, radius: 0 } : mouse;

        particles.forEach(p => {
            let dx = activeMouse.x - p.baseX;
            let dy = activeMouse.y - p.baseY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            let targetActivation = 0;
            let targetX = p.baseX;
            let targetY = p.baseY;

            if (distance < activeMouse.radius) {
                // Curva ainda mais suave para a área de alcance
                let force = Math.pow((activeMouse.radius - distance) / activeMouse.radius, 1.4);
                targetActivation = force;

                let angle = Math.atan2(dy, dx);
                let pushDist = force * 1.5; // Deslocamento quase imperceptível, apenas um respiro na malha
                targetX = p.baseX - Math.cos(angle) * pushDist;
                targetY = p.baseY - Math.sin(angle) * pushDist;
            }

            // Inércia ultra suave: sobe macio e desce bem devagar deixando um rastro aveludado
            if (targetActivation > p.activation) {
                p.activation += (targetActivation - p.activation) * 0.18;
            } else {
                p.activation += (targetActivation - p.activation) * 0.03; 
            }

            p.x += (targetX - p.x) * 0.08;
            p.y += (targetY - p.y) * 0.08;

            p.currentSize = p.baseSize + (p.maxSize - p.baseSize) * p.activation;
            let color = p.activation > 0.05 ? '#52b788' : '#b8bec5';

            if (p.activation > 0.05) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.currentSize * 2.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(82, 183, 136, ${p.activation * 0.22})`;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.currentSize, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    resize();
    animate();
}
