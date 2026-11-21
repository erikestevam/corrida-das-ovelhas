# 🐑 O Bom Pastor: Corrida das Ovelhinhas 🌈

Jogo web educativo e cristão estilo **Endless Runner de 1 Botão**, inspirado na energia e dinamismo de *Mario Kart* e *Super Mario Run*, projetado especialmente para crianças pequenas e bebês em fase de introdução aos jogos eletrônicos, jogando **principalmente no celular**.

---

## 🎯 Conceito e Pilares

1. **Tema Bíblico e Educativo:**
   - O jogador controla o alegre **Bom Pastor** correndo por colinas floridas sob um arco-íris e sol sorridente.
   - O objetivo é resgatar até **10 ovelhinhas** perdidas e coletar estrelas pelo caminho.
   - Cada ovelhinha resgatada dispara um **número gigante e colorido** com física de mola (*spring*) e a voz narra alegremente em português: *"Um!"*, *"Dois!"*, *"Três!"* até *"Dez!"*.
   - Ao completar as 10 ovelhas, ocorre uma grande festa de vitória com chuva de confetes, estrelas e comemoração.

2. **Filosofia "Zero Frustração":**
   - **SEM GAME OVER e SEM CRONÔMETRO:** Tocar em um obstáculo (pedrinha sorridente, arbusto macio ou poça d'água) **não mata** e **não tira pontos**. O pastorzinho dá um pulinho engraçado, pisca por 1 segundo e continua correndo enquanto a voz incentiva (*"Ops! Pulinho!"*).
   - **Controle de 1 Toque:** Tocar em qualquer lugar da tela (ou qualquer tecla no teclado) faz o personagem pular.
   - **Pulo Duplo:** Permite tocar uma segunda vez no ar para dar um pulinho extra suave.
   - **Gravidade Flutuante e Confortável:** Gravidade suave que facilita pegar itens no ar.
   - **Coyote Time e Jump Buffering (160ms):** Tolerância generosa para que a criança nunca sinta que o toque falhou.
   - **Dica por Inatividade:** Se a criança hesitar antes de um obstáculo, surge um dedinho animado pulsando com o áudio *"Toca na tela para pular!"*.

3. **Elementos Dinâmicos Estilo Mario Kart:**
   - **Largada:** Contagem *"3... 2... 1... JÁ!"* com bipes sintetizados e animação de mola.
   - **Rampas de Turbo Arco-Íris:** Dão um super impulso de velocidade por 2,5 segundos, com rastro de arco-íris, confetes e som acelerado.
   - **Caixas Surpresa (?):** Ao pular nelas, soltam uma chuva de estrelas douradas e confetes.

---

## 🛠️ Stack Tecnológica

- **Vite + TypeScript:** Ambiente rápido, modular e tipado.
- **Phaser 3 (`phaser`):** Motor 2D com Arcade Physics para corrida contínua, pulos, rampas de turbo e 3 camadas de cenário em parallax.
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
3. No celular (conectado na mesma rede Wi-Fi que o computador), abra o navegador (Chrome ou Safari) e digite o endereço exibido (ex: `http://192.168.3.17:5173/`).
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
