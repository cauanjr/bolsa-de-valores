// Ajusta tickers brasileiros para o formato AlphaVantage
function ajustarTicker(ticker) {
    const tickersBR = ["3", "4"]; // termina com 3 ou 4 = ação BR
    const final = ticker.slice(-1);

    if (tickersBR.includes(final)) {
        return ticker + ".SA"; // AlphaVantage precisa do .SA
    }

    return ticker;
}

// Copia do select para o input
function selecionarTicker() {
    const select = document.getElementById("lista-tickers");
    const inputTicker = document.getElementById("ticker");
    inputTicker.value = select.value;
}

// Busca cotação
async function buscarCotacao() {
    let ticker = document.getElementById("ticker").value.toUpperCase();

    if (!ticker) {
        alert("Digite um ticker ou escolha um da lista!");
        return;
    }

    // Ajusta para .SA se for ação BR
    ticker = ajustarTicker(ticker);

    // Sua API KEY
    const apiKey = "UFPNM8ZRQN1QTB66";

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

// Carrega gráfico
async function carregarGrafico(ticker, apiKey) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const series = data["Time Series (Daily)"];
    if (!series) {
        return;
    }

    const labels = [];
    const valores = [];

    for (let dia in series) {
        labels.push(dia);
        valores.push(parseFloat(series[dia]["4. close"]));
    }

    const ctx = document.getElementById("chart").getContext("2d");

    // Destroi o gráfico anterior para não sobrepor
    if (window.meuGrafico) {
        window.meuGrafico.destroy();
    }

    window.meuGrafico = new Chart(ctx, {
        type: "line",
