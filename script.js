// Copia o ticker selecionado para a caixa de texto
function selecionarTicker() {
    const select = document.getElementById("lista-tickers");
    const inputTicker = document.getElementById("ticker");
    inputTicker.value = select.value;
}

// Busca cotação
async function buscarCotacao() {
    const ticker = document.getElementById("ticker").value.toUpperCase();

    // 🔑 SUA CHAVE DA API
    const apiKey = "UFPNM8ZRQN1QTB66";

    if (!ticker) {
        alert("Digite um ticker ou escolha um da lista!");
        return;
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) {
        document.getElementById("resultado").innerHTML = "Ticker não encontrado.";
        return;
    }

    const preco = parseFloat(quote["05. price"]);
    const alta = parseFloat(quote["09. change"]);
    const perc = quote["10. change percent"];

    document.getElementById("resultado").innerHTML = `
        <h3>${ticker}</h3>
        <p>Preço Atual: <strong>$ ${preco.toFixed(2)}</strong></p>
        <p>Variação: <strong>${alta.toFixed(2)} (${perc})</strong></p>
    `;

    carregarGrafico(ticker, apiKey);
}

// Carrega gráfico de preços
async function carregarGrafico(ticker, apiKey) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const series = data["Time Series (Daily)"];
    if (!series) return;

    const labels = [];
    const valores = [];

    for (let dia in series) {
        labels.push(dia);
        valores.push(parseFloat(series[dia]["4. close"]));
    }

    const ctx = document.getElementById("chart").getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels.reverse(),
            datasets: [{
                label: ticker + " - Fechamento",
                data: valores.reverse(),
                borderColor: "#4cc9f0",
                borderWidth: 2,
            }]
        }
    });
}
