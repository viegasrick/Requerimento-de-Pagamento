function enviarDados() {
    const solicitante = document.getElementById("solicitante").value;
    const recebedor = document.getElementById("recebedor").value;
    const cpf_cnpj = document.getElementById("cpf_cnpj").value;
    const pix = document.getElementById("pix").value;
    const banco = document.getElementById("banco").value;
    const agencia = document.getElementById("agencia").value;
    const conta = document.getElementById("conta").value;
    const tipo_conta = document.getElementById("tipo_conta").value;
    const servicos = document.getElementById("servicos").value;
    const valor = document.getElementById("valor").value;
    const data_servico = document.getElementById("data_servico").value;
    const data_pagamento = document.getElementById("data_pagamento").value;
    const centro_custo = document.getElementById("centro_custo").value;
    const local = document.getElementById("local").value;

    // Validação de campos obrigatórios
    if (!solicitante || !recebedor || !cpf_cnpj || !servicos || !valor || !data_servico || !data_pagamento || !centro_custo || !local) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return; // Impede o envio caso algum campo não esteja preenchido
    }

    // Se o campo PIX estiver vazio, os campos do Banco são obrigatórios
    if (!pix) {
        if (!banco || !agencia || !conta || !tipo_conta) {
            alert("Por favor, preencha todos os campos de banco.");
            return; // Impede o envio caso algum campo de banco não esteja preenchido
        }
    }

    // Envio dos dados para o Excel através da API SheetMonkey
    fetch("https://api.sheetmonkey.io/form/b2cwo2nua4kmJ4nDtVL5Ni", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            solicitante: solicitante,
            recebedor: recebedor,
            cpf_cnpj: cpf_cnpj,
            pix: pix,
            banco: banco,
            agencia: agencia,
            conta: conta,
            tipo_conta: tipo_conta,
            servicos: servicos,
            valor: valor,
            data_servico: data_servico,
            data_pagamento: data_pagamento,
            centro_custo: centro_custo,
            local: local,
            status: "Pendente"  // Nova coluna "Status" com valor "Pendente"
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Exibir mensagem de agradecimento após sucesso
            const mensagem = document.createElement("div");
            mensagem.textContent = "Obrigado por USAR O NOSSOS SERVIÇOS!";
            mensagem.style.fontSize = "20px";
            mensagem.style.fontWeight = "bold";
            mensagem.style.color = "green";
            mensagem.style.textAlign = "center";
            mensagem.style.marginTop = "20px";
            document.body.appendChild(mensagem); // Adiciona a mensagem na página

            // Não mostrar a caixa de erro
            console.log("Dados enviados com sucesso!");
        }
    })
    .catch(error => {
        console.error("Erro ao enviar os dados:", error);
        // Remover alerta de erro
        // Não precisa mostrar o erro, pois estamos usando apenas o log
    });

    // Geração do PDF (código permanece inalterado)
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Adicionando a logo ao PDF
    const logo = 'logo.png'; // Caminho da logo
    const logoWidth = 80; // Largura da logo (tamanho mais amplo)
    const logoHeight = 60; // Altura da logo (aumento proporcional)

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = logo;
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.globalAlpha = 0.1; // Opacidade baixa para efeito de marca d'água
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");

        const logoX = (doc.internal.pageSize.width - logoWidth) / 2;
        const logoY = (doc.internal.pageSize.height - logoHeight) / 6;

        doc.addImage(dataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

        // Adicionando um título estilizado
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Recibo de Pagamento", 105, 20, null, null, "center");

        // Estilo para os dados
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);

        const startY = 50;
        doc.text(`Solicitante: ${solicitante}`, 20, startY);
        doc.text(`Recebedor: ${recebedor}`, 20, startY + 10);
        doc.text(`CPF/CNPJ: ${cpf_cnpj}`, 20, startY + 20);
        doc.text(`Chave PIX: ${pix}`, 20, startY + 30);
        doc.text(`Banco: ${banco}`, 20, startY + 40);
        doc.text(`Agência: ${agencia}`, 20, startY + 50);
        doc.text(`Conta: ${conta}`, 20, startY + 60);
        doc.text(`Tipo de Conta: ${tipo_conta}`, 20, startY + 70);
        doc.text(`Serviço Realizado: ${servicos}`, 20, startY + 80);
        doc.text(`Valor: R$ ${valor}`, 20, startY + 90);
        doc.text(`Data do Serviço: ${data_servico}`, 20, startY + 100);
        doc.text(`Data de Pagamento: ${data_pagamento}`, 20, startY + 110);
        doc.text(`Centro de Custo: ${centro_custo}`, 20, startY + 120);
        doc.text(`Local do Serviço: ${local}`, 20, startY + 130);

        doc.setLineWidth(0.5);
        doc.line(20, startY + 140, 190, startY + 140);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Obrigado por utilizar nossos serviços!", 105, startY + 160, null, null, "center");

        doc.save(`Recibo_${solicitante}.pdf`);
    };
}
