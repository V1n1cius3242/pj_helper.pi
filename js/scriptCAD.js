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
}