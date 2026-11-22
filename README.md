# desafio_teste_domino

Dominó — partida para 2 jogadores — casos de teste em **JavaScript** para testar uma implementação em **JavaScript**, usando [Jest](https://jestjs.io/).

## Especificação do desafio

Testar uma **partida de Dominó** (jogo duplo-seis) para **2 jogadores**. Regras implementadas e testadas:

- O jogo tem **28 peças**, de 0-0 a 6-6, sem repetição.
- Cada jogador recebe **7 peças**, e as **14** restantes ficam no monte (o "dorme").
- **Quem começa:** quem tiver a maior bucha (6-6, depois 5-5 e assim por diante). Se ninguém tiver bucha, começa a peça de maior soma. A primeira jogada tem que ser essa peça.
- Cada peça precisa **encaixar** em uma das duas pontas da mesa (esquerda ou direita), e é virada automaticamente quando precisa.
- Quem não tem peça que encaixe **compra do monte**. Com o monte vazio, o jogador **passa** a vez. Não é permitido comprar ou passar tendo uma jogada possível.
- **Batida:** vence quem ficar sem peças.
- **Jogo trancado:** se ninguém consegue jogar e o monte está vazio, vence quem tiver menos pontos na mão. Com pontos iguais, a partida termina empatada.

## Estrutura do repositório

```
desafio_teste_domino/
├── src/
│   └── domino.js        # implementação do jogo (regras)
├── tests/
│   └── domino.test.js   # casos de teste (Jest)
├── package.json
└── README.md
```

## Como executar

Pré-requisito: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
npm install
npm test               # roda todos os casos de teste
npm run test:coverage  # roda os testes e mostra a cobertura
```

## Funcionamento dos casos de teste

Os testes ficam em `tests/domino.test.js`. Para controlar o jogo, as mãos e o monte podem ser passados fixos em `new PartidaDomino({ maos, monte })`. O cenário `cenarioBatida()` monta uma partida curta que passa por todas as ações (jogar nas duas pontas, comprar, passar e bater).

Há também cenários de jogo trancado, com vitória por pontos e com empate. Por fim, o caso CT33 joga **8 partidas aleatórias completas** (com sementes diferentes) e confere que todas terminam, que as 28 peças continuam existindo e que a mesa forma uma corrente válida.

Cada caso de teste tem um identificador (`CT01`, `CT02`, ...) no nome, para facilitar a conferência entre o relatório do Jest e a tabela abaixo. Os testes `test.each` são **parametrizados**: o mesmo caso roda com vários valores de entrada, por isso o Jest mostra **40 execuções** no total.

Para deixar os testes **determinísticos** (sempre com o mesmo resultado), a parte aleatória do jogo recebe um gerador de números com semente fixa (`rng`). Assim os cenários podem ser montados com cartas, peças ou posições escolhidas, sem depender da sorte.

| Caso | Grupo | O que verifica |
|---|---|---|
| CT01 | Peças | Jogo duplo-seis tem 28 peças |
| CT02 | Peças | Não existem peças repetidas (3-5 é a mesma peça que 5-3) |
| CT03 | Peças | Existem 7 buchas (0-0 a 6-6) |
| CT04 | Peças | Soma de pontos de todas as peças é 168 |
| CT05 | Peças | Embaralhar mantém as 28 peças |
| CT06 | Distribuição | Cada jogador recebe 7 peças e 14 ficam no monte |
| CT07 | Distribuição | Nenhuma peça aparece em dois lugares |
| CT08 | Distribuição | Partida só aceita 2 jogadores |
| CT09 | Distribuição | Peça repetida na distribuição é rejeitada |
| CT10 | Distribuição | Peça com número fora de 0..6 é rejeitada |
| CT11 | Quem começa | Quem tem 6-6 começa |
| CT12 | Quem começa | Sem 6-6, começa a maior bucha |
| CT13 | Quem começa | Sem nenhuma bucha, começa a peça de maior soma |
| CT14 | Quem começa | Primeira jogada precisa ser a peça de saída |
| CT15 | Quem começa | Jogador que não começa não pode jogar primeiro |
| CT16 | Jogadas | Após a saída, as pontas são os números da peça |
| CT17 | Jogadas | Peça encaixa na ponta direita |
| CT18 | Jogadas | Peça é virada automaticamente para encaixar na esquerda |
| CT19 | Jogadas | Peça que não encaixa é rejeitada |
| CT20 | Jogadas | Lado inválido é rejeitado |
| CT21 | Jogadas | Peça jogada sai da mão |
| CT22 | Jogadas | Índice de peça inexistente lança erro |
| CT23 | Comprar e passar | Não pode comprar se tiver peça para jogar |
| CT24 | Comprar e passar | Sem jogada, compra do monte |
| CT25 | Comprar e passar | Não pode passar enquanto houver peças no monte |
| CT26 | Comprar e passar | Com monte vazio e sem jogada, o jogador passa a vez |
| CT27 | Comprar e passar | Não pode passar tendo peça que encaixa |
| CT28 | Comprar e passar | Comprar com monte vazio lança erro |
| CT29 | Fim de partida | Quem fica sem peças "bate" e vence |
| CT30 | Fim de partida | Jogo trancado: vence quem tem menos pontos na mão |
| CT31 | Fim de partida | Jogo trancado com pontos iguais termina empatado |
| CT32 | Fim de partida | Nenhuma ação é permitida depois do fim |
| CT33 | Fim de partida | Partida aleatória (semente N) sempre termina e preserva as 28 peças *(parametrizado: roda com vários valores)* |

## Colaboradora

| Nome | Curso | Contribuição |
|---|---|---|
| Emanuelly | Engenharia de Software — UniCesumar (6º semestre) | Implementação, casos de teste e documentação |
