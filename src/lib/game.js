export const defaultState = {
  settings: {
    buyInPoints: 2000,
    buyInChips: 50000,
    commission: 0
  },
  players: []
};

export function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createPlayer(name) {
  return {
    id: createId(),
    name: name.trim(),
    buyIns: 1,
    paidToken: 0,
    isEliminated: false,
    eliminatedAt: null
  };
}

export function normalizePlayer(player, index) {
  const isEliminated = Boolean(player.isEliminated);
  const eliminatedAt = Number(player.eliminatedAt);

  return {
    ...player,
    isEliminated,
    eliminatedAt: isEliminated ? (Number.isFinite(eliminatedAt) ? eliminatedAt : index) : null
  };
}

export function normalizeGameState(parsedState) {
  return {
    settings: { ...defaultState.settings, ...(parsedState?.settings || {}) },
    players: Array.isArray(parsedState?.players) ? parsedState.players.map(normalizePlayer) : []
  };
}

export function getEliminatedPlaceMap(players) {
  const eliminatedPlayers = players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => player.isEliminated)
    .sort((a, b) => (a.player.eliminatedAt || 0) - (b.player.eliminatedAt || 0) || a.index - b.index);

  return new Map(eliminatedPlayers.map(({ player }, index) => [player.id, players.length - index]));
}

export function calculateTotals(players, settings) {
  const totalBuyIns = players.reduce((sum, player) => sum + player.buyIns, 0);
  const paidTokens = players.reduce((sum, player) => sum + player.paidToken, 0);
  const activePlayersCount = players.filter((player) => !player.isEliminated).length;
  const chipsInGame = totalBuyIns * settings.buyInChips;
  const pointsInGame = totalBuyIns * settings.buyInPoints;

  return {
    pointsInGame,
    pointsPaidByTokens: paidTokens * settings.buyInPoints,
    prizePoints: Math.max(0, pointsInGame - settings.commission),
    chipsInGame,
    activePlayersCount,
    averageStack: activePlayersCount > 0 ? Math.floor(chipsInGame / activePlayersCount) : 0
  };
}

export function addPlayerToState(state, name) {
  const normalizedName = normalizeName(name);
  if (!normalizedName) return state;

  const isDuplicate = state.players.some((player) => player.name.toLowerCase() === normalizedName.toLowerCase());
  if (isDuplicate) return state;

  return {
    ...state,
    players: [...state.players, createPlayer(normalizedName)]
  };
}

export function incrementPlayerField(state, playerId, field) {
  return {
    ...state,
    players: state.players.map((player) => {
      if (player.id !== playerId) return player;
      if (field === 'paidToken' && player.paidToken >= player.buyIns) return player;

      return { ...player, [field]: player[field] + 1 };
    })
  };
}

export function decrementPlayerField(state, playerId, field) {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, [field]: Math.max(0, player[field] - 1) } : player
    )
  };
}

export function eliminatePlayer(state, playerId) {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, isEliminated: true, eliminatedAt: Date.now() } : player
    )
  };
}

export function returnPlayerToGame(state, playerId) {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, isEliminated: false, eliminatedAt: null } : player
    )
  };
}

export function deletePlayerFromState(state, playerId) {
  return {
    ...state,
    players: state.players.filter((player) => player.id !== playerId)
  };
}
