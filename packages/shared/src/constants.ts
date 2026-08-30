export const GAME_CONSTANTS = {
  CHUNK_SIZE: 64,
  MAX_PLAYERS_PER_ROOM: 16
};

export const MESSAGES = {
  PLAYER_MOVE: "playerMove"
};

export type PlayerMoveMessage = {
  x: number;
  y: number;
  z: number;
  rotation: number;
};
