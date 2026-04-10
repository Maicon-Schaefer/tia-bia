let pedido = [];

function mostrarMensagem(texto) {
    const notificacaoAdicionado = document.getElementById("notificacaoAdicionado");

    notificacaoAdicionado.innerText = texto;
    notificacaoAdicionado.style.opacity = "1";

    setTimeout(() => {
        notificacaoAdicionado.style.opacity = "0";
    }, 2500);
}

function adicionarPedido(nomeItem, idSabor, idQtd, preco) {
    const sabor = document.getElementById(idSabor).value;
    const qtd = Number(document.getElementById(idQtd).value);

    if (!sabor) {
        mostrarMensagem("Escolha o recheio antes de adicionar.");
        return;
    }

    if (!qtd || qtd <= 0) {
        mostrarMensagem("Informe a quantidade.");
        return;
    }

    const itemExistente = pedido.find(item =>
        item.item === nomeItem && item.sabor === sabor
    );

    if (itemExistente) {
        itemExistente.qtd += qtd;
        itemExistente.subtotal = itemExistente.qtd * preco;
    } else {
        pedido.push({
            item: nomeItem,
            sabor,
            qtd,
            subtotal: qtd * preco
        });
    }

    mostrarMensagem(`${nomeItem} (${sabor}) x${qtd} adicionado!`);

    document.getElementById(idQtd).value = "";
    atualizarTotal();
}

function arredondarPara5Centavos(valor) {
    return Math.round(valor * 20) / 20;
}

function atualizarTotal() {
    let total = 0;
    let listaHTML = "";

    pedido.forEach((item, index) => {
    total += item.subtotal;

    listaHTML += `
        <div class="item-pedido">
            <p>
                ${item.item} (${item.sabor}) x${item.qtd} - 
                R$ ${item.subtotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2
                })}
            </p>
            <button class="btn-remover" onclick="removerItem(${index})">✖</button>
        </div>
    `;
});

    const pagamento = document.getElementById("pagamento").value;

    if (pagamento.includes("Dinheiro")) {
        total *= 0.95;
    }

    total = arredondarPara5Centavos(total);

    document.getElementById("listaPedido").innerHTML = listaHTML;

    document.getElementById("totalGeral").innerText =
        "Total do Pedido: R$ " + total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2
        });
}

function removerItem(index) {
    pedido.splice(index, 1);
    atualizarTotal();
    mostrarMensagem("Item removido do pedido.");
}

function validarData() {
    const campoData = document.getElementById("dataHora");
    const dataSelecionada = new Date(campoData.value);

    if (!campoData.value) return;

    const diaSemana = dataSelecionada.getDay();
    const hora = dataSelecionada.getHours();
    const minuto = dataSelecionada.getMinutes();
    const horaEmMinutos = hora * 60 + minuto;

    const abertura = 6 * 60; 
    const fechamento = 19 * 60 + 30; 

    if (diaSemana === 0) {
        mostrarMensagem("Aos domingos não estamos abertos!");
        campoData.value = "";
        return;
    }

    if (horaEmMinutos < abertura || horaEmMinutos > fechamento) {
        mostrarMensagem("Atendemos apenas das 06:00 às 19:30.");
        campoData.value = "";
        return;
    }
}


function mostrarEndereco() {
    const tipo = document.getElementById("tipoPedido").value;
    const campoEndereco = document.getElementById("campoEndereco");

    if (tipo.includes("Entrega")) {
        campoEndereco.style.display = "flex";

        if (window.innerWidth <= 768) {
            campoEndereco.style.flexDirection = "column";
            campoEndereco.style.alignItems = "stretch";
        } else {
            campoEndereco.style.flexDirection = "row";
            campoEndereco.style.alignItems = "center";
            campoEndereco.style.gap = "10px";
        }
    } else {
        campoEndereco.style.display = "none";
    }
}

function saudacaoHorario() {
    const hora = new Date().getHours();

    if (hora < 12) {
        return "Bom dia";
    } else if (hora < 18) {
        return "Boa tarde";
    } else {
        return "Boa noite";
    }
}

function enviarPedidoWhatsapp() {
    const nome = document.getElementById("nomeCliente").value;
    const telefone = document.getElementById("telefoneCliente").value;
    const dataOriginal = document.getElementById("dataHora").value;
    const dataObj = new Date(dataOriginal);

    const dataHora = dataObj.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });

    const tipo = document.getElementById("tipoPedido").value;
    const endereco = document.getElementById("enderecoCliente").value;
    const pagamento = document.getElementById("pagamento").value;
    const total = document.getElementById("totalGeral").innerText;

    if (
    nome.trim() === "" ||
    telefone.trim() === "" ||
    !dataHora ||
    tipo === "Selecione" ||
    pagamento === "Selecione" ||
    pedido.length === 0
) {
    mostrarMensagem("Preencha todos os dados do pedido.");
    return;
}

if (tipo.includes("Entrega") && endereco.trim() === "") {
    mostrarMensagem("Para entrega, informe o endereço.");
    return;
}

    let mensagem = `${saudacaoHorario()}! Gostaria de fazer um pedido.%0A%0A`;

    mensagem += `*Nome:* ${nome}%0A`;
    mensagem += `*Telefone:* ${telefone}%0A`;
    mensagem += `*Data e Hora:* ${dataHora}%0A`;
    mensagem += `*Tipo:* ${tipo}%0A`;

    if (tipo.includes("Entrega")) {
        mensagem += `*Endereço:* ${endereco}%0A`;
    }

    mensagem += `*Pagamento:* ${pagamento}%0A%0A`;

    mensagem += `*Itens do Pedido:*%0A`;

    pedido.forEach(item => {
        mensagem += `- ${item.item} (${item.sabor}) x${item.qtd} = R$ ${item.subtotal.toLocaleString("pt-BR", {
            minimumFractionDigits: 2
        })}%0A`;
    });

    mensagem += `%0A*${total}*`;

    const numero = "5551980384887";
    const link = `https://wa.me/${numero}?text=${mensagem}`;

    window.open(link, "_blank");
}