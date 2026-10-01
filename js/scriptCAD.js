
        const selectTipo = document.getElementById('tipo');
        const boxChaveAdmin = document.getElementById('boxChaveAdmin');
        const inputChaveAdmin = document.getElementById('chaveAdmin');
        const btnCadastrar = document.getElementById('btnCadastrar');
        const mensagem = document.getElementById('mensagem');

        selectTipo.addEventListener('change', () => {
            if (selectTipo.value === 'admin') {
                boxChaveAdmin.style.display = 'block';
                inputChaveAdmin.required = true;
            } else {
                boxChaveAdmin.style.display = 'none';
                inputChaveAdmin.required = false;
                inputChaveAdmin.value = '';
            }
        });

        document.getElementById('formCadastro').addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;
            const tipo = selectTipo.value;
            const chaveAdmin = inputChaveAdmin.value.trim();

            if (tipo === 'admin' && !chaveAdmin) {
                mensagem.style.color = 'red';
                mensagem.innerText = 'Informe a chave secreta de administrador.';
                return;
            }

            btnCadastrar.disabled = true;
            btnCadastrar.innerText = 'Cadastrando...';
            mensagem.innerText = '';

            try {
                const resposta = await fetch('http://localhost:3000/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha, tipo, chaveAdmin })
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    mensagem.style.color = 'green';
                    mensagem.innerText = resultado.message || resultado.mensagem || 'Usuário cadastrado com sucesso!';
                    document.getElementById('formCadastro').reset();
                    boxChaveAdmin.style.display = 'none';
                    inputChaveAdmin.required = false;
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    mensagem.style.color = 'red';
                    mensagem.innerText = resultado.error || resultado.erro || 'Erro ao cadastrar usuário.';
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                mensagem.style.color = 'red';
                mensagem.innerText = 'Erro ao conectar com o servidor Node.js.';
            } finally {
                btnCadastrar.disabled = false;
                btnCadastrar.innerText = 'Cadastrar';
            }
        });
