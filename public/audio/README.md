# 🎙️ Como colocar sua própria voz gravada no jogo!

O jogo **"O Bom Pastor: Corrida das Ovelhinhas"** vem por padrão com narração de voz alegre em Português usando a **Web Speech API** e efeitos sintetizados com **Tone.js**.

Se você quiser que seu filho ou filha ouça a **sua própria voz** (ou a voz da mamãe, papai, vovó ou professor) encorajando e contando as ovelhas, basta gravar pequenos áudios no celular ou computador e salvá-los nesta pasta (`public/audio/`) com os seguintes nomes de arquivo:

---

### 📋 Nomes dos Arquivos de Áudio (formato `.mp3`)

| Arquivo MP3 | Momento do Jogo | Texto Sugerido |
| :--- | :--- | :--- |
| `vamos-correr.mp3` | Ao apertar o botão de Play | *"Vamos correr com o Bom Pastor!"* |
| `largada-3.mp3` | Na contagem 3 | *"Três!"* |
| `largada-2.mp3` | Na contagem 2 | *"Dois!"* |
| `largada-1.mp3` | Na contagem 1 | *"Um!"* |
| `largada-ja.mp3` | Na largada "JÁ!" | *"JÁ! Corre, ovelhinha!"* |
| `pula.mp3` | No pulo | *"Pula!"* / *"Upa!"* |
| `num-1.mp3` | 1ª ovelhinha resgatada | *"Uma ovelhinha!"* |
| `num-2.mp3` | 2ª ovelhinha resgatada | *"Duas ovelhinhas!"* |
| `num-3.mp3` | 3ª ovelhinha resgatada | *"Três ovelhinhas!"* |
| `num-4.mp3` | 4ª ovelhinha resgatada | *"Quatro ovelhinhas!"* |
| `num-5.mp3` | 5ª ovelhinha resgatada | *"Cinco ovelhinhas! Muito bem!"* |
| `num-6.mp3` | 6ª ovelhinha resgatada | *"Seis ovelhinhas!"* |
| `num-7.mp3` | 7ª ovelhinha resgatada | *"Sete ovelhinhas!"* |
| `num-8.mp3` | 8ª ovelhinha resgatada | *"Oito ovelhinhas!"* |
| `num-9.mp3` | 9ª ovelhinha resgatada | *"Nove ovelhinhas! Só falta uma!"* |
| `num-10.mp3` | 10ª ovelhinha resgatada | *"Dez ovelhinhas! Você conseguiu todas!"* |
| `turbo.mp3` | Ao pegar a rampa de turbo arco-íris | *"Super Turbo! Vruum!"* |
| `surpresa.mp3` | Ao bater na Caixa Surpresa (?) | *"Surpresa! Que legal!"* |
| `ops.mp3` | Ao encostar em obstáculo (pedra/poça) | *"Ops! Um pulinho engraçado!"* |
| `toca.mp3` | Dica quando a criança não toca na tela | *"Toca na telinha para pular!"* |
| `parabens.mp3` | Na tela final de celebração | *"Parabéns, meu amor! O Bom Pastor cuidou de todas as ovelhinhas!"* |
| `musica.mp3` *(opcional)* | Música de fundo contínua | Música infantil cristã ou instrumental alegre em loop |

---

### 💡 Dicas para gravação
1. Use o gravador de voz do seu celular (iPhone ou Android).
2. Fale com um tom bem animado, alegre e com um sorriso no rosto. Crianças pequenas adoram vozes expressivas!
3. Se o gravador salvar em `.m4a` ou `.wav`, você pode converter gratuitamente para `.mp3` em sites como [cloudconvert.com](https://cloudconvert.com) ou qualquer app de áudio.
4. Salve os arquivos com os nomes exatos listados acima dentro desta pasta `public/audio/`. O jogo detecta e usa os arquivos automaticamente com **Howler.js**! Se algum arquivo não existir, o jogo continuará usando o narrador automático.
