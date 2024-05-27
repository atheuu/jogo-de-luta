// Definição da classe Ator
class Ator {
  // Construtor da classe Ator
  constructor({
    // Parâmetros do construtor:
    posicao, // Posição inicial do ator no jogo
    imagemSrc, // URL da imagem do ator
    escala = 1, // Fator de escala para dimensionar a imagem do ator (opcional, padrão: 1)
    quadrosMaximos = 1, // Número total de quadros na animação do ator (opcional, padrão: 1)
    ajuste = { x: 0, y: 0 }, // Ajuste de posição do ator na tela (opcional, padrão: { x: 0, y: 0 })
  }) {
    // Aceita um objeto com várias propriedades para inicializar o objeto
    this.posicao = posicao; // Posição do ator no jogo
    this.largura = 150; // Largura padrão do ator
    this.altura = 150; // Altura padrão do ator
    this.imagem = new Image(); // Cria uma nova instância de Image para armazenar a imagem do ator
    this.imagem.src = imagemSrc; // Define a URL da imagem do ator
    this.escala = escala; // Fator de escala para dimensionar a imagem do ator
    this.quadrosMaximos = quadrosMaximos; // Número total de quadros na animação do ator
    this.quadroAtual = 0; // Quadro atual da animação do ator
    this.quadrosDecorridos = 0; // Contador de quadros decorridos desde a última mudança de quadro
    this.retençãoDeQuadros = 5; // Número de quadros a serem desenhados antes de mudar para o próximo quadro
    this.ajuste = ajuste; // Ajuste de posição do ator
  }

  // Método para desenhar o lutador na tela, permitindo espelhar horizontalmente
  desenhar(contextoDesenho, espelhar) {
    // Salva o estado atual do contexto de desenho
    contextoDesenho.save();

    // Variável local para armazenar a posição x atual do lutador
    let posicaoAtual = this.posicao.x;

    // Se a opção de espelhar estiver ativada, inverte a escala horizontalmente
    if (espelhar) {
      contextoDesenho.scale(-1, 1);
      // Ajusta a posição X temporariamente para compensar a inversão
      posicaoAtual = -this.posicao.x - this.largura;
    }

    // Desenha a imagem do ator no contexto de desenho
    contextoDesenho.drawImage(
      this.imagem,
      this.quadroAtual * (this.imagem.width / this.quadrosMaximos),
      0,
      this.imagem.width / this.quadrosMaximos,
      this.imagem.height,
      posicaoAtual - this.ajuste.x,
      this.posicao.y - this.ajuste.y,
      (this.imagem.width / this.quadrosMaximos) * this.escala,
      this.imagem.height * this.escala
    );

    // Restaura o estado do contexto de desenho para evitar afetar outros desenhos
    contextoDesenho.restore();
  }

  // Método para animar os quadros do ator
  animarQuadros() {
    // Incrementa o contador de quadros decorridos
    this.quadrosDecorridos++;
    // Verifica se é hora de mudar para o próximo quadro da animação
    if (this.quadrosDecorridos % this.retençãoDeQuadros === 0) {
      // Se não estiver no último quadro da animação, avança para o próximo quadro
      if (this.quadroAtual < this.quadrosMaximos - 1) {
        this.quadroAtual++;
      } else {
        // Se estiver no último quadro, reinicia a animação do primeiro quadro
        this.quadroAtual = 0;
      }
    }
  }

  // Método para atualizar o estado do ator
  atualizar(contextoDesenho) {
    // Desenha o ator na tela
    this.desenhar(contextoDesenho);
    // Anima os qudros do ator
    this.animarQuadros();
  }
}

// Definição da classe Lutador, que herda de Ator
class Lutador extends Ator {
  // Construtor da classe Lutador
  constructor({
    nome, // Nome do lutador
    posicao, // Posição inicial do lutador no jogo
    largura, // Largura do lutador
    espelhar, // Indica se o lutador deve ou não espelhar
    velocidade, // Velocidade inicial do lutador
    imagemSrc, // URL da imagem do lutador
    escala = 1, // Fator de escala para dimensionar a imagem do lutador (opcional, padrão: 1)
    quadrosMaximos = 1, // Número total de quadros na animação do lutador (opcional, padrão: 1)
    ajuste = { x: 0, y: 0 }, // Ajuste de posição do lutador na tela (opcional, padrão: { x: 0, y: 0 })
    atores, // Conjunto de imagens para diferentes ações do lutador
    caixaDeAtaque = { ajuste: {}, largura: undefined, altura: undefined }, // Configurações da caixa de ataque do lutador
  }) {
    // Chama o construtor da classe pai (Ator) com os parâmetros necessários
    super({
      posicao, // Posição inicial do lutador
      imagemSrc, // URL da imagem do lutador
      escala, // Fator de escala para dimensionar a imagem do lutador
      quadrosMaximos, // Número total de quadros na animação do lutador
      ajuste, // Ajuste de posição do lutador na tela
    });
    this.nome = nome; // Nome do lutador
    this.velocidade = velocidade; // Velocidade do lutador
    this.vida = 100; // Vida do lutador
    this.altura = 150; // Altura do lutador
    this.largura = largura; // Largura do lutador
    this.espelhar = espelhar; // Indica a orientação do lutador.
    this.atacando = false; // Indica se o lutador está atacando
    this.tempoDeEspera = 120; // Define o tempo de cooldown em número de quadros
    this.morto = false; // Indica se o lutador está morto
    this.tempoUltimoAtaque = 0; // Timestamp do último ataque do lutador
    this.caixaDeAtaque = {
      posicao: { x: this.posicao.x, y: this.posicao.y },
      ajuste: caixaDeAtaque.ajuste,
      altura: caixaDeAtaque.altura,
      largura: caixaDeAtaque.largura,
    }; // Caixa de ataque do lutador
    this.caixaDeAtaqueEspelhada = {
      largura: caixaDeAtaque.largura,
      altura: caixaDeAtaque.altura,
      ajuste: {
        x: -caixaDeAtaque.ajuste.x - caixaDeAtaque.largura + this.largura,
        y: caixaDeAtaque.ajuste.y,
      },
    };
    this.quadroAtual = 0; // Quadro atual da animação do lutador
    this.quadrosDecorridos = 0; // Contador de quadros decorridos desde a última mudança de quadro
    this.retençãoDeQuadros = 7; // Número de quadros a serem desenhados antes de mudar para o próximo quadro
    this.atores = atores; // Conjunto de atores do lutador

    // Carrega as imagens dos atores do lutador
    for (const ator in this.atores) {
      atores[ator].imagem = new Image();
      atores[ator].imagem.src = atores[ator].imagemSrc;
    }
  }

  // Método para atualizar o estado do lutador
  atualizar(
    contextoDesenho,
    canvasElemento,
    alturaDoChao,
    gravidadeConstante,
    espelhar
  ) {
    this.desenhar(contextoDesenho, espelhar); // Desenha o lutador na tela
    if (!this.morto) this.animarQuadros(); // Se não estiver morto, anima os quadros do lutador
    this.posicao.y += this.velocidade.y; // Atualiza a posição Y do lutador
    this.posicao.x += this.velocidade.x; // Atualiza a posição X do lutador
    this.caixaDeAtaque.posicao.x = this.posicao.x + this.caixaDeAtaque.ajuste.x; // Atualiza a posição X da caixa de ataque
    this.caixaDeAtaque.posicao.y = this.posicao.y + this.caixaDeAtaque.ajuste.y; // Atualiza a posição Y da caixa de ataque
    this.limitarMovimento(canvasElemento, alturaDoChao, gravidadeConstante); // Limita o movimento do lutador dentro dos limites da tela
  }

  // Método para limitar o movimento do lutador dentro dos limites da tela
  limitarMovimento(canvasElemento, alturaDoChao, gravidadeConstante) {
    // Limita o movimento vertical do lutador para que não passe do chão
    if (this.posicao.y + this.altura > canvasElemento.height - alturaDoChao) {
      this.posicao.y = canvasElemento.height - this.altura - alturaDoChao;
      this.caixaDeAtaque.posicao.y =
        canvasElemento.height - this.altura - alturaDoChao;
      this.velocidade.y = 0; // Define a velocidade vertical como 0
    } else {
      this.velocidade.y += gravidadeConstante; // Aplica a gravidade ao lutador
    }

    // Limita o movimento horizontal do lutador dentro das bordas da tela
    if (this.posicao.x < 0) {
      this.posicao.x = 0;
    } else if (this.posicao.x + this.largura > canvasElemento.width) {
      this.posicao.x = canvasElemento.width - this.largura;
    }
  }

  // Método para verificar se o lutador pode pular
  podePular(canvasElemento, alturaDoChao) {
    return (
      this.posicao.y === canvasElemento.height - this.altura - alturaDoChao
    );
  }

  // Método para reduzir a vida do lutador quando ele recebe um golpe
  levarGolpe() {
    this.vida -= 15; // Reduz a vida do lutador
    this.trocarAtor("levarGolpe"); // Troca a animação do lutador para levar um golpe
    this.tempoDeEspera = 0;
  }

  // Método para fazer o lutador realizar um ataque
  atacar() {
    // Verifica se o cooldown está ativo
    if (this.tempoDeEspera === 120) {
      this.trocarAtor("ataque1"); // Troca a animação do lutador para realizar um ataque
      this.atacando = true; // Define que o lutador está atacando
    }
  }

  // Método para verificar se o lutador está morto
  verificarMorte() {
    if (this.vida <= 0) {
      this.trocarAtor("morrer"); // Troca a animação do lutador para morrer
    }
  }

  // Método para trocar a animação do lutador
  trocarAtor(ator) {
    // Verifica se o lutador já está morto e se a animação atual é a de morrer
    if (this.imagem === this.atores.morrer.imagem) {
      // Se estiver no último quadro da animação de morrer, define o lutador como morto
      if (this.quadroAtual === this.atores.morrer.quadrosMaximos - 1)
        this.morto = true;
      return;
    }

    // Verifica se há atores disponíveis para troca de animação
    if (this.atores) {
      // Evita a troca de animação se o lutador estiver atacando e não estiver no último quadro da animação de ataque
      if (
        this.imagem === this.atores.ataque1.imagem &&
        this.quadroAtual < this.atores.ataque1.quadrosMaximos - 1
      )
        return;

      // Evita a troca de animação se o lutador estiver levando um golpe e não estiver no último quadro da animação de levar golpe
      if (
        this.imagem === this.atores.levarGolpe.imagem &&
        this.quadroAtual < this.atores.levarGolpe.quadrosMaximos - 1
      )
        return;

      // Realiza a troca de animação de acordo com o parâmetro 'ator'
      switch (ator) {
        case "parado":
          if (this.imagem !== this.atores.parado.imagem) {
            this.imagem = this.atores.parado.imagem;
            this.quadrosMaximos = this.atores.parado.quadrosMaximos;
            this.quadroAtual = 0;
          }
          break;
        case "correndo":
          if (this.imagem !== this.atores.correndo.imagem) {
            this.imagem = this.atores.correndo.imagem;
            this.quadrosMaximos = this.atores.correndo.quadrosMaximos;
            this.quadroAtual = 0;
          }
          break;
        case "pulando":
          if (this.imagem !== this.atores.pulando.imagem) {
            this.imagem = this.atores.pulando.imagem;
            this.quadrosMaximos = this.atores.pulando.quadrosMaximos;
            this.quadroAtual = 0;
          }
          break;
        case "caindo":
          if (this.imagem !== this.atores.caindo.imagem) {
            this.imagem = this.atores.caindo.imagem;
            this.quadrosMaximos = this.atores.caindo.quadrosMaximos;
            this.quadroAtual = 0;
          }
          break;
        case "ataque1":
          if (this.imagem !== this.atores.ataque1.imagem) {
            this.imagem = this.atores.ataque1.imagem;
            this.quadrosMaximos = this.atores.ataque1.quadrosMaximos;
            this.quadroAtual = 0;
          }
          break;
        case "levarGolpe":
          if (this.imagem !== this.atores.levarGolpe.imagem) {
            this.imagem = this.atores.levarGolpe.imagem;
            this.quadrosMaximos = this.atores.levarGolpe.quadrosMaximos;
            this.quadroAtual = 0;
          }
          break;
        case "morrer":
          if (this.imagem !== this.atores.morrer.imagem) {
            this.imagem = this.atores.morrer.imagem;
            this.quadrosMaximos = this.atores.morrer.quadrosMaximos;
            this.quadroAtual = 0;
          }
          break;
      }
    }
  }
}
