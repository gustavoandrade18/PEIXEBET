const supabasePublicClient = supabase.createClient("https://wdydybykkhkbqrahiegq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeWR5Ynlra2hrYnFyYWhpZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDUyODIsImV4cCI6MjA4MDUyMTI4Mn0.urD38OYOc8TO4EgMo_JzuoQrzKF0UojvY5smsPK0wJ0",
  {
    db: {
      schema: "public"
    }
  }
);

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

  rank.innerHTML = "<h2>Ranking</h2>";

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
