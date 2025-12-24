
const supabasePublicClient = supabase.createClient("https://wdydybykkhkbqrahiegq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeWR5Ynlra2hrYnFyYWhpZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDUyODIsImV4cCI6MjA4MDUyMTI4Mn0.urD38OYOc8TO4EgMo_JzuoQrzKF0UojvY5smsPK0wJ0",
  {
    db: {
      schema: "public"
    }
  }
);
//Verificar login
const idUsuario = localStorage.getItem("idUsuario");

//peixeCoins
var peixeCoin = 0;
const dinheiro = document.getElementById('peixeCoin');
async function peixeCoinsGet() {
  const { data, error } = await supabasePublicClient
    .from("usuarios")
    .select("peixeCoin")
    .eq("id_usuario", idUsuario)
    .maybeSingle();
  peixeCoin = data.peixeCoin;
  dinheiro.innerHTML = `$${peixeCoin}`;
}
async function peixeCoinsUpd() {
  const { data, error } = await supabasePublicClient
    .from("usuarios")
    .update({ peixeCoin: peixeCoin })
    .eq("id_usuario", idUsuario)
    .select("peixeCoin")
    .maybeSingle();

  if (error) {
    console.error("Erro ao atualizar peixeCoin:", error);
    return false;
  }

  if (!data) {
    console.warn("Nenhum usuário retornado");
    return false;
  }
  dinheiro.innerHTML = `$${peixeCoin}`;
  return true;
}

if (!idUsuario) {
  alert("Usuário não logado!");
  window.location.href = "../entrar/index.html";
}
//som
const rouletteSound = document.getElementById("rouletteSound");

const prizes = [
  { text: "67", img: "../premios/67.png", chance: 0.13 },
  { text: "Mendigo", img: "../premios/heathcliff.png", chance: 0.09 },
  { text: "Aura", img: "../premios/aura.png", chance: 0.13 },
  { text: "Mouse roubado", img: "../premios/mouse.png", chance: 0.13 },
  { text: "Laranxinha", img: "../premios/laranxinha.png", chance: 0.13 },
  { text: "200 Peixe Coins", img: "../premios/peixecoin.png", chance: 0.2 },
  { text: "Peixe Beta", img: "../premios/peixebeta.png", chance: 0.2 },
  { text: "Peixe Sigma", img: "../premios/peixesigma.png", chance: 0.001 },
  { text: "Alisa meu pelo", img: "../premios/onca.png", chance: 0.13 },
  { text: "Parafuso", img: "../premios/parafuso.png", chance: 0.13 },
  { text: "Quidimais", img: "../premios/quidimais.png", chance: 0.13 }
];
// script.js
document.addEventListener('DOMContentLoaded', () => {
  renderConquistas();
  // --- CONFIGURAÇÃO DOS PRÊMIOS (ajuste os caminhos das imagens) ---


  // --- ELEMENTOS DOM ---
  const canvas = document.getElementById('wheelCanvas');
  const spinBtn = document.getElementById('spinBtn');
  //const fastBtn = document.getElementById('fastBtn');
  const resultEl = document.getElementById('result');
  const historyEl = document.getElementById('history');
  const countEl = document.getElementById('count');

  if (!canvas || !spinBtn || !resultEl || !historyEl || !countEl) {
    console.error('Elemento(s) não encontrado(s). Verifique ids: wheelCanvas, spinBtn, fastBtn, result, history, count.');
    return;
  }
  peixeCoinsGet();
  // escolher prêmio com peso
  function choosePrizeWeighted() {
    const total = prizes.reduce((s, p) => s + (p.chance || 0), 0);
    if (total <= 0) return Math.floor(Math.random() * prizes.length);
    const r = Math.random() * total; // note *total*
    let acc = 0;
    for (let i = 0; i < prizes.length; i++) {
      acc += (prizes[i].chance || 0);
      if (r < acc) return i;
    }
    return prizes.length - 1;
  }

  const ctx = canvas.getContext('2d');

  // estado
  let rotation = 0; // em radianos
  let spinning = false;
  let history = [];
  const sectorCount = prizes.length;

  // DPI-aware canvas sizing
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    // ajustar escala para desenhar em "CSS pixels"
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // redraw
    drawWheel(rotation);
  }

  // --- preload imagens (resolve mesmo que alguma falhe) ---
  function preloadImages(list) {
    return Promise.all(list.map(item => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = item.img;
        img.onload = () => { item.imageObj = img; item.loaded = true; resolve(item); };
        img.onerror = () => { item.imageObj = null; item.loaded = false; resolve(item); };
      });
    }));
  }

  // desenho da roleta
  function drawWheel(rot = 0) {
    // medidas em CSS pixels
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.42; // igual à proporção anterior

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    const arc = (2 * Math.PI) / sectorCount;
    ctx.lineWidth = 3;

    for (let i = 0; i < sectorCount; i++) {
      const prize = prizes[i];
      const start = i * arc;

      // setor (cores alternadas para contraste)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, start + arc);
      ctx.closePath();
      ctx.fillStyle = (i % 2 === 0) ? '#013b52' : '#012a3a'; // tons aquáticos
      ctx.fill();
      ctx.strokeStyle = 'rgba(35,216,255,0.12)';
      ctx.stroke();

      // desenhar imagem + texto no setor
      ctx.save();
      const mid = start + arc / 2;
      ctx.rotate(mid);

      // posição radial onde a imagem ficará (em relação ao centro)
      const imgDistance = radius * 0.58;
      const imgSize = Math.max(24, Math.min(64, radius * 0.27)); // tamanho responsivo

      // desenhar imagem (centro na linha radial)
      if (prize.imageObj) {
        // a imagem pode ter sido carregada
        ctx.drawImage(prize.imageObj, imgDistance - imgSize / 2, -imgSize / 2, imgSize * 1.2, imgSize * 1.1);
      } else {
        // fallback: desenhar um círculo simples
        ctx.beginPath();
        ctx.arc(imgDistance, 0, imgSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(35,216,255,0.14)';
        ctx.stroke();
      }

      // desenhar texto abaixo da imagem (rotacionar 90º para ficar legível)
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#e8fbff';
      ctx.font = `${Math.max(12, Math.round(imgSize * 0.4))}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // quebra simples de texto se for muito longo (2 linhas max)
      const maxWidth = radius * 0.5;
      //drawWrappedText(ctx, prize.text, 0, imgSize / 20, maxWidth, 2);

      ctx.restore();
    }

    // círculo central decorativo
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.26, 0, Math.PI * 2);
    ctx.fillStyle = '#001828';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(35,216,255,0.18)';
    ctx.stroke();

    ctx.restore();

    // aro externo
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(35,216,255,0.08)';
    ctx.stroke();

    // Observação: o ponteiro está no HTML (.pointer), então não desenhamos triângulo aqui.
  }

  // helper: desenha texto quebrado em no máximo `maxLines` linhas
  function drawWrappedText(ctx, text, x, y, maxWidth, maxLines) {
    const words = String(text).split(' ');
    const lines = [];
    let cur = '';
    for (let w of words) {
      const test = cur ? (cur + ' ' + w) : w;
      const measure = ctx.measureText(test).width;
      if (measure > maxWidth && cur) {
        lines.push(cur);
        cur = w;
        if (lines.length >= maxLines) break;
      } else {
        cur = test;
      }
    }
    if (lines.length < maxLines && cur) lines.push(cur);
    // desenha centralizado verticalmente (já estamos no ponto adequado)
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + i * (parseInt(ctx.font, 10) + 2));
    }
  }
  // lógica de giro
  function spin(extraRotations = 6) {
    peixeCoinsUpd();
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    // fastBtn.disabled = true;

    //toca o audio
    rouletteSound.currentTime = 0; // reinicia o áudio sempre
    rouletteSound.play().catch(() => { }); // ignora erro caso o autoplay seja bloqueado

    const chosenIndex = choosePrizeWeighted();
    const chosenPrize = prizes[chosenIndex];

    const arc = (2 * Math.PI) / sectorCount;
    const sectorMid = chosenIndex * arc + arc / 2;

    // cálculo modular robusto
    const twoPi = 2 * Math.PI;
    const rotationMod = ((rotation % twoPi) + twoPi) % twoPi;
    const desiredMod = ((- (sectorMid - Math.PI / 2)) % twoPi + twoPi) % twoPi;
    let delta = desiredMod - rotationMod;
    if (delta <= 0) delta += twoPi;

    // garantimos várias voltas no sentido horário (valor negativo)
    const deltaToApply = delta - twoPi - extraRotations * twoPi;

    const currentRotation = rotation;
    const targetRotation = currentRotation + deltaToApply;

    // DEBUG: descomente para ver valores no console
    // console.log({ chosenIndex, rotationMod, desiredMod, delta, deltaToApply, currentRotation, targetRotation });

    const duration = 4200; // ms (ajusta se quiser mais/menos)
    const startTime = performance.now();

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      rotation = currentRotation + (targetRotation - currentRotation) * eased;
      drawWheel(rotation);
      if (t < 1) requestAnimationFrame(frame);
      else {
        rouletteSound.pause();
        rouletteSound.currentTime = 0;
        spinning = false;
        spinBtn.disabled = false;
        // fastBtn.disabled = false;
        announceResult(chosenPrize);
      }
    }
    requestAnimationFrame(frame);
  }

  // atualizar resultado e histórico
  async function announceResult(prize) {
    resultEl.textContent = `Prêmio: ${prize.text}`;
    addHistory(prize);
    liveRegion.textContent = `Prêmio: ${prize.text}`;
    renderConquistas();
    //ganhou peixeCoins
    if (prize.text.includes("Peixe Coins")) {
      const valor = parseInt(prize.text); // "200 Peixe Coins" -> 200
      peixeCoin += valor;
      peixeCoinsUpd();
    }
    else {
      // 1. Verificar se já existe
      const { data: itemExiste } = await supabasePublicClient
        .from("inventario")
        .select("*")
        .eq("id_usuario", idUsuario)
        .eq("nome", prize.text)
        .maybeSingle(); // melhor porque não dá erro quando não encontra

      if (itemExiste) {
        // 2. Atualizar: quantidade + 1
        const { data: updated } = await supabasePublicClient
          .from("inventario")
          .update({ quantidade: itemExiste.quantidade + 1 })
          .eq("id_usuario", idUsuario)
          .eq("nome", prize.text)
          .select();

        console.log("Atualizado:", updated);

      } else {
        // 3. Inserir novo com quantidade = 1
        const { data: inserted } = await supabasePublicClient
          .from("inventario")
          .insert([{ id_usuario: idUsuario, nome: prize.text, quantidade: 1 }])
          .select();

        console.log("Inserido:", inserted);
      }
    }
  }

  function addHistory(prize) {
    history.unshift(prize);
    if (history.length > 30) history.pop();
    // renderiza histórico com imagem pequena
    historyEl.innerHTML = '';
    history.forEach(p => {
      const el = document.createElement('div');
      el.className = 'chip';
      // criar mini preview com imagem (se houver)
      if (p.imageObj) {
        const img = document.createElement('img');
        img.src = p.img;
        img.alt = p.text;
        img.style.width = '26px';
        img.style.height = '26px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '6px';
        img.style.marginRight = '8px';
        el.appendChild(img);
      }
      const span = document.createElement('span');
      span.textContent = p.text;
      el.appendChild(span);
      historyEl.appendChild(el);
    });
    countEl.textContent = history.length;
  }

  // acessibilidade: região aria-live
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-9999px';
  document.body.appendChild(liveRegion);

  // listeners
  spinBtn.addEventListener('click', () => {
    if (peixeCoin >= 50) {
      peixeCoin = peixeCoin - 50;
      spin(6 + Math.floor(Math.random() * 4))
    }
    else alert("peixeCoins insuficientes");
  });
  /*fastBtn.addEventListener('click', () => {
    if (peixeCoin > 50) {
      peixeCoin = peixeCoin - 50;
      instantSpin()
    }
    else alert("peixeCoins insuficientes");
  })*/

  function instantSpin() {
    peixeCoinsUpd();
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    //fastBtn.disabled = true;

    // usa a função choosePrizeWeighted() já definida no seu código (não redefina aqui)
    const chosenIndex = choosePrizeWeighted();
    const chosenPrize = prizes[chosenIndex];

    const arc = (2 * Math.PI) / sectorCount;
    const sectorMid = chosenIndex * arc + arc / 2;

    const twoPi = 2 * Math.PI;

    // normaliza o ângulo atual para [0, 2PI)
    const rotationMod = ((rotation % twoPi) + twoPi) % twoPi;

    // ângulo desejado modularizado para que o setorMid fique no topo
    const desiredMod = ((- (sectorMid - Math.PI / 2)) % twoPi + twoPi) % twoPi;

    // diferença positiva no sentido CCW (desired - current) em [0, 2PI)
    let delta = desiredMod - rotationMod;
    if (delta <= 0) delta += twoPi;

    // garantir pelo menos 1 volta visual: aplicar delta - 2π (vai girar no sentido horário pelo menos 1 volta)
    const deltaToApply = delta - twoPi;

    // aplica instantaneamente
    rotation = rotation + deltaToApply;
    drawWheel(rotation);

    // debug opcional (descomente se quiser inspecionar valores)
    // console.log({ chosenIndex, rotationMod, desiredMod, delta, deltaToApply, rotation });

    spinning = false;
    spinBtn.disabled = false;
    // fastBtn.disabled = false;

    // anuncia o resultado como antes
    announceResult(chosenPrize);
  }


  // resize responsivo (debounce simples)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resizeCanvas(), 80);
  });

  // inicialização: preload imagens, ajustar tamanho e desenhar
  preloadImages(prizes).then(() => {
    // habilitar botões depois do preload para evitar clique antes de desenhar
    spinBtn.disabled = false;
    //fastBtn.disabled = false;
    // ajustar canvas (chama drawWheel internamente)
    resizeCanvas();
  });

  // primeira desativaçao enquanto carrega
  spinBtn.disabled = true;
  // fastBtn.disabled = true;

});

//abre  e fecha o inventario
async function toggleInventario() {

  const inv = document.getElementById("inventario");
  const overlay = document.getElementById("overlay");

  inv.classList.toggle("active");
  overlay.classList.toggle("active");

  const { data: itens, error } = await supabasePublicClient
    .from("inventario")
    .select("*")
    .eq("id_usuario", idUsuario);

  const invDiv = document.getElementById("inventario");
  invDiv.innerHTML = ""; // limpa antes

  itens.forEach(item => {
    const el = document.createElement("div");
    el.classList.add("item");
    const prize = prizes.find(p => p.text === item.nome);
    const imagem = prize ? prize.img : null;

    el.innerHTML = `
    <img src="${imagem}" class="item-img">
    <strong>${item.nome}</strong>
    <span>Quantidade: ${item.quantidade}</span> `;
    invDiv.appendChild(el);
  });


}
//#region Conquistas
const conquistas = [
  {
    nome: "Rico",
    tipo: "peixeCoin",
    quantidade: 2000,
    desc: "Tenha 2000 PeixeCoins",
    img: "../premios/peixecoin.png",
    unlocked: false
  },
  {
    nome: "Pobre",
    tipo: "peixeCoin",
    quantidade: 0,
    desc: "Tenha 0 PeixeCoins",
    img: "../premios/peixecoin.png",
    unlocked: false
  },
  {
    nome: "Oque eu trouxe pra ti uma vez...",
    tipo: "Laranxinha",
    quantidade: 5,
    desc: "Tenha 5 laraxinhas",
    img: "../premios/laranxinha.png",
    unlocked: false
  },
  {
    nome: "Que isso, farmou muita aura",
    tipo: "Aura",
    quantidade: 10,
    desc: "Farme 10 auras",
    img: "../premios/aura.png",
    unlocked: false
  },
  {
    nome: "Six seven",
    tipo: "67",
    quantidade: 6,
    desc: "Tenha 6 ou 7 six sevens",
    img: "../premios/67.png",
    unlocked: false
  },
  {
    nome: "Foi o Lino...",
    tipo: "Mouse roubado",
    quantidade: 8,
    desc: "Tenha 8 mouses roubados",
    img: "../premios/mouse.png",
    unlocked: false
  },
  {
    nome: "Olha o heatchliff alí",
    tipo: "Mendigo",
    quantidade: 15,
    desc: "Tenha 15 mendigos",
    img: "../premios/heatchcliff.png",
    unlocked: false
  },
  {
    nome: "O peixe da gang",
    tipo: "Peixe Sigma",
    quantidade: 1,
    desc: "Tenha 1 peixe sigma",
    img: "../premios/peixesigma.png",
    unlocked: false
  },
  {
    nome: "VOCÊ É BETA",
    tipo: "Peixe Beta",
    quantidade: 20,
    desc: "Tenha 20 peixes betas",
    img: "../premios/peixebeta.png",
    unlocked: false
  },
  {
    nome: "Ningum me entende aqui...",
    tipo: "Alisa meu pelo",
    quantidade: 5,
    desc: "Tenha 5 Alisa meu pelo",
    img: "../premios/onca.png",
    unlocked: false
  },
  {
    nome: "Abaixa esse som!",
    tipo: "Quidimais",
    quantidade: 7,
    desc: "Tenha 7 quidimais",
    img: "../premios/quidimais.png",
    unlocked: false
  },
  {
    nome: "Vou colocar esse parafuso na orelha meo",
    tipo: "Parafuso",
    quantidade: 2,
    desc: "Tenha 2 parafusos",
    img: "../premios/parafuso.png",
    unlocked: false
  }

];


async function usuarioTemConquista(nomeConquista) {
  const { data, error } = await supabasePublicClient
    .from("conquistas")
    .select("conquista")
    .eq("id_usuario", idUsuario)
    .eq("conquista", nomeConquista)
    .maybeSingle();

  if (error) {
    console.error("Erro ao verificar conquista:", error);
    return false;
  }

  return !!data;
}


async function renderConquistas() {
  const grid = document.getElementById("conquistasGrid");
  grid.innerHTML = "";

  for (const c of conquistas) {
    const unlocked = await usuarioTemConquista(c.nome);

    const div = document.createElement("div");
    div.className = "conquista" + (unlocked ? "" : " locked");

    div.innerHTML = `
      <img src="${unlocked ? c.img : 'img/locked.png'}">
      <div class="titulo">${unlocked ? c.nome : '???'}</div>
      <div class="desc">${unlocked ? c.desc : 'Conquista bloqueada'}</div>
    `;

    grid.appendChild(div);
  }
}



async function toggleConquistas() {
  document.getElementById("conquistas").classList.toggle("active");
  document.getElementById("overlayConquistas").classList.toggle("active");
  verificarConquista();

}
//#endregion

//#region Database conquistas


async function verificarConquista() {
  const { data: itens, error } = await supabasePublicClient
    .from("inventario")
    .select("nome, quantidade")
    .eq("id_usuario", idUsuario);

  if (error || !itens) {
    console.error(error);
    return;
  }
  //Conquistas especificas
  if (peixeCoin <= 0 && await supabasePublicClient
    .from("conquistas")
    .select("id_conquista")
    .eq("id_usuario", idUsuario)
    .eq("conquista", "Pobre")
    .single()) {
    const { error: insertError } = await supabasePublicClient
      .from("conquistas")
      .insert({
        id_usuario: idUsuario,
        conquista: "Pobre"
      });
  }

  if (peixeCoin >= 2000 && await supabasePublicClient
          .from("conquistas")
          .select("id_conquista")
          .eq("id_usuario", idUsuario)
          .eq("conquista", "Rico")
          .single()) {
    const { error: insertError } = await supabasePublicClient
      .from("conquistas")
      .insert({
        id_usuario: idUsuario,
        conquista: "Rico"
      });

  }

  //Conquistas gerais
  for (const regra of conquistas) {


    for (const item of itens) {
      if (item.nome == regra.tipo && item.quantidade >= regra.quantidade) {
        const { data: jaExiste } = await supabasePublicClient
          .from("conquistas")
          .select("id_conquista")
          .eq("id_usuario", idUsuario)
          .eq("conquista", regra.nome)
          .single();
        if (!jaExiste) {
          const { error: insertError } = await supabasePublicClient
            .from("conquistas")
            .insert({
              id_usuario: idUsuario,
              conquista: regra.nome
            });
        }
      }
    }
  }
}
//#endregion
