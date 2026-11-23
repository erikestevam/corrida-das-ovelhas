import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  updatePlayer,
  updateSheep,
  checkInteractions,
  getCompassTarget,
  DEFAULT_TUNING
} from '../../src/game/rules';

describe('O Bom Pastor - Regras do Jogo e Lógica Pura (Claude Code Game Studios)', () => {
  it('inicializa o estado do mundo aberto com o pastor na fazenda e 10 ovelhas', () => {
    const state = createInitialState();
    expect(state.player.x).toBe(DEFAULT_TUNING.farm.x);
    expect(state.sheep.length).toBe(10);
    expect(state.carriedSheepId).toBeNull();
    expect(state.rescuedCount).toBe(0);
    expect(state.isComplete).toBe(false);

    // Todas as ovelhas começam pastando no campo ('wild')
    state.sheep.forEach(s => {
      expect(s.state).toBe('wild');
    });
  });

  it('movimenta o jogador e o impede de ultrapassar as cercas do mundo aberto', () => {
    const state = createInitialState();
    const initialZ = state.player.z;

    // Move para frente (+Z)
    updatePlayer(state, { dx: 0, dz: 1 }, 0.5);
    expect(state.player.z).toBeGreaterThan(initialZ);
    expect(state.player.isMoving).toBe(true);

    // Tenta ultrapassar o limite máximo do mundo
    state.player.x = DEFAULT_TUNING.worldBounds.maxX + 100;
    updatePlayer(state, { dx: 1, dz: 0 }, 0.1);
    expect(state.player.x).toBeLessThanOrEqual(DEFAULT_TUNING.worldBounds.maxX);
  });

  it('permite resgatar uma ovelhinha que passa a seguir o pastor', () => {
    const state = createInitialState();
    const sheep = state.sheep[0];

    // Coloca o pastor bem perto da ovelha
    state.player.x = sheep.x;
    state.player.z = sheep.z + 1.0;

    const events = checkInteractions(state);
    expect(events.some(e => e.type === 'SHEEP_FOUND')).toBe(true);
    expect(sheep.state).toBe('following');
    expect(state.carriedSheepId).toBe(sheep.id);
  });

  it('impede de pegar uma segunda ovelha enquanto não levar a atual para a fazenda', () => {
    const state = createInitialState();
    const sheep1 = state.sheep[0];
    const sheep2 = state.sheep[1];

    // Pega a primeira ovelha
    state.player.x = sheep1.x;
    state.player.z = sheep1.z;
    checkInteractions(state);
    expect(state.carriedSheepId).toBe(sheep1.id);

    // Tenta passar perto da segunda ovelha
    state.player.x = sheep2.x;
    state.player.z = sheep2.z;
    const secondEvents = checkInteractions(state);

    // Não deve resgatar a segunda ovelha ao mesmo tempo
    expect(secondEvents.some(e => e.type === 'SHEEP_FOUND')).toBe(false);
    expect(sheep2.state).toBe('wild');
    expect(state.carriedSheepId).toBe(sheep1.id);
  });

  it('solta a ovelha no cercadinho ao retornar à fazenda e libera para buscar a próxima', () => {
    const state = createInitialState();
    const sheep = state.sheep[0];

    // Pastor pega a ovelha
    state.player.x = sheep.x;
    state.player.z = sheep.z;
    checkInteractions(state);
    expect(state.carriedSheepId).toBe(sheep.id);

    // Pastor retorna para a fazenda
    state.player.x = DEFAULT_TUNING.farm.x;
    state.player.z = DEFAULT_TUNING.farm.z;

    const deliveryEvents = checkInteractions(state);
    expect(deliveryEvents.some(e => e.type === 'SHEEP_DELIVERED')).toBe(true);
    expect(sheep.state).toBe('rescued');
    expect(state.rescuedCount).toBe(1);
    expect(state.carriedSheepId).toBeNull(); // Liberado para pegar a próxima!
  });

  it('dispara vitória e comemoração quando todas as 10 ovelhinhas são entregues na fazenda', () => {
    const state = createInitialState();

    // Resgata e entrega 9 ovelhas
    state.rescuedCount = 9;
    state.sheep.forEach((s, idx) => {
      if (idx < 9) s.state = 'rescued';
    });

    // Pega a 10ª ovelha
    const lastSheep = state.sheep[9];
    lastSheep.state = 'following';
    state.carriedSheepId = lastSheep.id;

    // Entrega na fazenda
    state.player.x = DEFAULT_TUNING.farm.x;
    state.player.z = DEFAULT_TUNING.farm.z;

    const events = checkInteractions(state);
    expect(events.some(e => e.type === 'ALL_SHEEP_RESCUED')).toBe(true);
    expect(state.rescuedCount).toBe(10);
    expect(state.isComplete).toBe(true);
  });

  it('o indicador de bússola guia a criança sem frustração', () => {
    const state = createInitialState();

    // Quando livre, aponta para a ovelhinha mais próxima
    const target1 = getCompassTarget(state);
    expect(target1.type).toBe('sheep');
    expect(target1.guideText).toContain('Encontre a ovelhinha');

    // Quando com uma ovelhinha, aponta de volta para a fazenda
    state.carriedSheepId = state.sheep[0].id;
    const target2 = getCompassTarget(state);
    expect(target2.type).toBe('farm');
    expect(target2.guideText).toContain('Fazenda');
  });
});
