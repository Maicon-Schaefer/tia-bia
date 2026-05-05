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

    if (nomeItem === "Torta Simples" && qtd < 1.5 || nomeItem === "Torta Especial" && qtd < 1.5){
        mostrarMensagem("O pedido mínimo da torta é 1,5kg");
        return
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

    mostrarMensagem(`${nomeItem.includes("Torta") ? qtd + "kg" : qtd + "x"} ${nomeItem} (${sabor}) adicionado!`);

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
                ${item.item.includes("Torta") ? item.qtd + "kg" : item.qtd + "x"} ${item.item} (${item.sabor}) - 
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

const diasSemana = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const diaSemana = diasSemana[dataObj.getDay()];

mensagem += `*Nome:* ${nome}%0A`;
mensagem += `*Telefone:* ${telefone}%0A`;
mensagem += `*Data e Hora:* ${dataHora} - ${diaSemana}%0A`;
mensagem += `*Tipo:* ${tipo}%0A`;

if (tipo.includes("Entrega")) {
    mensagem += `*Endereço:* ${endereco}%0A`;
}

    mensagem += `*Pagamento:* ${pagamento}%0A`;

    let tortas = "";
    let outros = "";

pedido.forEach(item => {
    const linha = `- ${item.item.includes("Torta") ? item.qtd + "kg" : item.qtd + "x"} ${item.item} (${item.sabor}) = R$ ${item.subtotal.toLocaleString("pt-BR", {
        minimumFractionDigits: 2
    })}%0A`;

    if (item.item.includes("Torta")) {
        tortas += linha;
    } else {
        outros += linha;
    }
});

if (tortas) {
    mensagem += `━━━━━━━━━━━━━━━%0A`;
    mensagem += `*TORTAS*%0A`;
    mensagem += `━━━━━━━━━━━━━━━%0A`;
    mensagem += tortas;
}

if (outros) {
    mensagem += `━━━━━━━━━━━━━━━%0A`;
    mensagem += `*SALGADOS E DOCES*%0A`;
    mensagem += `━━━━━━━━━━━━━━━%0A`;
    mensagem += outros;
}

    mensagem += `━━━━━━━━━━━━━━━%0A`;
    mensagem += `*Total do Pedido = ${total.replace("Total do Pedido: ", "")}*`;

    const numero = "5551996189555";
    const link = `https://wa.me/${numero}?text=${mensagem}`;

    window.open(link, "_blank");
}

const descricoesTortas = {
    "Cappuccino": "Ingredientes:\n\nNata, raspa de chocolate e mousse de café",
    "Bia": "Ingredientes:\n\nCreme de chantilly, bombom, leite condensado e coco",
    "Brigadeiro": "Ingredientes:\n\nNata, raspas de chocolate e brigadeiro",
    "Prestígio": "Ingredientes:\n\nBolo chocolate, prestígio, leite condensado e coco branco",
    "Chocolate": "Ingredientes:\n\nNata, bombom, merengada e leite condensado",
    "Mousse": "Ingredientes:\n\nNata, raspas de chocolate, mousse de chocolate branco e mousse de chocolate",
    "Bombom": "Ingredientes:\n\nNata, bombom e brigadeiro",
    "Leite Condensado": "Ingredientes:\n\nNata, bombom e leite condensado",
    "Tentação": "Ingredientes:\n\nNata, morango, merengada e leite condensado",
    "Rose": "Ingredientes:\n\nNata, nozes, merengada e pudim",
    "Dois Amores": "Ingredientes:\n\nGanache Nestlé e ganache chocolate branco",
    "Leite Ninho": "Ingredientes:\n\nNata, morango e brigadeiro de leite ninho",
    "Daia": "Ingredientes:\n\nNata, morango, leite condensado e raspas de chocolate",
    "Pamela": "Ingredientes:\n\nCreme de chantilly, morango e brigadeiro",
    "Floresta Negra": "Ingredientes:\n\nChanrilly, morango e brigadeiro",
    "Surpresa": "Ingredientes:\n\nNata, morango e mousse de chocolate",
    "Marta Rocha": "Ingredientes:\n\nNata, pêssego, merengada e ovos moles",
    "Água na Boca": "Ingredientes:\n\nTrês camadas de nata, morango e pão de ló",

};

function atualizarDescricaoTorta(select) {
    const sabor = select.value;

    const itemTorta = select.closest(".itemTorta");

    const descricao = itemTorta.querySelector(".descricaoTorta");

    if (descricoesTortas[sabor]) {
        descricao.innerText = descricoesTortas[sabor];
    } else {
        descricao.innerText = "Escolha o sabor para visualizar os componentes";
    }
}