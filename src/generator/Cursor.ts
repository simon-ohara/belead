export default class Cursor implements Position {
  x = 0;
  y = 0;

  update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
