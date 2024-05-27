// Função para verificar colisão entre duas caixas
function verificarColisao(caixa1, caixa2, espelhado1, espelhado2) {
  // Declara as variáveis fora do escopo do if
  let caixa1X;
  let caixa2X;

  // Calcula as coordenadas das caixas de ataque levando em conta se estão espelhadas
  if (caixa2.nome === "kenji") {
    caixa1X = espelhado1
      ? caixa1.posicao.x - caixa1.largura - caixa2.largura
      : caixa1.posicao.x;
    caixa2X = espelhado2
      ? caixa2.posicao.x - caixa2.largura - caixa2.largura
      : caixa2.posicao.x;
  } else {
    caixa1X = espelhado1
      ? caixa1.posicao.x + caixa1.largura + caixa2.largura
      : caixa1.posicao.x;
    caixa2X = espelhado2
      ? caixa2.posicao.x - caixa2.largura - caixa2.largura
      : caixa2.posicao.x;
  }

  // Verifica a colisão entre as caixas
  return (
    caixa1X + caixa1.largura > caixa2X &&
    caixa1X < caixa2X + caixa2.largura &&
    caixa1.posicao.y + caixa1.altura > caixa2.posicao.y &&
    caixa1.posicao.y < caixa2.posicao.y + caixa2.altura
  );
}


// Função para verificar colisão de ataque entre atacante e defensor
function verificarColisaoAtaque(atacante, defensor, quadroAtaque) {
  // Verifica se houve colisão entre a caixa de ataque do atacante e o defensor,
  // e se o atacante está atacando no quadro de ataque correto
  if (
    verificarColisao(
      atacante.caixaDeAtaque,
      defensor,
      atacante.espelhar,
      false // Defensor não está espelhado
    ) &&
    atacante.atacando &&
    atacante.quadroAtual === quadroAtaque
  ) {
    // Se houve colisão e o atacante está atacando, o defensor recebe um golpe
    atacante.atacando = false; // Marca o atacante como não atacando mais
    defensor.levarGolpe(); // Reduz a vida do defensor
    // Anima a barra de vida do defensor
    gsap.to(`#vida-${defensor.nome.toString()}`, {
      width: defensor.vida + "%",
    });
  }
  // Verifica se o atacante ainda está atacando e se está no quadro de ataque correto
  if (atacante.atacando && atacante.quadroAtual === quadroAtaque) {
    atacante.atacando = false; // Marca o atacante como não atacando mais
  }
  // Verifica se algum dos lutadores morreu para determinar o vencedor
  if (atacante.vida <= 0 || defensor.vida <= 0) {
    if (!jogo.vencedorVerificado) {
      // Verifica se o vencedor já foi verificado
      verificarVencedor(jogo.samuraiMack, jogo.kenji, jogo.idDoCronometro); // Verifica e exibe o vencedor do jogo
      jogo.vencedorVerificado = true; // Define a variável para true para indicar que o vencedor foi verificado
    }
  }
}

// Função para mover o lutador de acordo com as teclas pressionadas
function moverLutador(
  lutador,
  esquerda,
  direita,
  cima,
  ataque,
  tempoEsgotado,
  teclasPressionadas
) {
  // Define a velocidade inicial do lutador como zero
  lutador.velocidade.x = 0;
  // Se o tempo estiver esgotado, retorna sem fazer nada
  if (tempoEsgotado) {
    return;
  }
  // Verifica se o lutador está vivo antes de permitir movimento
  if (!lutador.morto) {
    // Lógica de movimento do lutador de acordo com as teclas pressionadas
    if (teclasPressionadas[esquerda]) {
      lutador.velocidade.x -= 7; // Move o lutador para a esquerda
      lutador.trocarAtor("correndo"); // Troca a animação para correndo
      if (lutador.nome === "samuraiMack") {
        jogo.samuraiMack.espelhar = true;
      } else {
        jogo.kenji.espelhar = false;
      }
    } else if (teclasPressionadas[direita]) {
      lutador.velocidade.x += 7; // Move o lutador para a direita
      lutador.trocarAtor("correndo"); // Troca a animação para correndo
      if (lutador.nome === "samuraiMack") {
        jogo.samuraiMack.espelhar = false;
      } else {
        jogo.kenji.espelhar = true;
      }
    } else {
      lutador.trocarAtor("parado"); // Troca a animação para parado se nenhuma tecla de movimento estiver sendo pressionada
    }
    // Lógica para permitir que o lutador pule se a tecla de cima estiver pressionada
    if (
      teclasPressionadas[cima] &&
      lutador.podePular(jogo.canvasElemento, jogo.alturaDoChao)
    ) {
      lutador.velocidade.y -= 18; // Aplica uma velocidade vertical negativa para simular um pulo
    }
    // Troca a animação do lutador para pulando ou caindo dependendo da direção vertical
    if (lutador.velocidade.y < 0) {
      lutador.trocarAtor("pulando"); // Troca a animação para pulando se o lutador estiver subindo
    } else if (lutador.velocidade.y > 0.7) {
      lutador.trocarAtor("caindo"); // Troca a animação para caindo se o lutador estiver descendo
    }
    // Lógica para permitir que o lutador ataque se a tecla de ataque estiver pressionada
    if (teclasPressionadas[ataque]) {
      lutador.atacar(); // Executa a animação de ataque do lutador
    }
  }
}

function atualizarTempoDeEspera(lutador, quadroAtaque) {
  // Verifica se o lutador está atacando e se está no quadro de ataque correto
  if (lutador.atacando && lutador.quadroAtual === quadroAtaque) {
    // Atualiza o cooldown apenas se o tempoDeEspera for maior que 0
    if (lutador.tempoDeEspera > 0) {
      lutador.tempoDeEspera = 0;
      document.querySelector(
        "#recarga-" + lutador.nome.toString()
      ).style.width = lutador.tempoDeEspera + "px";
    }
  } else {
    // Caso contrário, continua a incrementar o tempo de espera normalmente
    if (lutador.tempoDeEspera < 120) {
      lutador.tempoDeEspera++;
      document.querySelector(
        "#recarga-" + lutador.nome.toString()
      ).style.width = lutador.tempoDeEspera + "px";
    }
  }
}

function atualizarCaixaDeAtaque(lutador, contextoDesenho) {
  let caixaDeAtaque = lutador.caixaDeAtaque;

  // Verifica se o lutador está espelhado e ajusta a posição da caixa de ataque
  if (lutador.espelhar) {
    caixaDeAtaque = lutador.caixaDeAtaqueEspelhada;
  }

  // // Desenha a caixa de ataque no canvas
  // contextoDesenho.fillStyle = "rgba(255, 0, 0, 0.5)"; // Cor de preenchimento temporária
  // contextoDesenho.fillRect(
  //   lutador.posicao.x + caixaDeAtaque.ajuste.x,
  //   lutador.posicao.y + caixaDeAtaque.ajuste.y,
  //   caixaDeAtaque.largura,
  //   caixaDeAtaque.altura
  // );
}

// Função para verificar o vencedor do jogo
function verificarVencedor(samuraiMack, kenji, idDoCronometro) {
  // Limpa o cronômetro quando o tempo acaba
  clearTimeout(idDoCronometro);
  // Exibe o texto de exibição
  document.querySelector("#texto-de-exibicao").style.display = "flex";
  // Determina o vencedor com base nas vidas dos lutadores
  if (samuraiMack.vida === kenji.vida) {
    document.querySelector("#texto-de-exibicao").innerHTML =
      "<strong>Empate!</strong>";
  } else if (samuraiMack.vida > kenji.vida) {
    document.querySelector("#texto-de-exibicao").innerHTML =
      "<strong>Samurai Mack Venceu!</strong>";
  } else if (samuraiMack.vida < kenji.vida) {
    document.querySelector("#texto-de-exibicao").innerHTML =
      "<strong>Kenji Venceu!</strong>";
  }
}

// Função para diminuir o cronômetro do jogo
function diminuirCronometro(
  tempoLimiteDeJogo,
  idDoCronometro,
  callback,
  vencedorCallback
) {
  // Verifica se o modal está aberto chamando a função de callback
  let modalAberto = false;
  if (callback && typeof callback === "function") {
    modalAberto = callback();
  }

  // Verifica se o modal está aberto
  if (modalAberto) {
    // Se o modal estiver aberto, não diminua o cronômetro e agende a próxima verificação após 1 segundo
    setTimeout(
      () =>
        diminuirCronometro(
          tempoLimiteDeJogo,
          idDoCronometro,
          callback,
          vencedorCallback
        ),
      1000
    );
    return;
  }

  let vencedorVerificado = false;
  if (vencedorCallback && typeof vencedorCallback === "function") {
    vencedorVerificado = vencedorCallback();
  }
  // Verifica se ainda há tempo de jogo e se nenhum dos lutadores está morto
  if (tempoLimiteDeJogo >= 0 && !vencedorVerificado) {
    // Atualiza o cronômetro a cada segundo
    idDoCronometro = setTimeout(
      () =>
        diminuirCronometro(
          tempoLimiteDeJogo - 1,
          idDoCronometro,
          callback,
          vencedorCallback
        ),
      1000
    );
    document.querySelector("#cronometro").innerHTML = tempoLimiteDeJogo;
  } else {
    // Se o tempo acabou ou se um lutador morreu, exibe o vencedor
    verificarVencedor(jogo.samuraiMack, jogo.kenji, jogo.idDoCronometro);
    jogo.tempoEsgotado = true;
  }
}
