document.addEventListener('DOMContentLoaded', () => {
    const selectTipo = document.getElementById('tipo');
    const boxChaveAdmin = document.getElementById('boxChaveAdmin');
    const formCadastro = document.getElementById('formCadastro');
    const mensagemEl = document.getElementById('mensagem');

    selectTipo.addEventListener('change', () => {
    const camposEmpresaMei = [
        document.getElementById('razao_social'),
        document.getElementById('cnpj'),
        document.getElementById('nome_responsavel'),
        document.getElementById('categoria')
    ];

    if (selectTipo.value === 'admin') {
        boxChaveAdmin.style.display = 'block';
        // Remove obrigatoriedade dos campos de empresa/MEI para o Admin
        camposEmpresaMei.forEach(campo => campo.removeAttribute('required'));
    } else {
        boxChaveAdmin.style.display = 'none';
        // Reativa a obrigatoriedade para MEI e Empresa
        camposEmpresaMei.forEach(campo => campo.setAttribute('required', 'true'));
    }
});

    // Processamento do formulário de cadastro
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar_senha').value;
        const tipo = selectTipo.value;
        const chaveAdmin = document.getElementById('chaveAdmin').value.trim();
        const razaoSocial = document.getElementById('razao_social').value.trim();
        const cnpj = document.getElementById('cnpj').value.trim();
        const nomeResponsavel = document.getElementById('nome_responsavel').value.trim();
        const categoria = document.getElementById('categoria').value;
        const descricaoServico = document.getElementById('descricao_servico').value.trim();

        // Validação de confirmação de senha
        if (senha !== confirmarSenha) {
            mensagemEl.style.color = '#d9534f';
            mensagemEl.innerText = 'As senhas não coincidem!';
            return;
        }

        const payload = {
            email,
            senha,
            tipo,
            chaveAdmin,
            razao_social: razaoSocial,
            cnpj,
            nome_responsavel: nomeResponsavel,
            categoria,
            descricao_servico: descricaoServico
        };

        try {
            const response = await fetch('http://localhost:3000/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && (data.sucesso || data.message)) {
                mensagemEl.style.color = '#28a745';
                mensagemEl.innerText = 'Conta cadastrada com sucesso! Redirecionando...';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                mensagemEl.style.color = '#d9534f';
                mensagemEl.innerText = data.error || data.erro || 'Erro ao realizar cadastro.';
            }
        } catch (err) {
            console.error(err);
            mensagemEl.style.color = '#d9534f';
            mensagemEl.innerText = 'Erro ao conectar com o servidor.';
        }
    });
});
//pontuação automática do cnpj (SOFIA)//
function mascaraCNPJ(input) {
    let v = input.value.replace(/\D/g, '');

    // 2. Aplica a máscara gradualmente conforme o utilizador digita
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');

    // 3. Atualiza o valor no campo
    input.value = v;
};
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