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
            mensagemEl.innerHTML = '';
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
                if (tipo === 'admin') {
                    mensagemEl.style.color = '#3faf6e';
                    mensagemEl.innerHTML = '';
                    mensagemEl.innerText = 'Conta de Administrador cadastrada com sucesso! Redirecionando...';
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    // Limpa mensagens de erro anteriores
                    mensagemEl.innerHTML = '';
                    
                    // Exibe a Modal de Aviso em HTML que já está pronta no cadastro_2.html
                    const modalAviso = document.getElementById('modalAvisoSucesso');
                    if (modalAviso) {
                        modalAviso.style.display = 'flex';
                    }
                }
            } else {
                mensagemEl.style.color = '#d9534f';
                mensagemEl.innerHTML = '';
                mensagemEl.innerText = data.error || data.erro || 'Erro ao realizar cadastro.';
            }
        } catch (err) {
            console.error(err);
            mensagemEl.style.color = '#d9534f';
            mensagemEl.innerHTML = '';
            mensagemEl.innerText = 'Erro ao conectar com o servidor.';
        }
    });
});

//pontuação automática do cnpj (SOFIA)//
function mascaraCNPJ(input) {
    let v = input.value.replace(/\D/g, '');

    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');

    input.value = v;
};

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('animar-ao-rolar');
      observador.unobserve(entrada.target);
    }
  });
}, { 
  rootMargin: '0px 0px -10% 0px' 
});

document.querySelectorAll('.escondido').forEach((elemento) => observador.observe(elemento));
// --- ANIMAÇÃO DE PONTOS CINZAS ESTÁTICOS + ESTRELAS VERDES LENTAS (IGUAL À PÁGINA SOBRE) ---
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