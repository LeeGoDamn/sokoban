export enum Tile {
  Empty = 0,
  Wall = 1,
  Floor = 2,
  Target = 3,
  Box = 4,
  BoxOnTarget = 5,
  Player = 6,
  PlayerOnTarget = 7,
}

export enum GameState {
  Playing = 0,
  LevelComplete = 1,
  AllComplete = 2,
}

export enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}

export interface Position {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  name: string;
  map: number[][];
  width: number;
  height: number;
}

export interface GameRecord {
  playerPos: Position;
  boxes: Position[];
  moves: number;
}
