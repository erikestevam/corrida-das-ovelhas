# 🐑 O Bom Pastor: O Vale das Ovelhinhas 🏡🌈

Jogo web educativo e cristão em **Mundo Aberto 3D**, com arquitetura modular e boas práticas inspiradas no ecossistema do **Claude Code Game Studios**, projetado especialmente para crianças pequenas e bebês em fase de introdução aos jogos eletrônicos, jogando **no celular ou no computador**.

---

## 🎯 Conceito e Jogabilidade

1. **Mundo Aberto no Vale do Bom Pastor:**
   - O pastorzinho parte da sua **Fazenda (com Celeiro Vermelho e o Aprisco cercado de madeira)**.
   - Pelo vale verdejante há 10 ovelhinhas perdidas pastando livremente entre colinas, macieiras, flores coloridas e um lago cristalino, sob um lindo arco-íris e o sol sorridente.

2. **Mecânica Bíblica e Educativa de Resgate:**
   - O pastorzinho encontra uma ovelhinha perdida no campo (`distância < 2.8m`).
   - A ovelhinha passa a segui-lo alegremente dando pulinhos e corações.
   - **Regra Central**: Cada ovelhinha deve ser conduzida **de volta para a Fazenda** para ser colocada em segurança dentro do cercadinho (Aprisco).
   - Ao entrar no aprisco, a ovelha é salva, solta confetes e a voz neural carinhosa conta: *"Uma ovelhinha!"*, *"Duas ovelhinhas!"*, até todas as 10 estarem salvas!
   - Uma vez salva, o pastor é liberado para buscar a próxima ovelhinha no vale.

3. **Controles Simples e Acessíveis:**
   - **No Computador:** Setas do teclado (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) ou `W, A, S, D` e `Barra de Espaço` para pular.
   - **No Celular:** **Stick Analógico Virtual (Joystick)** suave e com retorno de mola no canto inferior esquerdo e botão de ação/pulo no canto inferior direito.

4. **Filosofia "Zero Frustração" e Guia Amigável:**
   - **Seta Guia 3D e Bússola no HUD:** Uma seta dourada flutuante aponta sempre para o objetivo atual:
     - Se estiver procurando: aponta para a ovelhinha mais próxima com a distância em metros.
     - Se estiver com uma ovelhinha: aponta de volta para a Fazenda ("Leve a ovelhinha para a Fazenda! 🏡").
   - Cerca perimetral de madeira ao redor de todo o mundo aberto impedindo o personagem de cair ou se perder no vazio.
   - **SEM GAME OVER**: Apenas exploração tranquila, alegre e recompensadora.

---

## 🛠️ Arquitetura e Stack (Padrões Claude Code Game Studios)

- **Lógica Pura Desacoplada (`src/game/rules.ts`):** Lógica matemática determinística, gerenciamento de estado e detecção de colisões independentes do Three.js ou DOM.
- **Testes Unitários com Vitest (`tests/unit/rules.test.ts`):** Cobertura completa de testes automatizados garantindo movimentação, clamp de bordas, coleta e entrega de ovelhas.
- **Motor 3D WebGL (`Three.js`):** Renderização suave a 60 FPS com materiais estilizados cartoon, iluminação solar e sombras dinâmicas suaves (`PCFSoftShadowMap`).
- **Gerenciador de Input Unificado (`src/input/InputManager.ts`):** Trata tanto teclado quanto joystick analógico mobile com deadzone e normalização vetorial.
- **Áudio Neural Natural (51 MP3s + Tone.js + Howler.js):** Locução natural em `pt-BR` de todos os números e ações, com síntese imediata de chimes musicais em escala pentatônica crescente.
- **Interface e Animações com Mola (Motion + Canvas Confetti):** HUD responsivo, celebrações de confetes e popups gigantes com física de mola.
- **Vercel Cache-Buster & PWA (`vercel.json` + `vite-plugin-pwa`):** Atualização instantânea sem retenção de cache antigo do Service Worker.

---

## 🧪 Rodando os Testes Automatizados

Seguindo o padrão do Claude Code Game Studios:
```bash
npm test
```

---

## 🚀 Como Executar Localmente

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev -- --host
   ```
2. Acesse no navegador local ou digite o IP de rede no celular para jogar na mesma rede Wi-Fi.

---

## 📦 Build para Produção

```bash
npm run build
```
Os arquivos otimizados são gerados na pasta `dist/` e prontos para deploy na Vercel ou qualquer provedor web estático.
