#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_BASE = path.resolve(__dirname, '../../rummikub-server/src');
const OUTPUT_PATH = path.resolve(__dirname, '../src/types/server.generated.ts');

// Type overrides for known `any` types
const TYPE_OVERRIDES = {
  'GameState.players': 'PlayerPublicInfo[]',
  'GameState.board': 'Combination[]',
  'GameState.winner': 'PlayerPublicInfo | null',
  'PlaceCombinationDto.combination': '{ tiles: Tile[]; type: CombinationType }',
};

// Extract enum from source code
function extractEnum(source, enumName) {
  const regex = new RegExp(`export\\s+enum\\s+${enumName}\\s*\\{([^}]+)\\}`, 's');
  const match = source.match(regex);
  if (!match) return null;
  return `export enum ${enumName} {${match[1]}}`;
}

// Extract constant from source code
function extractConstant(source, constantName) {
  const regex = new RegExp(`export\\s+const\\s+${constantName}\\s*=\\s*([^;]+);`, 's');
  const match = source.match(regex);
  if (!match) return null;
  const value = match[1].trim();
  const suffix = value.endsWith('as const') ? '' : ' as const';
  return `export const ${constantName} = ${value}${suffix};`;
}

// Extract class properties and convert to interface
// Handles `extends` clauses and nested braces in class body
function classToInterface(source, className, typeName, overridePrefix) {
  const classRegex = new RegExp(
    `export\\s+class\\s+${className}(?:\\s+extends\\s+(\\w+))?\\s*\\{`,
  );
  const match = source.match(classRegex);
  if (!match) return null;

  const parentClass = match[1] || null;

  // Find matching closing brace using brace counting
  const startIndex = match.index + match[0].length;
  let braceCount = 1;
  let i = startIndex;
  while (i < source.length && braceCount > 0) {
    if (source[i] === '{') braceCount++;
    if (source[i] === '}') braceCount--;
    i++;
  }
  const body = source.slice(startIndex, i - 1);

  // Extract only property declarations (before constructor/methods)
  const lines = body.split('\n');
  const properties = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Stop at constructor or method declarations
    if (trimmed.startsWith('constructor') || trimmed.startsWith('static ') || /^\w+\s*\(/.test(trimmed)) break;
    // Skip decorators
    if (trimmed.startsWith('@')) continue;

    const propMatch = trimmed.match(/^(\w+)\s*:\s*([^;]+);/);
    if (propMatch) {
      const [, propName, propType] = propMatch;
      const overrideKey = `${overridePrefix}.${propName}`;
      const finalType = TYPE_OVERRIDES[overrideKey] || propType.trim();
      properties.push(`  ${propName}: ${finalType};`);
    }
  }

  if (properties.length === 0) return null;

  const extendsClause = parentClass ? ` extends ${parentClass}` : '';
  return `export interface ${typeName}${extendsClause} {\n${properties.join('\n')}\n}`;
}

// Extract toPublicInfo() return type from Player class
function extractPublicInfo(source) {
  const regex = /toPublicInfo\(\)\s*\{[^}]*return\s*\{([^}]+)\}/s;
  const match = source.match(regex);
  if (!match) return null;

  const returnBody = match[1];
  const lines = returnBody.split('\n');
  const properties = [];

  // Type map inferred from Player class property types
  const typeMap = {
    id: 'string',
    nickname: 'string',
    isReady: 'boolean',
    isHost: 'boolean',
    tileCount: 'number',
    hasInitialMeld: 'boolean',
    score: 'number',
  };

  for (const line of lines) {
    const propMatch = line.match(/^\s*(\w+)\s*:/);
    if (propMatch) {
      const propName = propMatch[1];
      properties.push(`  ${propName}: ${typeMap[propName] || 'unknown'};`);
    }
  }

  return `export interface PlayerPublicInfo {\n${properties.join('\n')}\n}`;
}

// Socket event payload interfaces derived from gateway analysis
function generateSocketEventInterfaces() {
  return `// Socket Event Payloads (Server -> Client)

export interface RoomCreatedPayload {
  roomCode: string;
  player: PlayerPublicInfo;
}

export interface JoinedRoomPayload {
  roomCode: string;
  players: PlayerPublicInfo[];
  myPlayerId: string;
  isHost: boolean;
}

export interface RoomFoundPayload {
  roomCode: string;
  players: PlayerPublicInfo[];
  gameStarted: boolean;
  maxPlayers: number;
}

export interface PlayerJoinedPayload {
  players: PlayerPublicInfo[];
  newPlayer: PlayerPublicInfo;
}

export interface PlayerLeftPayload {
  players: PlayerPublicInfo[];
  leftPlayer: string;
}

export interface PlayerStatusChangedPayload {
  players: PlayerPublicInfo[];
}

export interface GameStartedPayload {
  gameState: GameState;
  myTiles: Tile[];
  isMyTurn: boolean;
}

export interface TileDrawnPayload {
  myTiles: Tile[];
  deckCount: number;
}

export interface BoardUpdatedPayload {
  gameState: GameState;
}

export interface MyTilesUpdatedPayload {
  tiles: Tile[];
}

export interface TurnChangedPayload {
  gameState: GameState;
  currentPlayerId: string;
}

export interface YourTurnPayload {
  isMyTurn: boolean;
}

export interface DeckUpdatedPayload {
  deckCount: number;
}

export interface GameOverPayload {
  winner: PlayerPublicInfo;
  gameState: GameState;
}

export interface ErrorPayload {
  message: string;
}`;
}

function readServerFile(relativePath) {
  const fullPath = path.join(SERVER_BASE, relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

function main() {
  console.log('Generating TypeScript types from server source...');

  const outputs = [];

  // Header
  outputs.push('// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY');
  outputs.push('// Generated by scripts/generate-types.mjs');
  outputs.push(`// Run \`npm run generate:types\` to regenerate`);
  outputs.push('');

  // 1. Enums
  const tileSource = readServerFile('modules/game/entities/tile.entity.ts');
  const tileColorEnum = extractEnum(tileSource, 'TileColor');
  if (tileColorEnum) outputs.push(tileColorEnum, '');

  const combinationSource = readServerFile('modules/game/entities/combination.entity.ts');
  const combinationTypeEnum = extractEnum(combinationSource, 'CombinationType');
  if (combinationTypeEnum) outputs.push(combinationTypeEnum, '');

  // 2. Entity interfaces
  const tileInterface = classToInterface(tileSource, 'Tile', 'Tile', 'Tile');
  if (tileInterface) outputs.push(tileInterface, '');

  const combinationInterface = classToInterface(combinationSource, 'Combination', 'Combination', 'Combination');
  if (combinationInterface) outputs.push(combinationInterface, '');

  const playerSource = readServerFile('modules/room/entities/player.entity.ts');
  const playerPublicInfo = extractPublicInfo(playerSource);
  if (playerPublicInfo) outputs.push(playerPublicInfo, '');

  const gameStateSource = readServerFile('modules/game/entities/game-state.entity.ts');
  const gameStateInterface = classToInterface(gameStateSource, 'GameState', 'GameState', 'GameState');
  if (gameStateInterface) outputs.push(gameStateInterface, '');

  // 3. DTOs
  const createRoomDtoSource = readServerFile('modules/room/dto/create-room.dto.ts');
  const createRoomDto = classToInterface(createRoomDtoSource, 'CreateRoomDto', 'CreateRoomDto', 'CreateRoomDto');
  if (createRoomDto) outputs.push(createRoomDto, '');

  const joinRoomDtoSource = readServerFile('modules/room/dto/join-room.dto.ts');
  const joinRoomDto = classToInterface(joinRoomDtoSource, 'JoinRoomDto', 'JoinRoomDto', 'JoinRoomDto');
  if (joinRoomDto) outputs.push(joinRoomDto, '');

  // PlayerActionDto and PlaceCombinationDto are in the same file
  const playerActionDtoSource = readServerFile('modules/room/dto/player-action.dto.ts');
  const playerActionDto = classToInterface(playerActionDtoSource, 'PlayerActionDto', 'PlayerActionDto', 'PlayerActionDto');
  if (playerActionDto) outputs.push(playerActionDto, '');

  const placeCombinationDto = classToInterface(playerActionDtoSource, 'PlaceCombinationDto', 'PlaceCombinationDto', 'PlaceCombinationDto');
  if (placeCombinationDto) outputs.push(placeCombinationDto, '');

  // 4. Constants
  const constantsSource = readServerFile('common/constants/game.constants.ts');
  const gameConstants = extractConstant(constantsSource, 'GAME_CONSTANTS');
  if (gameConstants) outputs.push(gameConstants, '');

  const tileColors = extractConstant(constantsSource, 'TILE_COLORS');
  if (tileColors) outputs.push(tileColors, '');

  // 5. Socket event payloads
  outputs.push(generateSocketEventInterfaces(), '');

  // Write output file
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, outputs.join('\n'), 'utf8');

  console.log(`Types generated: ${OUTPUT_PATH}`);
}

main();
