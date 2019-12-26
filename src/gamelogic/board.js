export class Board {
  pieces = [new Pawn("black", 2), new Pawn("white", 3)]
  turn = "white"
  constructor()
  {
    this.layout = new Array(64)
    this.pieces.forEach(piece => this.layout[piece.pos] = piece)
  }
  find_moves()
  {


  }
  execute_move()
  {



  }
  is_free(pos)
  {
    return this.layout[pos] === null;
  }
  find_piece(pos)
  {
    return this.layout[pos];
  }
}


class Piece
{
  type;
  moves = [6,7,9];
  moved = 0;
  moving;
  constructor(type, color, pos)
  {
      this.color = color;
      this.pos   = pos;
      this.type  = type;
  }

  determine_moves(board)
  {
    this.moves =  [];
    board;
  }
  show_moves(){
    return this.moves.map(item => item.npos);
  }
}


class Pawn extends Piece
{
  // private variables need to be defined in this way.
  #orientation = "white";

  constructor(color, pos)
  {
      super("pawn", color, pos);
      this.enpas = false;
      this.moves = [];
      this.#orientation = (color == "white" ? 1 : -1);
  }
  determine_moves(board)
  {
    this.enpas = false;
    this.moves = [];
    let npos = this.pos + 8 * this.#orientation;
    if(board.is_free(npos))
    {
      // typical
      if (this.moved < 5)
      {
        this.moves.push({npos: npos});
        if (!this.moved)
        {
          let npos = this.pos + 16 * this.#orientation;
          if(board.is_free(npos))
          {
            this.moves.push({npos: npos, enpas_add: true});
          }
        }
      }
      // promo
      else
      {
        this.moves.push({npos: 7});
      }
    }
  }
}
