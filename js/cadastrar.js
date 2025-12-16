const supabasePublicClient = supabase.createClient("https://wdydybykkhkbqrahiegq.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeWR5Ynlra2hrYnFyYWhpZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDUyODIsImV4cCI6MjA4MDUyMTI4Mn0.urD38OYOc8TO4EgMo_JzuoQrzKF0UojvY5smsPK0wJ0",
      {
        db: {
          schema:"public"
        }
      }
    );

    
    /*(async()=> {

    const {data, error} = await supabasePublicClient.from("usuarios").select("*")
    console.log(data);})()*/
    //insere
    
    // --- FUNÇÕES UTILITÁRIAS DE HASHING (Necessário no navegador) ---

/**
 * Converte um ArrayBuffer (resultado da criptografia) em uma string hexadecimal.
 * @param {ArrayBuffer} buffer O ArrayBuffer a ser convertido.
 * @returns {string} A string hexadecimal.
 */
function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Gera um hash SHA-256 de uma string usando a Web Crypto API.
 * @param {string} message A string (senha) a ser hashed.
 * @returns {Promise<string>} O hash hexadecimal.
 */
async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    // Usa o algoritmo SHA-256 para gerar o hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); 
    return arrayBufferToHex(hashBuffer);
}

// --- SUA FUNÇÃO DE CADASTRO ---

async function cadastrar() {
  const form = document.getElementById("formUsuario");
  const nomeEl = document.getElementById("nome");
  const passEl = document.getElementById("password");

  const nome = (nomeEl.value || "").trim();
  const senha = (passEl.value || "").trim();

  if (!nome || !senha) {
    alert("Nome e senha não podem estar vazios.");
    return;
  }
  if (senha.length < 6) {
    alert("A senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  // desabilita botão para evitar double submit (se tiver botão submit)
  const submitBtn = form.querySelector('button[type="button"], button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; }

  // Hash: usa bcryptjs se disponível (recomendado), senão usa sha256 (fallback)
  let hashed;
  try {
    if (typeof bcrypt !== "undefined" && bcrypt && bcrypt.hashSync) {
      // bcryptjs está carregado — gera salt e hash (cuidado: hashSync é síncrono)
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      hashed = bcrypt.hashSync(senha, salt);
    } else {
      // fallback rápido (não recomendado para produção)
      hashed = await sha256(senha);
    }
  } catch (err) {
    console.error("Erro ao gerar hash:", err);
    alert("Erro ao processar a senha. Tente novamente.");
    if (submitBtn) submitBtn.disabled = false;
    return;
  }

  // Tenta inserir diretamente e trata conflito (atomicamente)
  try {
    const { data, error } = await supabasePublicClient
      .from("usuarios")
      .insert([{ nome: nome, senha: hashed }])
      .select() // para retornar o registro criado
      .single();

    if (error) {
      // erro típico de duplicata no Postgres: código 23505
      // Supabase pode expor error.code ou error.details/message
      if (error.code === "23505" || (error.details && /already exists/i.test(error.details)) ) {
        alert("Esse nome de usuário já está em uso. Escolha outro.");
      } else {
        console.error("Erro ao inserir registro:", error);
        alert("Erro ao cadastrar: " + (error.message || JSON.stringify(error)));
      }
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    // sucesso
    console.log("Registro inserido com sucesso:", data);
    alert("Usuário cadastrado com sucesso!");
    // redireciona para login
    window.location.href = '../entrar/index.html';
  } catch (err) {
    console.error("Erro inesperado no cadastro:", err);
    alert("Erro inesperado. Tente novamente.");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    form.reset();
  }
}