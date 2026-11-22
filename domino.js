'use strict';

/**
 * Dominó (duplo-seis) — partida para 2 jogadores.
 *
 * Regras implementadas:
 *  - 28 peças (0-0 até 6-6); cada jogador recebe 7 e as 14 restantes ficam no monte ("dorme").
 *  - Começa quem tiver a maior bucha (6-6, depois 5-5...). Se ninguém tiver bucha,
 *    começa quem tiver a peça de maior soma. A primeira jogada é obrigatoriamente essa peça.
 *  - Cada peça deve encaixar em uma das duas pontas da mesa.
 *  - Quem não tem peça que encaixe compra do monte até conseguir jogar.
 *    Com o monte vazio, o jogador passa a vez.
 *  - Vence quem "bater" (ficar sem peças).
 *  - Se o jogo trancar (ninguém consegue jogar e o monte está vazio), vence quem
 *    tiver menos pontos na mão; pontos iguais = empate.
 */

const PECAS_POR_JOGADOR = 7;

function criarPecas() {
  const pecas = [];
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) pecas.push([a, b]);
  }
  return pecas;
}

function embaralhar(lista, rng = Math.random) {
  const copia = lista.map((p) => [...p]);
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const ehBucha = (p) => p[0] === p[1];
const pontos = (p) => p[0] + p[1];
const pontosDaMao = (mao) => mao.reduce((s, p) => s + pontos(p), 0);
const mesmaPeca = (a, b) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);

function validarPeca(p) {
  if (!Array.isArray(p) || p.length !== 2 || !p.every((n) => Number.isInteger(n) && n >= 0 && n <= 6)) {
    throw new Error('Peça inválida');
  }
}

/**
 * Define quem começa e com qual peça.
 * @returns {{jogador:number, peca:number[]}}
 */
function quemComeca(maos) {
  for (let n = 6; n >= 0; n--) {
    for (let j = 0; j < maos.length; j++) {
      if (maos[j].some((p) => p[0] === n && p[1] === n)) return { jogador: j, peca: [n, n] };
    }
  }
  let melhor = null;
  maos.forEach((mao, j) => {
    for (const p of mao) {
      const maior = Math.max(...p);
      if (
        !melhor ||
        pontos(p) > pontos(melhor.peca) ||
        (pontos(p) === pontos(melhor.peca) && maior > Math.max(...melhor.peca))
      ) {
        melhor = { jogador: j, peca: [...p] };
      }
    }
  });
  return melhor;
}

class PartidaDomino {
  /**
   * @param {object} [opcoes]
   * @param {Function} [opcoes.rng]
   * @param {number[][][]} [opcoes.maos]  mãos fixas (2 jogadores) — para testes
   * @param {number[][]} [opcoes.monte]   monte fixo — para testes
   */
  constructor({ rng = Math.random, maos, monte } = {}) {
    if (maos) {
      if (maos.length !== 2) throw new Error('A partida é para exatamente 2 jogadores');
      const todas = [...maos.flat(), ...(monte || [])];
      todas.forEach(validarPeca);
      for (let i = 0; i < todas.length; i++) {
        for (let k = i + 1; k < todas.length; k++) {
          if (mesmaPeca(todas[i], todas[k])) throw new Error('Peça repetida na distribuição');
        }
      }
      this.maos = maos.map((m) => m.map((p) => [...p]));
      this.monte = (monte || []).map((p) => [...p]);
    } else {
      const pecas = embaralhar(criarPecas(), rng);
      this.maos = [pecas.slice(0, 7), pecas.slice(7, 14)];
      this.monte = pecas.slice(14);
    }

    this.mesa = []; // sequência de peças já orientadas: [[a,b],[b,c],...]
    this.vencedor = null; // 0, 1 ou 'empate'
    this.motivoFim = null; // 'batida' | 'trancado'
    this.passesSeguidos = 0;

    const inicio = quemComeca(this.maos);
    this.vez = inicio.jogador;
    this.pecaInicial = inicio.peca;
  }

  get pontas() {
    if (this.mesa.length === 0) return null;
    return [this.mesa[0][0], this.mesa[this.mesa.length - 1][1]];
  }

  encaixa(peca) {
    if (this.mesa.length === 0) return mesmaPeca(peca, this.pecaInicial);
    const [e, d] = this.pontas;
    return peca.includes(e) || peca.includes(d);
  }

  podeJogar(jogador) {
    return this.maos[jogador].some((p) => this.encaixa(p));
  }

  /**
   * Joga a peça de índice `indice` da mão do jogador na ponta 'esquerda' ou 'direita'.
   * Na primeira jogada o lado é ignorado.
   */
  jogar(jogador, indice, lado = 'direita') {
    this._validarVez(jogador);
    const mao = this.maos[jogador];
    if (!Number.isInteger(indice) || indice < 0 || indice >= mao.length) {
      throw new Error('Peça inexistente na mão do jogador');
    }
    const peca = mao[indice];

    if (this.mesa.length === 0) {
      if (!mesmaPeca(peca, this.pecaInicial)) {
        throw new Error(`A primeira peça deve ser ${this.pecaInicial[0]}-${this.pecaInicial[1]}`);
      }
      this.mesa.push([...peca]);
    } else {
      if (lado !== 'esquerda' && lado !== 'direita') throw new Error('Lado inválido: use esquerda ou direita');
      const [e, d] = this.pontas;
      if (lado === 'esquerda') {
        if (peca[1] === e) this.mesa.unshift([peca[0], peca[1]]);
        else if (peca[0] === e) this.mesa.unshift([peca[1], peca[0]]);
        else throw new Error('A peça não encaixa na ponta esquerda');
      } else {
        if (peca[0] === d) this.mesa.push([peca[0], peca[1]]);
        else if (peca[1] === d) this.mesa.push([peca[1], peca[0]]);
        else throw new Error('A peça não encaixa na ponta direita');
      }
    }

    mao.splice(indice, 1);
    this.passesSeguidos = 0;

    if (mao.length === 0) {
      this.vencedor = jogador;
      this.motivoFim = 'batida';
    } else {
      this.vez = 1 - jogador;
    }
    return this.pontas;
  }

  /** Compra uma peça do monte. Só é permitido quando o jogador não tem jogada. */
  comprar(jogador) {
    this._validarVez(jogador);
    if (this.podeJogar(jogador)) throw new Error('O jogador tem peça para jogar e não pode comprar');
    if (this.monte.length === 0) throw new Error('O monte está vazio');
    const peca = this.monte.pop();
    this.maos[jogador].push(peca);
    return peca;
  }

  /** Passa a vez. Só é permitido sem jogada possível e com o monte vazio. */
  passar(jogador) {
    this._validarVez(jogador);
    if (this.podeJogar(jogador)) throw new Error('O jogador tem peça para jogar e não pode passar');
    if (this.monte.length > 0) throw new Error('Ainda há peças no monte: o jogador deve comprar');
    this.passesSeguidos++;
    if (this.passesSeguidos >= 2) {
      this._encerrarTrancado();
    } else {
      this.vez = 1 - jogador;
    }
  }

  _encerrarTrancado() {
    const [p0, p1] = this.maos.map(pontosDaMao);
    this.motivoFim = 'trancado';
    this.vencedor = p0 < p1 ? 0 : p1 < p0 ? 1 : 'empate';
  }

  _validarVez(jogador) {
    if (jogador !== 0 && jogador !== 1) throw new Error('Jogador inválido: use 0 ou 1');
    if (this.vencedor !== null) throw new Error('A partida já terminou');
    if (jogador !== this.vez) throw new Error(`Não é a vez do jogador ${jogador}`);
  }
}

module.exports = {
  PECAS_POR_JOGADOR,
  criarPecas,
  embaralhar,
  ehBucha,
  pontos,
  pontosDaMao,
  quemComeca,
  PartidaDomino,
};
