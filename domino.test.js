'use strict';

const {
  criarPecas,
  embaralhar,
  ehBucha,
  pontosDaMao,
  quemComeca,
  PartidaDomino,
} = require('../src/domino');

function rngComSemente(semente) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Cenário com batida: jogador 0 começa com 6-6 e termina batendo.
const cenarioBatida = () =>
  new PartidaDomino({
    maos: [
      [[6, 6], [6, 2], [3, 4]],
      [[6, 5], [5, 5], [1, 1]],
    ],
    monte: [[0, 1], [2, 3]], // o último da lista é o primeiro a ser comprado
  });

describe('Peças', () => {
  test('CT01 - jogo duplo-seis tem 28 peças', () => {
    expect(criarPecas()).toHaveLength(28);
  });

  test('CT02 - não existem peças repetidas (3-5 é a mesma peça que 5-3)', () => {
    const chaves = criarPecas().map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`);
    expect(new Set(chaves).size).toBe(28);
  });

  test('CT03 - existem 7 buchas (0-0 a 6-6)', () => {
    expect(criarPecas().filter(ehBucha)).toHaveLength(7);
  });

  test('CT04 - soma de pontos de todas as peças é 168', () => {
    expect(pontosDaMao(criarPecas())).toBe(168);
  });

  test('CT05 - embaralhar mantém as 28 peças', () => {
    const e = embaralhar(criarPecas(), rngComSemente(5));
    expect(e).toHaveLength(28);
    expect(new Set(e.map((p) => p.join('-'))).size).toBe(28);
  });
});

describe('Distribuição', () => {
  test('CT06 - cada jogador recebe 7 peças e 14 ficam no monte', () => {
    const p = new PartidaDomino({ rng: rngComSemente(10) });
    expect(p.maos[0]).toHaveLength(7);
    expect(p.maos[1]).toHaveLength(7);
    expect(p.monte).toHaveLength(14);
  });

  test('CT07 - nenhuma peça aparece em dois lugares', () => {
    const p = new PartidaDomino({ rng: rngComSemente(11) });
    const todas = [...p.maos[0], ...p.maos[1], ...p.monte].map((x) => x.join('-'));
    expect(new Set(todas).size).toBe(28);
  });

  test('CT08 - partida só aceita 2 jogadores', () => {
    expect(() => new PartidaDomino({ maos: [[[0, 0]], [[1, 1]], [[2, 2]]] })).toThrow('exatamente 2 jogadores');
  });

  test('CT09 - peça repetida na distribuição é rejeitada', () => {
    expect(() => new PartidaDomino({ maos: [[[1, 2]], [[2, 1]]] })).toThrow('Peça repetida');
  });

  test('CT10 - peça com número fora de 0..6 é rejeitada', () => {
    expect(() => new PartidaDomino({ maos: [[[7, 1]], [[0, 0]]] })).toThrow('Peça inválida');
  });
});

describe('Quem começa', () => {
  test('CT11 - quem tem 6-6 começa', () => {
    expect(quemComeca([[[1, 2]], [[6, 6]]])).toEqual({ jogador: 1, peca: [6, 6] });
  });

  test('CT12 - sem 6-6, começa a maior bucha', () => {
    expect(quemComeca([[[2, 2], [6, 5]], [[4, 4]]])).toEqual({ jogador: 1, peca: [4, 4] });
  });

  test('CT13 - sem nenhuma bucha, começa a peça de maior soma', () => {
    expect(quemComeca([[[6, 4], [0, 1]], [[6, 5], [2, 3]]])).toEqual({ jogador: 1, peca: [6, 5] });
  });

  test('CT14 - primeira jogada precisa ser a peça de saída', () => {
    const p = cenarioBatida();
    expect(p.vez).toBe(0);
    expect(() => p.jogar(0, 1)).toThrow('primeira peça deve ser 6-6');
  });

  test('CT15 - jogador que não começa não pode jogar primeiro', () => {
    const p = cenarioBatida();
    expect(() => p.jogar(1, 0)).toThrow('Não é a vez do jogador 1');
  });
});

describe('Jogadas', () => {
  test('CT16 - após a saída, as pontas são os números da peça', () => {
    const p = cenarioBatida();
    expect(p.jogar(0, 0)).toEqual([6, 6]);
    expect(p.vez).toBe(1);
  });

  test('CT17 - peça encaixa na ponta direita', () => {
    const p = cenarioBatida();
    p.jogar(0, 0);
    expect(p.jogar(1, 0, 'direita')).toEqual([6, 5]);
  });

  test('CT18 - peça é virada automaticamente para encaixar na esquerda', () => {
    const p = cenarioBatida();
    p.jogar(0, 0);
    p.jogar(1, 0, 'direita'); // 6-5
    expect(p.jogar(0, 0, 'esquerda')).toEqual([2, 5]); // 6-2 vira 2-6
    expect(p.mesa).toEqual([[2, 6], [6, 6], [6, 5]]);
  });

  test('CT19 - peça que não encaixa é rejeitada', () => {
    const p = cenarioBatida();
    p.jogar(0, 0);
    expect(() => p.jogar(1, 2, 'direita')).toThrow('não encaixa'); // 1-1 em ponta 6
  });

  test('CT20 - lado inválido é rejeitado', () => {
    const p = cenarioBatida();
    p.jogar(0, 0);
    expect(() => p.jogar(1, 0, 'meio')).toThrow('Lado inválido');
  });

  test('CT21 - peça jogada sai da mão', () => {
    const p = cenarioBatida();
    p.jogar(0, 0);
    expect(p.maos[0]).toHaveLength(2);
  });

  test('CT22 - índice de peça inexistente lança erro', () => {
    const p = cenarioBatida();
    expect(() => p.jogar(0, 9)).toThrow('Peça inexistente');
  });
});

describe('Comprar e passar', () => {
  test('CT23 - não pode comprar se tiver peça para jogar', () => {
    const p = cenarioBatida();
    p.jogar(0, 0);
    expect(() => p.comprar(1)).toThrow('não pode comprar');
  });

  test('CT24 - sem jogada, compra do monte', () => {
    const p = cenarioBatida();
    p.jogar(0, 0); // 6-6
    p.jogar(1, 0, 'direita'); // 6-5
    p.jogar(0, 0, 'esquerda'); // 2-6  → pontas 2 e 5
    p.jogar(1, 0, 'direita'); // 5-5
    // jogador 0 tem só 3-4: precisa comprar
    expect(p.podeJogar(0)).toBe(false);
    expect(p.comprar(0)).toEqual([2, 3]);
    expect(p.monte).toHaveLength(1);
    expect(p.podeJogar(0)).toBe(true);
  });

  test('CT25 - não pode passar enquanto houver peças no monte', () => {
    const p = new PartidaDomino({ maos: [[[6, 6], [0, 1]], [[2, 3], [4, 4]]], monte: [[1, 2]] });
    p.jogar(0, 0);
    expect(() => p.passar(1)).toThrow('deve comprar');
  });

  test('CT26 - com monte vazio e sem jogada, o jogador passa a vez', () => {
    const p = new PartidaDomino({ maos: [[[6, 6], [6, 1]], [[2, 3], [4, 4]]] });
    p.jogar(0, 0);
    p.passar(1);
    expect(p.vez).toBe(0);
  });

  test('CT27 - não pode passar tendo peça que encaixa', () => {
    const p = cenarioBatida();
    p.jogar(0, 0);
    expect(() => p.passar(1)).toThrow('não pode passar');
  });

  test('CT28 - comprar com monte vazio lança erro', () => {
    const p = new PartidaDomino({ maos: [[[6, 6], [6, 1]], [[2, 3], [4, 4]]] });
    p.jogar(0, 0);
    expect(() => p.comprar(1)).toThrow('monte está vazio');
  });
});

describe('Fim de partida', () => {
  test('CT29 - quem fica sem peças "bate" e vence', () => {
    const p = cenarioBatida();
    p.jogar(0, 0); // 6-6
    p.jogar(1, 0, 'direita'); // 6-5
    p.jogar(0, 0, 'esquerda'); // 2-6
    p.jogar(1, 0, 'direita'); // 5-5
    p.comprar(0); // 2-3
    p.jogar(0, 1, 'esquerda'); // 3-2 → pontas 3 e 5
    p.comprar(1); // 0-1 (não encaixa)
    p.passar(1);
    p.jogar(0, 0, 'esquerda'); // 4-3 → mão vazia
    expect(p.vencedor).toBe(0);
    expect(p.motivoFim).toBe('batida');
  });

  test('CT30 - jogo trancado: vence quem tem menos pontos na mão', () => {
    const p = new PartidaDomino({ maos: [[[6, 6], [0, 1]], [[2, 3], [4, 4]]] });
    p.jogar(0, 0);
    p.passar(1);
    p.passar(0);
    expect(p.motivoFim).toBe('trancado');
    expect(p.vencedor).toBe(0); // 1 ponto contra 13
  });

  test('CT31 - jogo trancado com pontos iguais termina empatado', () => {
    const p = new PartidaDomino({ maos: [[[6, 6], [0, 4]], [[1, 3]]] });
    p.jogar(0, 0);
    p.passar(1);
    p.passar(0);
    expect(p.vencedor).toBe('empate');
  });

  test('CT32 - nenhuma ação é permitida depois do fim', () => {
    const p = new PartidaDomino({ maos: [[[6, 6]], [[1, 3]]] });
    p.jogar(0, 0);
    expect(p.vencedor).toBe(0);
    expect(() => p.jogar(1, 0)).toThrow('já terminou');
  });

  test.each([1, 2, 3, 4, 5, 6, 7, 8])('CT33 - partida aleatória (semente %i) sempre termina e preserva as 28 peças', (semente) => {
    const p = new PartidaDomino({ rng: rngComSemente(semente) });
    let jogadas = 0;
    while (p.vencedor === null && jogadas < 500) {
      const j = p.vez;
      const idx = p.maos[j].findIndex((x) => p.encaixa(x));
      if (idx >= 0) {
        const peca = p.maos[j][idx];
        const lado = p.mesa.length && !peca.includes(p.pontas[1]) ? 'esquerda' : 'direita';
        p.jogar(j, idx, lado);
      } else if (p.monte.length) {
        p.comprar(j);
      } else {
        p.passar(j);
      }
      jogadas++;
    }
    expect(p.vencedor).not.toBeNull();
    expect(p.mesa.length + p.maos[0].length + p.maos[1].length + p.monte.length).toBe(28);
    // a mesa forma uma corrente válida
    for (let i = 1; i < p.mesa.length; i++) expect(p.mesa[i][0]).toBe(p.mesa[i - 1][1]);
  });
});
