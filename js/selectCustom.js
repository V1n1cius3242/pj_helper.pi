/* =========================================================
   SELECT CUSTOMIZADO - PJ HELPER
   =========================================================
   O popup de um <select> é desenhado pelo sistema operacional,
   então option:hover / option:checked são ignorados no Chrome
   (vem o azul do Windows). Aqui o <select> continua existindo
   e guardando o valor — só trocamos a parte visível por um
   listbox de verdade, que aceita CSS.

   Uso: <select data-select-custom> ... </select>
   Nada mais precisa mudar: .value, required, submit e o
   evento 'change' seguem iguais para o resto do sistema.
========================================================= */
(function () {
  'use strict';

  var SETA =
    '<svg class="select-seta" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M7 10l5 5 5-5z"></path></svg>';

  var contador = 0;

  function montar(select) {
    if (select.dataset.selectPronto === '1') return;
    select.dataset.selectPronto = '1';

    var id = select.id || 'select-' + ++contador;
    var opcoes = Array.prototype.slice.call(select.options);

    // ------------------------------------------------ estrutura
    var wrapper = document.createElement('div');
    wrapper.className = 'select-custom';

    // o wrapper passa a ser o elemento visível, então a largura
    // definida no <select> precisa ir junto
    if (select.style.width) wrapper.style.width = select.style.width;
    if (select.style.maxWidth) wrapper.style.maxWidth = select.style.maxWidth;

    var botao = document.createElement('button');
    botao.type = 'button'; // nunca envia o formulário
    botao.className = 'select-botao';
    botao.id = id + '-botao';
    botao.setAttribute('aria-haspopup', 'listbox');
    botao.setAttribute('aria-expanded', 'false');

    var rotulo = document.querySelector('label[for="' + id + '"]');
    if (rotulo) {
      if (!rotulo.id) rotulo.id = id + '-label';
      botao.setAttribute('aria-labelledby', rotulo.id + ' ' + botao.id);
      rotulo.addEventListener('click', function (e) {
        e.preventDefault();
        botao.focus();
      });
    }

    var valor = document.createElement('span');
    valor.className = 'select-valor';
    botao.appendChild(valor);
    botao.insertAdjacentHTML('beforeend', SETA);

    var lista = document.createElement('ul');
    lista.className = 'select-lista';
    lista.id = id + '-lista';
    lista.setAttribute('role', 'listbox');
    if (rotulo) lista.setAttribute('aria-labelledby', rotulo.id);

    var itens = [];

    // monta os <li> a partir das <option> atuais; roda de novo quando
    // outro script troca as opcoes do select (ex.: lista de cidades)
    function construirItens() {
      opcoes = Array.prototype.slice.call(select.options);
      lista.innerHTML = '';
      ativo = -1;

      itens = opcoes.map(function (opcao, indice) {
        var li = document.createElement('li');
        li.className = 'select-opcao';
        li.id = id + '-opcao-' + indice;
        li.setAttribute('role', 'option');
        li.textContent = opcao.textContent;
        li.dataset.indice = String(indice);
        if (opcao.disabled) li.setAttribute('aria-disabled', 'true');

        li.addEventListener('click', function () { escolher(indice); });
        li.addEventListener('mousemove', function () {
          if (!opcoes[indice].disabled) destacar(indice);
        });

        lista.appendChild(li);
        return li;
      });
    }

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    wrapper.appendChild(botao);
    // a lista mora no <body> para escapar do overflow:hidden
    // da .linha-dupla.campo-pj (animação do modo ADM)
    document.body.appendChild(lista);

    botao.setAttribute('aria-controls', lista.id);

    // ------------------------------------------------ estado
    var ativo = -1; // item destacado pelo teclado

    function sincronizar() {
      var sel = select.selectedIndex;
      var opcaoSel = select.options[sel];
      var vazio = !select.value;

      valor.textContent = opcaoSel ? opcaoSel.textContent : '';
      botao.dataset.vazio = vazio ? 'true' : 'false';

      itens.forEach(function (li, i) {
        li.setAttribute('aria-selected', i === sel && !vazio ? 'true' : 'false');
      });
    }

    function destacar(i) {
      if (i < 0 || i >= itens.length) return;
      ativo = i;
      itens.forEach(function (li, n) {
        li.classList.toggle('ativo', n === i);
      });
      lista.setAttribute('aria-activedescendant', itens[i].id);
      itens[i].scrollIntoView({ block: 'nearest' });
    }

    function posicionar() {
      var r = botao.getBoundingClientRect();
      var espacoAbaixo = window.innerHeight - r.bottom;
      var altura = Math.min(lista.scrollHeight, 260);

      lista.style.left = r.left + 'px';
      lista.style.width = r.width + 'px';

      // abre para cima se não couber embaixo
      if (espacoAbaixo < altura + 16 && r.top > espacoAbaixo) {
        lista.style.top = Math.max(8, r.top - altura - 6) + 'px';
      } else {
        lista.style.top = r.bottom + 6 + 'px';
      }
    }

    function abrir() {
      if (wrapper.classList.contains('aberto')) return;
      fecharTodos();
      wrapper.classList.add('aberto');
      lista.classList.add('aberta');
      botao.setAttribute('aria-expanded', 'true');
      posicionar();
      destacar(select.selectedIndex >= 0 ? select.selectedIndex : primeiroHabilitado());
    }

    function fechar(devolverFoco) {
      if (!wrapper.classList.contains('aberto')) return;
      wrapper.classList.remove('aberto');
      lista.classList.remove('aberta');
      botao.setAttribute('aria-expanded', 'false');
      lista.removeAttribute('aria-activedescendant');
      itens.forEach(function (li) { li.classList.remove('ativo'); });
      if (devolverFoco) botao.focus();
    }

    function primeiroHabilitado() {
      for (var i = 0; i < opcoes.length; i++) if (!opcoes[i].disabled) return i;
      return 0;
    }

    function escolher(i) {
      if (i < 0 || i >= opcoes.length || opcoes[i].disabled) return;
      select.selectedIndex = i;
      sincronizar();
      // avisa o resto do sistema, igual ao select nativo
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      fechar(true);
    }

    function andar(passo) {
      var i = ativo < 0 ? select.selectedIndex : ativo;
      for (var n = i + passo; n >= 0 && n < opcoes.length; n += passo) {
        if (!opcoes[n].disabled) { destacar(n); return; }
      }
    }

    // ------------------------------------------------ mouse
    botao.addEventListener('click', function () {
      wrapper.classList.contains('aberto') ? fechar(false) : abrir();
    });


    // ------------------------------------------------ teclado
    botao.addEventListener('keydown', function (e) {
      var aberto = wrapper.classList.contains('aberto');

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
          e.preventDefault();
          if (!aberto) { abrir(); return; }
          andar(e.key === 'ArrowDown' ? 1 : -1);
          return;
        case 'Home':
          if (!aberto) return;
          e.preventDefault();
          destacar(primeiroHabilitado());
          return;
        case 'End':
          if (!aberto) return;
          e.preventDefault();
          destacar(opcoes.length - 1);
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          aberto ? escolher(ativo) : abrir();
          return;
        case 'Escape':
          if (aberto) { e.preventDefault(); fechar(true); }
          return;
        case 'Tab':
          fechar(false);
          return;
      }

      // digitar a inicial pula para a opção, como no nativo
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var letra = e.key.toLowerCase();
        var inicio = (ativo < 0 ? select.selectedIndex : ativo) + 1;
        for (var n = 0; n < opcoes.length; n++) {
          var i = (inicio + n) % opcoes.length;
          if (!opcoes[i].disabled &&
              opcoes[i].textContent.trim().toLowerCase().indexOf(letra) === 0) {
            if (!aberto) abrir();
            destacar(i);
            return;
          }
        }
      }
    });

    // ------------------------------------------------ foco e cliques fora
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target) && !lista.contains(e.target)) fechar(false);
    });

    // a lista está no body: precisa acompanhar scroll e resize
    window.addEventListener('scroll', function () {
      if (wrapper.classList.contains('aberto')) posicionar();
    }, true);

    window.addEventListener('resize', function () {
      if (wrapper.classList.contains('aberto')) posicionar();
    });

    // se o required barrar o envio, o browser foca o select
    // invisível: trazemos o foco para o botão e abrimos a lista
    select.addEventListener('invalid', function (e) {
      e.preventDefault();
      botao.focus();
      abrir();
    });

    // se outro script mudar o select na mão, o visual acompanha
    select.addEventListener('change', sincronizar);

    wrapper._fechar = fechar;

    // ganchos para outros scripts: refazer a lista ou so o texto do botao
    select._atualizar = function () { construirItens(); sincronizar(); };
    select._sincronizar = sincronizar;

    construirItens();
    sincronizar();
  }

  function fecharTodos() {
    document.querySelectorAll('.select-custom.aberto').forEach(function (w) {
      if (w._fechar) w._fechar(false);
    });
  }

  function iniciar() {
    document.querySelectorAll('select[data-select-custom]').forEach(montar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  // exposto caso alguma tela crie selects depois (ex.: via fetch)
  // Depois de trocar as <option> de um select ja montado (innerHTML),
  // chame atualizar. Depois de mudar so o .value, chame sincronizar.
  function atualizar(select) {
    if (!select) return;
    if (select._atualizar) select._atualizar();
    else if (select.hasAttribute('data-select-custom')) montar(select);
  }

  function sincronizar(select) {
    if (select && select._sincronizar) select._sincronizar();
  }

  window.PJSelect = { iniciar: iniciar, montar: montar, atualizar: atualizar, sincronizar: sincronizar };
})();
