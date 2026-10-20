/* ================= ÁUDIO AMBIENTE ================= */
const rsAudio = document.getElementById('rs-audio');
const rsBotaoMusica = document.getElementById('rs-btn-musica');
let rsTocando = false;

function rsAlternarMusica() {
  if (!rsAudio || !rsBotaoMusica) return;

  const rsTexto = rsBotaoMusica.querySelector('.rs-btn-musica-texto');

  if (rsTocando) {
    rsAudio.pause();
    rsBotaoMusica.classList.remove('ativo');
    if (rsTexto) rsTexto.textContent = 'Tocar';
    rsTocando = false;
    return;
  }

  rsAudio.volume = 0.3;
  const rsPlay = rsAudio.play();

  // Só marca como "tocando" depois do play() resolver
  if (rsPlay && typeof rsPlay.then === 'function') {
    rsPlay
      .then(() => {
        rsBotaoMusica.classList.add('ativo');
        if (rsTexto) rsTexto.textContent = 'Pausar';
        rsTocando = true;
      })
      .catch(() => {
        if (rsTexto) rsTexto.textContent = 'Sem áudio';
      });
  } else {
    rsBotaoMusica.classList.add('ativo');
    if (rsTexto) rsTexto.textContent = 'Pausar';
    rsTocando = true;
  }
}

if (rsBotaoMusica) rsBotaoMusica.addEventListener('click', rsAlternarMusica);

/* ================= SCROLL SUAVE ================= */
document.querySelectorAll('a[href^="#"]').forEach((rsLink) => {
  rsLink.addEventListener('click', (rsEvento) => {
    const rsAlvo = rsLink.getAttribute('href');
    if (rsAlvo && rsAlvo.length > 1) {
      const rsDestino = document.querySelector(rsAlvo);
      if (rsDestino) {
        rsEvento.preventDefault();
        rsDestino.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

/* ================= CONTADORES ANIMADOS ================= */
function rsAnimarNumero(rsEl) {
  const rsMeta = parseInt(rsEl.dataset.contador, 10) || 0;
  const rsDecimal = parseInt(rsEl.dataset.decimal, 10) || 0;
  const rsDuracao = 1800;
  const rsInicio = performance.now();

  function rsAtualizar(rsTempo) {
    const rsProgresso = Math.min((rsTempo - rsInicio) / rsDuracao, 1);
    const rsSuavizado = 1 - Math.pow(1 - rsProgresso, 3); // easeOutCubic
    const rsValorAtual = rsMeta * rsSuavizado;

    if (rsDecimal > 0) {
      rsEl.textContent = (rsValorAtual / 10).toFixed(rsDecimal);
    } else if (rsMeta >= 1000) {
      rsEl.textContent = Math.floor(rsValorAtual).toLocaleString('pt-BR');
    } else {
      rsEl.textContent = Math.floor(rsValorAtual);
    }

    if (rsProgresso < 1) requestAnimationFrame(rsAtualizar);
  }

  requestAnimationFrame(rsAtualizar);
}

function rsAtivarContadores() {
  const rsNumeros = document.querySelectorAll('[data-contador]');
  if (!rsNumeros.length) return;

  if (!('IntersectionObserver' in window)) {
    rsNumeros.forEach(rsAnimarNumero);
    return;
  }

  const rsObs = new IntersectionObserver(
    (rsEntradas) => {
      rsEntradas.forEach((rsEntrada) => {
        if (rsEntrada.isIntersecting) {
          rsAnimarNumero(rsEntrada.target);
          rsObs.unobserve(rsEntrada.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  rsNumeros.forEach((rsEl) => rsObs.observe(rsEl));
}

/* ================= REVELAR AO ROLAR ================= */
function rsRevelar() {
  const rsElementos = document.querySelectorAll(
    '.rs-diferencial, .rs-produto, .rs-foto, .rs-visita-item, .rs-manifesto-destaque'
  );

  if (!rsElementos.length) return;

  // Fallback: sem suporte, mostra tudo
  if (!('IntersectionObserver' in window)) {
    rsElementos.forEach((rsEl) => rsEl.classList.add('rs-visivel'));
    return;
  }

  const rsObs = new IntersectionObserver(
    (rsEntradas) => {
      rsEntradas.forEach((rsEntrada) => {
        if (rsEntrada.isIntersecting) {
          rsEntrada.target.classList.add('rs-visivel');
          rsObs.unobserve(rsEntrada.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  rsElementos.forEach((rsEl) => rsObs.observe(rsEl));
}

/* ================= TILT 3D NOS PRODUTOS ================= */
function rsTilt() {
  document.querySelectorAll('.rs-produto').forEach((rsCard) => {
    // Ativa transition curta só durante o hover (não interfere no reveal)
    rsCard.addEventListener('mouseenter', () => {
      rsCard.style.transition = 'transform .15s ease-out';
    });

    rsCard.addEventListener('mousemove', (rsEvento) => {
      const rsRect = rsCard.getBoundingClientRect();
      const rsX = (rsEvento.clientX - rsRect.left) / rsRect.width - 0.5;
      const rsY = (rsEvento.clientY - rsRect.top) / rsRect.height - 0.5;
      const rsRotY = rsX * 6;
      const rsRotX = -rsY * 6;

      rsCard.style.transform =
        `perspective(1200px) rotateX(${rsRotX}deg) rotateY(${rsRotY}deg) translateY(-10px)`;
    });

    // Ao sair: devolve o controle ao CSS (que cuida do reveal + hover)
    rsCard.addEventListener('mouseleave', () => {
      rsCard.style.transition = '';
      rsCard.style.transform = '';
    });
  });
}

/* ================= PEDIDO ================= */
function rsAdicionar(rsProduto) {
  alert(`✦ ${rsProduto}\n\nAnotado no seu pedido. Retire no balcão ao chegar.`);
}

/* ================= INICIALIZAÇÃO ================= */
function rsIniciar() {
  rsAtivarContadores();
  rsRevelar();
  rsTilt();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', rsIniciar);
} else {
  // DOM já pronto (cache, refresh rápido, etc.)
  rsIniciar();
}