const supabasePublicClient = supabase.createClient("https://wdydybykkhkbqrahiegq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeWR5Ynlra2hrYnFyYWhpZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDUyODIsImV4cCI6MjA4MDUyMTI4Mn0.urD38OYOc8TO4EgMo_JzuoQrzKF0UojvY5smsPK0wJ0",
  {
    db: {
      schema: "public"
    }
  }
);

const container = document.querySelector(".bolhas");

for (let i = 0; i < 25; i++) {
  const bolha = document.createElement("div");
  bolha.classList.add("bolha");

  const size = Math.random() * 30 + 10; // tamanho
  bolha.style.width = `${size}px`;
  bolha.style.height = `${size}px`;

  bolha.style.left = `${Math.random() * 100}vw`;
  bolha.style.animationDuration = `${Math.random() * 20 + 16}s`;
  bolha.style.animationDelay = `${Math.random() * 5}s`;

  container.appendChild(bolha);
}

const rank = document.getElementById("ranking");

document.addEventListener("DOMContentLoaded", async () => {
  const { data, error } = await supabasePublicClient
    .from("ranking")
    .select("*");

  if (error) {
    console.error(error);
    rank.innerHTML = "<p>Erro ao carregar ranking</p>";
    return;
  }

  rank.innerHTML = `
  <h2>Ranking</h2>
  <div class="rank-header">
    <span class="n">Nome</span>
    <span class="c">Conquistas</span>
  </div>
`;


  data.forEach((linha, index) => {
    const div = document.createElement("div");
    div.className = "rank-item";

    div.innerHTML = `
      <span class="posicao">#${index + 1}</span>
      <span class="nome">${linha.nome}</span>
      <span class="pontos">${linha.quantidade}</span>
    `;

    rank.appendChild(div);
  });
});
