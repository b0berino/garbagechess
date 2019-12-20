class Board {
  board = [new Pawn("black", 2)];

  constructor(seed){
    this.board_seed = seed;
  }
  constructor()
  {


  }
}


class Piece
{
  type;
  moves = [];
  moved = 0;
  moving;
  constructor(type, color, pos)
  {
      this.color = color;
      this.pos   = pos;
      this.type  = type;
  }
  determine_moves{
    return [6,7,9];
  }
}



class Pawn extends Piece
{
  constructor(type, color, pos)
  {
      Piece.call("pawn", color, pos);
      this.enpas = false;
  }
}
