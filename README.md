# 🐑 O Bom Pastor: Corrida das Ovelhinhas 3D 🌈

Jogo web educativo e cristão estilo **Endless Runner 3D de 1 Botão**, inspirado na energia vibrante de *Mario Kart*, *Minion Rush* e *Super Mario 3D World*, projetado especialmente para crianças pequenas e bebês em fase de introdução aos jogos eletrônicos, jogando **principalmente no celular**.

---

## 🎯 Conceito e Pilares

1. **Gráficos 100% 3D com Iluminação e Sombras Suaves:**
   - Todo o mundo, o pastorzinho, as ovelhas, as estrelas e a pista são **modelos 3D com iluminação solar e sombras em tempo real** (`Three.js` + `PCFSoftShadowMap`).
   - Cores cartoon quentes e vibrantes com estética amigável para crianças.

2. **Sistema de 3 Pistas e Câmera Elevada (Visão Clara dos Obstáculos):**
   - A pista conta com **3 faixas bem sinalizadas** (Esquerda, Centro e Direita) com linhas tracejadas nítidas.
   - Câmera elevada panorâmica que permite visualizar pedras, arbustos e ovelhas a dezenas de metros de distância.
   - **Controle Intuitivo de Deslizar:** A criança arrasta o dedinho para a esquerda ou direita para mudar de pista (ou simplesmente toca no lado esquerdo/direito da tela).
   - As ovelhinhas e estrelas ficam no nível do chão, facilitando o resgate sem depender de pulos difíceis.

3. **Rodadas de 1 Minuto (Sem Limite de Ovelhas):**
   - Cada rodada tem **1 minuto (60 segundos)** de corrida contínua com cronômetro animado no topo (`⏱️ 01:00`).
   - A criança pode resgatar quantas ovelhas conseguir (10, 20, 30+ ovelhas!).
   - Ao final do tempo, acontece uma grande festa de comemoração com chuva de confetes e a soma de todas as ovelhinhas e estrelas resgatadas.

4. **Filosofia "Zero Frustração":**
   - **SEM GAME OVER:** Encostar em uma pedrinha, arbusto ou poça dá apenas um pulinho engraçado de mola, pisca por 1 segundo e continua correndo sem interromper a partida.
   - Pulo disponível ao tocar no centro da pista ou espaço no teclado.

5. **Elementos Dinâmicos Estilo Mario Kart:**
   - **Largada:** Contagem *"3... 2... 1... JÁ!"* com bipes sintetizados e animação de mola.
   - **Rampas de Turbo Arco-Íris 3D:** Dão um super impulso de velocidade por 2,5 segundos, com rastro de arco-íris, confetes e som acelerado.
   - **Caixas Surpresa (?) 3D:** Ao pular nelas, soltam uma chuva de estrelas douradas e confetes.

---

## 🛠️ Stack Tecnológica

- **Three.js (`three`):** Motor 3D WebGL com sombras em tempo real, materiais estilizados cartoon, renderização a 60 FPS no celular e transições suaves de câmera.
- **Vite + TypeScript:** Ambiente rápido, modular e tipado.
- **Motion (`motion`):** Animações fluidas com física de mola no botão de Play, contagem regressiva, pop-up gigante dos números e tela de vitória.
- **Tone.js (`tone`):** Síntese procedural de efeitos sonoros em tempo real (bipes de largada, som de mola "boing", escala musical pentatônica crescente C5-C7 a cada ovelhinha, whoosh de turbo e fanfarra de vitória).
- **Howler.js (`howler`):** Gerenciador de áudio pronto para reproduzir arquivos MP3 reais da voz dos pais/professores gravados na pasta `public/audio/`.
- **Canvas Confetti (`canvas-confetti`):** Efeitos de confetes e estrelas nas caixas surpresa, rampas e tela de vitória.
- **Vite PWA (`vite-plugin-pwa`):** Configuração de manifesto e service worker para instalar na tela inicial do celular em tela cheia (`display: fullscreen`).

---

## 📱 Como Jogar no Celular via Wi-Fi Local

1. No computador onde o projeto está rodando, inicie o servidor:
   ```bash
   npm run dev -- --host
   ```
2. O terminal exibirá o endereço de rede local, por exemplo:
   ```text
   ➜  Network: http://192.168.3.17:5173/
   ```
3. No celular (conectado na mesma rede Wi-Fi que o computador), abra o navegador (Chrome ou Safari) e digite o endereço exibido.
4. **Instalar como Aplicativo (Tela Cheia):**
   - **No Android (Chrome):** Toque no menu de 3 pontinhos no canto superior e selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
   - **No iPhone/iPad (Safari):** Toque no botão de compartilhar (ícone com quadrado e seta para cima) e escolha **"Adicionar à Tela de Início"**.
5. O jogo abrirá sem barras do navegador, em modo tela cheia e sem zoom acidental!

---

## 🎙️ Como Gravar Sua Própria Voz no Jogo

Por padrão, o jogo fala automaticamente em português usando a **Web Speech API**. Se você quiser personalizar com a sua voz ou a da família, basta gravar pequenos áudios no celular e salvá-los como arquivos `.mp3` dentro da pasta:

```
public/audio/
```

### Nomes dos arquivos aceitos:
- `vamos-correr.mp3` - Ao tocar em "JOGAR!"
- `largada-3.mp3`, `largada-2.mp3`, `largada-1.mp3`, `largada-ja.mp3` - Contagem da largada
- `pula.mp3` - Som / incentivo do pulo
- `num-1.mp3` até `num-10.mp3` - Contagem de cada ovelhinha (ex: *"Uma ovelhinha!"*, *"Duas ovelhinhas!"*...)
- `turbo.mp3` - Ao pisar na rampa arco-íris (*"Super Turbo!"*)
- `surpresa.mp3` - Ao acertar a caixa surpresa
- `ops.mp3` - Ao encostar em uma pedrinha ou poça (*"Ops! Pulinho!"*)
- `toca.mp3` - Dica de inatividade (*"Toca na tela para pular!"*)
- `parabens.mp3` - Na tela de vitória das 10 ovelhas

O jogo verifica automaticamente a existência dos arquivos via Howler.js. Se o arquivo estiver lá, ele toca a sua gravação; caso contrário, usa o narrador padrão.

---

## 💻 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar servidor local com acesso na rede Wi-Fi
npm run dev -- --host

# Compilar versão de produção
npm run build

# Pré-visualizar build de produção
npm run preview
```
