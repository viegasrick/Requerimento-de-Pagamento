function enviarDados() {
    let formData = {
        "LOCAL_DATA": document.getElementById("local_data").value, // Apenas o valor do input
        "DEPENDENCIA": document.getElementById("dependencia").value, // Apenas o valor do input
        "PREFIXO": document.getElementById("prefixo").value,
        "DATA_ENVIO": new Date().toLocaleDateString("pt-BR") // Data do envio
    };

    // Capturar os serviços realizados na tabela
    let servicos = document.querySelectorAll("table tr");
    servicos.forEach((linha, index) => {
        if (index === 0) return; // Pular cabeçalho

        let colunas = linha.querySelectorAll("td");
        if (colunas.length >= 3) {
            let nomeServico = colunas[0].textContent.trim();
            let status = colunas[1].textContent.trim();
            let dataServico = colunas[2].querySelector("input") ? colunas[2].querySelector("input").value : "";

            formData[`SERVICO_${index}`] = nomeServico;
            formData[`STATUS_${index}`] = status;
            formData[`DATA_${index}`] = formatarDataParaBrasil(dataServico);
        }
    });

    console.log("Enviando dados para SheetMonkey:", formData);

    // Enviar para SheetMonkey
    fetch("https://api.sheetmonkey.io/form/fxS1JNaQbCiAZ1yJmCmhgp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro ao enviar os dados.");
        return response.text();
    })
    .then(data => {
        alert("Dados enviados com sucesso!");
        console.log("Resposta do servidor:", data);
    })
    .catch(error => {
        alert("Erro ao enviar os dados.");
        console.error("Erro:", error);
    });
}

// Função para formatar a data para o formato brasileiro
function formatarDataParaBrasil(dataISO) {
    if (!dataISO) return ""; // Evita erro caso a data esteja vazia
    let partes = dataISO.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`; // Retorna no formato DD/MM/YYYY
}

// Função para gerar o PDF e enviar os dados
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Adicionando um loader na tela
    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = "Gerando PDF...";
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.fontSize = '20px';
    loadingMessage.style.color = '#000';
    loadingMessage.style.backgroundColor = '#f0f0f0';
    loadingMessage.style.padding = '10px';
    loadingMessage.style.borderRadius = '5px';
    document.body.appendChild(loadingMessage);

    // Formatar datas
    document.querySelectorAll('input[type="date"]').forEach(input => {
        let dataFormatada = formatarDataParaBrasil(input.value);
        let spanData = document.createElement("span");
        spanData.textContent = dataFormatada;
        input.parentNode.insertBefore(spanData, input.nextSibling);
        input.style.display = "none"; 
    });

    // Capturar a assinatura
    const assinaturaCanvas = document.getElementById('assinaturaCanvas');
    const assinaturaImagem = assinaturaCanvas.toDataURL("image/png");

    // Capturar o formulário
    html2canvas(document.getElementById("ratForm")).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.addImage(assinaturaImagem, "PNG", 10, imgHeight + 20, 40, 20);
        pdf.save("Relatorio_RAT.pdf");

        // Remover o loader e restaurar os inputs
        document.body.removeChild(loadingMessage);
        document.querySelectorAll('.data-formatada').forEach(span => span.remove());
        document.querySelectorAll('input[type="date"]').forEach(input => input.style.display = "inline-block");

        // Enviar os dados para o SheetMonkey
        enviarDados();
    });
}

// Função para capturar a assinatura no canvas
const canvas = document.getElementById("assinaturaCanvas");
const ctx = canvas.getContext("2d");
let desenhando = false;

function iniciarDesenho(event) {
    desenhando = true;
    ctx.beginPath();
    desenhar(event);
}

function finalizarDesenho() {
    desenhando = false;
    ctx.beginPath();
}

function desenhar(event) {
    if (!desenhando) return;
    event.preventDefault();
    let x = event.clientX || event.touches[0].clientX;
    let y = event.clientY || event.touches[0].clientY;
    let rect = canvas.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
}

canvas.addEventListener("mousedown", iniciarDesenho);
canvas.addEventListener("mouseup", finalizarDesenho);
canvas.addEventListener("mousemove", desenhar);
canvas.addEventListener("touchstart", iniciarDesenho);
canvas.addEventListener("touchend", finalizarDesenho);
canvas.addEventListener("touchmove", desenhar);
