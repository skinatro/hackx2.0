export interface TileData {
  tileColor: string;
  width: number;
  height: number;
  className?: string;
}

export class TileDataClass implements TileData {
  tileColor: string;
  width: number;
  height: number;
  className?: string = "";

  constructor(tileColor: string, width: number, height: number, className?: string) {
    this.tileColor = tileColor;
    this.width = width;
    this.height = height;
    this.className = className;
  }
}
