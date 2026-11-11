/* =========================================================
   LOCALIZACAO - PJ HELPER
   =========================================================
   Preenche endereco automaticamente usando duas APIs publicas
   brasileiras (nao precisam de chave nem de instalacao):

   - ViaCEP .......... digita o CEP e traz bairro, cidade e UF
   - IBGE Localidades  popula os selects de UF e de Cidade

   Os selects do IBGE sao o que faz o filtro do catalogo
   funcionar: sem eles, "Florianopolis" e "florianópolis"
   virariam cidades diferentes e a busca nunca casaria.

   Uso:
     PJLocal.ligarCampos({ cep: 'cep', uf: 'uf', cidade: 'cidade' });
========================================================= */
(function () {
    'use strict';

    var URL_VIACEP = 'https://viacep.com.br/ws/';
    var URL_IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades';

    var cacheUFs = null;
    var cacheCidades = {};

    // ------------------------------------------------ mascara

    function mascaraCEP(input) {
        var v = input.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
        input.value = v;
    }

    function soDigitos(cep) {
        return String(cep || '').replace(/\D/g, '');
    }

    // ------------------------------------------------ ViaCEP

    async function buscarCep(cep) {
        var limpo = soDigitos(cep);
        if (limpo.length !== 8) {
            return { erro: true, mensagem: 'O CEP precisa ter 8 dígitos.' };
        }

        try {
            var resp = await fetch(URL_VIACEP + limpo + '/json/');
            if (!resp.ok) throw new Error('falha na consulta');

            var dados = await resp.json();
            if (dados.erro) {
                return { erro: true, mensagem: 'CEP não encontrado.' };
            }

            return {
                erro: false,
                cep: dados.cep,
                logradouro: dados.logradouro,
                bairro: dados.bairro,
                cidade: dados.localidade,
                uf: dados.uf
            };
        } catch (e) {
            // sem internet ou API fora do ar: o usuario preenche na mao
            return { erro: true, mensagem: 'Não foi possível consultar o CEP agora.' };
        }
    }

    // ------------------------------------------------ IBGE

    async function listarUFs() {
        if (cacheUFs) return cacheUFs;
        try {
            var resp = await fetch(URL_IBGE + '/estados?orderBy=nome');
            cacheUFs = await resp.json();
            return cacheUFs;
        } catch (e) {
            return [];
        }
    }

    async function listarCidades(uf) {
        if (!uf) return [];
        if (cacheCidades[uf]) return cacheCidades[uf];
        try {
            var resp = await fetch(URL_IBGE + '/estados/' + uf + '/municipios?orderBy=nome');
            cacheCidades[uf] = await resp.json();
            return cacheCidades[uf];
        } catch (e) {
            return [];
        }
    }

    function preencherSelect(select, itens, textoVazio, valorAtual) {
        if (!select) return;
        var html = '<option value="">' + textoVazio + '</option>';
        itens.forEach(function (i) {
            var selecionado = (i.valor === valorAtual) ? ' selected' : '';
            html += '<option value="' + i.valor + '"' + selecionado + '>' + i.texto + '</option>';
        });
        select.innerHTML = html;

        // se o select ja virou componente customizado, refaz a lista dele
        if (window.PJSelect) window.PJSelect.atualizar(select);
    }

    async function carregarUFs(select, valorAtual) {
        var ufs = await listarUFs();
        preencherSelect(
            select,
            ufs.map(function (u) { return { valor: u.sigla, texto: u.sigla + ' - ' + u.nome }; }),
            'Selecione o estado...',
            valorAtual
        );
    }

    async function carregarCidades(select, uf, valorAtual) {
        if (!uf) {
            preencherSelect(select, [], 'Escolha o estado primeiro...', null);
            return;
        }
        var cidades = await listarCidades(uf);
        preencherSelect(
            select,
            cidades.map(function (c) { return { valor: c.nome, texto: c.nome }; }),
            'Selecione a cidade...',
            valorAtual
        );
    }

    // ------------------------------------------------ amarracao

    /**
     * Liga os campos de endereco de um formulario.
     * ids: { cep, uf, cidade, bairro }  (bairro e opcional)
     */
    function ligarCampos(ids) {
        var campoCep = document.getElementById(ids.cep);
        var campoUF = document.getElementById(ids.uf);
        var campoCidade = document.getElementById(ids.cidade);
        var campoBairro = ids.bairro ? document.getElementById(ids.bairro) : null;

        if (!campoUF || !campoCidade) return;

        carregarUFs(campoUF);

        campoUF.addEventListener('change', function () {
            carregarCidades(campoCidade, campoUF.value);
        });

        if (!campoCep) return;

        campoCep.addEventListener('input', function () {
            mascaraCEP(campoCep);
        });

        // busca ao completar os 8 digitos ou ao sair do campo
        var buscando = false;
        async function tentarBuscar() {
            if (buscando) return;
            if (soDigitos(campoCep.value).length !== 8) return;

            buscando = true;
            campoCep.classList.add('buscando-cep');

            var r = await buscarCep(campoCep.value);

            campoCep.classList.remove('buscando-cep');
            buscando = false;

            if (r.erro) {
                mostrarErroCep(campoCep, r.mensagem);
                return;
            }

            mostrarErroCep(campoCep, '');
            if (campoBairro) campoBairro.value = r.bairro || '';

            await carregarUFs(campoUF, r.uf);
            await carregarCidades(campoCidade, r.uf, r.cidade);
        }

        campoCep.addEventListener('blur', tentarBuscar);
        campoCep.addEventListener('input', function () {
            if (soDigitos(campoCep.value).length === 8) tentarBuscar();
        });
    }

    function mostrarErroCep(campoCep, mensagem) {
        var id = campoCep.id + '-aviso';
        var aviso = document.getElementById(id);

        if (!mensagem) {
            if (aviso) aviso.remove();
            return;
        }

        if (!aviso) {
            aviso = document.createElement('small');
            aviso.id = id;
            aviso.className = 'aviso-cep';
            campoCep.parentNode.appendChild(aviso);
        }
        aviso.innerText = mensagem;
    }

    /**
     * Preenche os selects com um endereco ja salvo no banco.
     */
    async function preencherEndereco(ids, dados) {
        if (!dados) return;
        var campoCep = ids.cep ? document.getElementById(ids.cep) : null;
        var campoUF = document.getElementById(ids.uf);
        var campoCidade = document.getElementById(ids.cidade);
        var campoBairro = ids.bairro ? document.getElementById(ids.bairro) : null;

        if (campoCep && dados.cep) campoCep.value = dados.cep;
        if (campoBairro && dados.bairro) campoBairro.value = dados.bairro;

        await carregarUFs(campoUF, dados.uf || '');
        await carregarCidades(campoCidade, dados.uf || '', dados.cidade || '');
    }

    window.PJLocal = {
        mascaraCEP: mascaraCEP,
        buscarCep: buscarCep,
        carregarUFs: carregarUFs,
        carregarCidades: carregarCidades,
        ligarCampos: ligarCampos,
        preencherEndereco: preencherEndereco
    };
})();
