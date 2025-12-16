const supabasePublicClient = supabase.createClient("https://wdydybykkhkbqrahiegq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeWR5Ynlra2hrYnFyYWhpZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDUyODIsImV4cCI6MjA4MDUyMTI4Mn0.urD38OYOc8TO4EgMo_JzuoQrzKF0UojvY5smsPK0wJ0",
    {
        db: {
            schema: "public"
        }
    }
);

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

// função para entrar
async function entrar() {
    const form = document.getElementById("formUsuario");

    var nome = document.getElementById("nome").value;
    var senha = document.getElementById("password").value;

    if (!nome || !senha) {
        alert("Nome e senha não podem estar vazios.");
        return;
    }

    // 1. Geração do Hash (Substituindo bcrypt.hashSync)
    try {
        var hashed = await sha256(senha); // Chamada assíncrona para gerar o hash
        console.log("Hash SHA-256 gerado:", hashed);
    } catch (error) {
        console.error("Erro ao gerar o hash da senha:", error);
        return; // Interrompe a função se o hash falhar
    }
    //pega o usuario com o mesmo nome no banco
    const { data: usuario } = await supabasePublicClient.from("usuarios").select("nome, senha,id_usuario").eq("nome", nome).single();


    if (usuario && hashed == usuario.senha) {
        localStorage.setItem("idUsuario", usuario.id_usuario);
        window.location.href = '../roleta/index.html';
    }
    else if(!usuario){
        alert("Usuario não existe");
    }
    else {
        alert("Senha incorreta");
    }


}