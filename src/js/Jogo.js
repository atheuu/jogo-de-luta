// Definição da classe Jogo
class Jogo {
  constructor() {
    // Inicialização do contexto de desenho do canvas
    this.canvasElemento = document.querySelector("canvas");
    this.contextoDesenho = this.canvasElemento.getContext("2d");
    this.canvasElemento.width = 1024; // Define a largura do canvas
    this.canvasElemento.height = 576; // Define a altura do canvas

    // Constantes do jogo
    this.gravidadeConstante = 0.7; // Define a constante de gravidade
    this.alturaDoChao = 96; // Define a altura do chão

    // Variáveis do jogo
    this.idDoJogo = null;
    this.vencedorVerificado = false;
    this.teclasPressionadas = {}; // Armazena as teclas pressionadas
    this.tempoLimiteDeJogo = 60; // Define o tempo limite do jogo
    this.idDoCronometro = null; // Armazena o ID do cronômetro
    this.tempoEsgotado = false; // Indica se o tempo do jogo esgotou
    this.modalAberto = false; // Indica se o modal está aberto

    // Variveis do modal
    this.modal = document.getElementById("interface");
    this.btnAbrirModal = document.getElementById("botao-abrir-interface");
    this.spanFecharModal = document.getElementsByClassName("fechar-interface")[0];

    // Criação do cenário do jogo
    this.planoDeFundo = new Ator({
      posicao: { x: 0, y: 0 },
      imagemSrc: "./src/img/planoDeFundo.png",
    });

    this.loja = new Ator({
      posicao: { x: 625, y: 128 },
      imagemSrc: "./src/img/loja.png",
      escala: 2.75,
      quadrosMaximos: 6,
    });

    // Criação do lutador Samurai Mack
    this.samuraiMack = new Lutador({
      nome: "samuraiMack",
      posicao: { x: 231, y: 188 },
      largura: 58,
      espelhar: false,
      velocidade: { x: 0, y: 0 },
      ajuste: { x: 0, y: 0 },
      imagemSrc: "./src/img/samuraiMack/parado.png",
      escala: 2.5,
      quadrosMaximos: 8,
      ajuste: { x: 215, y: 157 },
      atores: {
        parado: {
          imagemSrc: "./src/img/samuraiMack/parado.png",
          quadrosMaximos: 8,
        },
        correndo: {
          imagemSrc: "./src/img/samuraiMack/correndo.png",
          quadrosMaximos: 8,
        },
        pulando: {
          imagemSrc: "./src/img/samuraiMack/pulando.png",
          quadrosMaximos: 2,
        },
        caindo: {
          imagemSrc: "./src/img/samuraiMack/caindo.png",
          quadrosMaximos: 2,
        },
        ataque1: {
          imagemSrc: "./src/img/samuraiMack/ataque1.png",
          quadrosMaximos: 6,
        },
        levarGolpe: {
          imagemSrc: "./src/img/samuraiMack/levarGolpe.png",
          quadrosMaximos: 4,
        },
        morrer: {
          imagemSrc: "./src/img/samuraiMack/morrer.png",
          quadrosMaximos: 6,
        },
      },
      caixaDeAtaque: {
        ajuste: {
          x: 58,
          y: 50,
        },
        largura: 200,
        altura: 50,
      },
    });

    // Criação do lutador Kenji
    this.kenji = new Lutador({
      nome: "kenji",
      posicao: { x: 743, y: 188 },
      largura: 51,
      espelhar: false,
      velocidade: { x: 0, y: 0 },
      ajuste: { x: -75, y: 0 },
      imagemSrc: "./src/img/kenji/parado.png",
      escala: 2.5,
      quadrosMaximos: 4,
      ajuste: { x: 215, y: 172 },
      atores: {
        parado: {
          imagemSrc: "./src/img/kenji/parado.png",
          quadrosMaximos: 4,
        },
        correndo: {
          imagemSrc: "./src/img/kenji/correndo.png",
          quadrosMaximos: 8,
        },
        pulando: {
          imagemSrc: "./src/img/kenji/pulando.png",
          quadrosMaximos: 2,
        },
        caindo: {
          imagemSrc: "./src/img/kenji/caindo.png",
          quadrosMaximos: 2,
        },
        ataque1: {
          imagemSrc: "./src/img/kenji/ataque1.png",
          quadrosMaximos: 4,
        },
        levarGolpe: {
          imagemSrc: "./src/img/kenji/levarGolpe.png",
          quadrosMaximos: 3,
        },
        morrer: {
          imagemSrc: "./src/img/kenji/morrer.png",
          quadrosMaximos: 7,
        },
      },
      caixaDeAtaque: {
        ajuste: {
          x: -174,
          y: 50,
        },
        largura: 174,
        altura: 50,
      },
    });

    // Função para gerenciar eventos de teclado
    const gerenciarTeclado = (evento) => {
      this.teclasPressionadas[evento.key] = evento.type === "keydown"; // Registra a tecla pressionada
      // console.log(`Tecla pressionada: ${evento.key}`); // Exibe qual tecl está sendo pressionada
    };
    // Adiciona event listeners para gerenciar o teclado
    window.addEventListener("keydown", gerenciarTeclado);
    window.addEventListener("keyup", gerenciarTeclado);
    // Adiciona um event listener para a tecla "Escape"
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        if (this.modalAberto) {
          // Se o modal estiver aberto, fecha o modal
          this.fecharModal();
        } else {
          // Se o modal estiver fechado, abre o modal
          this.abrirModal();
        }
      }
    });
    // Associa a função reiniciarJogo ao evento de pressionar a tecla Espaço
    window.addEventListener("keydown", (evento) => {
      if (evento.key === " ") {
        // Verifica se a tecla pressionada é Espaço
        if (this.tempoEsgotado || this.samuraiMack.morto || this.kenji.morto) {
          // Verifica se o jogo terminou
          this.reiniciarJogo(); // Chama a função reiniciarJogo
        }
      }
    });

    // Inicia o jogo
    this.iniciarJogo();

    // Inicia a contagem regressiva do cronômetro
    diminuirCronometro(
      this.tempoLimiteDeJogo,
      this.idDoCronometro,
      () => this.modalAberto,
      () => this.vencedorVerificado
    );
  }

  abrirModal() {
    if (this.idDoJogo) {
      cancelAnimationFrame(this.idDoJogo); // Para a animação do jogo
      this.idDoJogo = null; // Limpa o ID do quadro de animação
    }
    // Exibe o modal alterando a visibilidade
    this.modalAberto = true; // Atualiza a variável de controle para indicar que o modal está aberto
    this.modal.style.display = "flex"; // Altere o estilo do modal para exibir
  }

  fecharModal() {
    // Oculta o modal alterando a visibilidade
    this.modalAberto = false; // Atualiza a variável de controle para indicar que o modal está fechado
    this.modal.style.display = "none"; // Altere o estilo do modal para ocultar

    // Retoma o jogo
    this.iniciarJogo(); // Retoma a animação do jogo
  }

  abrirFecharModal() {
    // Quando o usuário clicar no botão, abra o modal
    this.btnAbrirModal.onclick = () => {
      this.abrirModal();
    };

    // Quando o usuário clicar no <span> (x), feche o modal
    this.spanFecharModal.onclick = () => {
      this.fecharModal();
    };

    // Quando o usuário clicar fora do modal, feche-o
    window.onclick = (event) => {
      if (event.target == this.modal) {
        this.fecharModal();
      }
    };

    document.addEventListener("DOMContentLoaded", () => {
      this.abrirModal();
    });
  }

  // Método para iniciar o jogo
  iniciarJogo() {
    // Solicita ao navegador que chame novamente este método na próxima animação de quadro
    this.idDoJogo = window.requestAnimationFrame(this.iniciarJogo.bind(this));

    // Atualiza o plano de fundo e a loja no contexto de desenho
    this.planoDeFundo.atualizar(this.contextoDesenho);
    this.loja.atualizar(this.contextoDesenho);

    // Aplica um efeito de desvanecimento no canvas para criar um efeito de rastro
    this.contextoDesenho.fillStyle = "rgba(255, 255, 255, 0.15)";
    this.contextoDesenho.fillRect(
      0,
      0,
      this.canvasElemento.width,
      this.canvasElemento.height
    );

    // // Desenha um retângulo azul semi-transparente sobre o lutador Samurai Mack
    // this.contextoDesenho.fillStyle = "rgba(0, 255, 255, 0.5)"; // Define a cor azul com opacidade
    // this.contextoDesenho.fillRect(
    //   this.samuraiMack.posicao.x,
    //   this.samuraiMack.posicao.y,
    //   this.samuraiMack.largura,
    //   this.samuraiMack.altura
    // );

    // // Desenha um retângulo azul semi-transparente sobre o lutador Kenji
    // this.contextoDesenho.fillStyle = "rgba(0, 255, 255, 0.5)"; // Define a cor azul com opacidade
    // this.contextoDesenho.fillRect(
    //   this.kenji.posicao.x,
    //   this.kenji.posicao.y,
    //   this.kenji.largura,
    //   this.kenji.altura
    // );

    // Atualiza a posição dos lutadores (Samurai Mack e Kenji) no canvas
    this.samuraiMack.atualizar(
      this.contextoDesenho,
      this.canvasElemento,
      this.alturaDoChao,
      this.gravidadeConstante,
      this.samuraiMack.espelhar
    );
    this.kenji.atualizar(
      this.contextoDesenho,
      this.canvasElemento,
      this.alturaDoChao,
      this.gravidadeConstante,
      this.kenji.espelhar
    );

    // Atualiza a posição da caixa de ataque dos lutadores
    atualizarCaixaDeAtaque(this.samuraiMack, this.contextoDesenho);
    atualizarCaixaDeAtaque(this.kenji, this.contextoDesenho);

    // Move os lutadores de acordo com as teclas pressionadas
    moverLutador(
      this.samuraiMack,
      "a",
      "d",
      "w",
      "s",
      this.tempoEsgotado,
      this.teclasPressionadas
    );
    moverLutador(
      this.kenji,
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      this.tempoEsgotado,
      this.teclasPressionadas
    );

    atualizarTempoDeEspera(this.samuraiMack, 4);
    atualizarTempoDeEspera(this.kenji, 2);

    // Verifica se algum dos lutadores morreu
    this.samuraiMack.verificarMorte();
    this.kenji.verificarMorte();

    // Verifica se houve colisão entre os ataques dos lutadores
    verificarColisaoAtaque(this.samuraiMack, this.kenji, 4);
    verificarColisaoAtaque(this.kenji, this.samuraiMack, 2);

    this.abrirFecharModal();
    // Verifica se o tempo do jogo acabou
    if (this.tempoEsgotado) {
      // Reinicia as animações dos lutadores para a posição parada
      this.samuraiMack.trocarAtor("parado");
      this.kenji.trocarAtor("parado");
    }
  }

  reiniciarJogo() {
    // Reinicializa todas as variáveis e estados do jogo
    this.tempoEsgotado = false;
    this.vencedorVerificado = false;
    document.querySelector("#texto-de-exibicao").style.display = "none"; // Esconde o texto de exibição
    document.querySelector("#tempo").innerHTML = this.tempoLimiteDeJogo; // Reinicializa o cronômetro
    diminuirCronometro(
      this.tempoLimiteDeJogo,
      this.idDoCronometro,
      () => this.modalAberto,
      () => this.vencedorVerificado
    ); // Reinicia a contagem regressiva do cronômetro
    // Reinicializa o Samurai Mack
    this.samuraiMack = new Lutador({
      nome: "samuraiMack",
      posicao: { x: 231, y: 188 },
      largura: 58,
      velocidade: { x: 0, y: 0 },
      ajuste: { x: 0, y: 0 },
      imagemSrc: "./src/img/samuraiMack/parado.png",
      escala: 2.5,
      quadrosMaximos: 8,
      ajuste: { x: 215, y: 157 },
      atores: {
        parado: {
          imagemSrc: "./src/img/samuraiMack/parado.png",
          quadrosMaximos: 8,
        },
        correndo: {
          imagemSrc: "./src/img/samuraiMack/correndo.png",
          quadrosMaximos: 8,
        },
        pulando: {
          imagemSrc: "./src/img/samuraiMack/pulando.png",
          quadrosMaximos: 2,
        },
        caindo: {
          imagemSrc: "./src/img/samuraiMack/caindo.png",
          quadrosMaximos: 2,
        },
        ataque1: {
          imagemSrc: "./src/img/samuraiMack/ataque1.png",
          quadrosMaximos: 6,
        },
        levarGolpe: {
          imagemSrc: "./src/img/samuraiMack/levarGolpe.png",
          quadrosMaximos: 4,
        },
        morrer: {
          imagemSrc: "./src/img/samuraiMack/morrer.png",
          quadrosMaximos: 6,
        },
      },
      caixaDeAtaque: {
        ajuste: {
          x: 58,
          y: 50,
        },
        largura: 200,
        altura: 50,
      },
    });

    // Reinicializa o Kenji
    this.kenji = new Lutador({
      nome: "kenji",
      posicao: { x: 743, y: 188 },
      largura: 51,
      velocidade: { x: 0, y: 0 },
      ajuste: { x: -75, y: 0 },
      imagemSrc: "./src/img/kenji/parado.png",
      escala: 2.5,
      quadrosMaximos: 4,
      ajuste: { x: 215, y: 172 },
      atores: {
        parado: {
          imagemSrc: "./src/img/kenji/parado.png",
          quadrosMaximos: 4,
        },
        correndo: {
          imagemSrc: "./src/img/kenji/correndo.png",
          quadrosMaximos: 8,
        },
        pulando: {
          imagemSrc: "./src/img/kenji/pulando.png",
          quadrosMaximos: 2,
        },
        caindo: {
          imagemSrc: "./src/img/kenji/caindo.png",
          quadrosMaximos: 2,
        },
        ataque1: {
          imagemSrc: "./src/img/kenji/ataque1.png",
          quadrosMaximos: 4,
        },
        levarGolpe: {
          imagemSrc: "./src/img/kenji/levarGolpe.png",
          quadrosMaximos: 3,
        },
        morrer: {
          imagemSrc: "./src/img/kenji/morrer.png",
          quadrosMaximos: 7,
        },
      },
      caixaDeAtaque: {
        ajuste: {
          x: -174,
          y: 50,
        },
        largura: 174,
        altura: 50,
      },
    });
    gsap.to("#vida-samuraiMack", { width: "100%" });
    gsap.to("#recarga-samuraiMack", { width: "120px" });
    gsap.to("#vida-kenji", { width: "100%" });
    gsap.to("#recarga-kenji", { width: "120px" });
    cancelAnimationFrame(this.idDoJogo); // Para a animação do jogo
    this.idDoJogo = null; // Limpa o ID do quadro de animação
    this.iniciarJogo(); // Reinicia a animação do jogo
  }
}

// Instanciação da classe Jogo para iniciar o jogo
const jogo = new Jogo();
