export function createPiece(choice, pos, color, moved=0){
  let newPiece = null;
    console.log("color ", color)
    switch(choice)
    {
      case "queen":
        newPiece = new Queen(pos, color);
        break;
      case "rook":
       newPiece = new Rook(pos, color);
       break;
    case "horse":
      newPiece = new Horse(pos, color);
      break;
    case "bishop":
      newPiece = new Bishop(pos, color);
      break;
    case "pawn":
      newPiece = new Pawn(pos, color);
      break;
    case "king":
      newPiece = new King(pos, color);
      break;
    }
    newPiece.moved = moved;
    return newPiece;
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
  determine_moves(board, constraints)
  {
    this.moves =  [];
    board;
    constraints;
  }
  show_moves()
  {
    return this.moves;
  }
  find_move(npos)
  {
    for(const move of this.moves)
    {
      if(move.npos == npos){
        return move;
      }
    }
  }
  constrain(constraints)
  {

    let all = constraints.filter((item)=>(item.all));
    // King has to move
    if(all.length >= 2){
      this.moves = [];
      return;
    }
    // Either King moves or piece moves to protect king
    if(all.length === 1){
      console.log(all);
      this.moves = this.moves.filter(item => (all[0].enemy === item.destination) || (all[0].constraints.includes(item.destination)));
      return;
    }
    // Neither King nor Piece in immediate threat, piece can't move if blocking king
    let con = [].concat.apply([],constraints.filter((item)=>(item.pos === this.pos)).map(item => item.constraints));
    console.log(con)
    if (con.length)
      this.moves = this.moves.filter((item) => con.includes(item.destination));
  }
  calculate_constraints(board)
  {
    board;
    return [];
  }
}
const is_legal = (pos) => pos < 64 && pos >= 0;
const is_in_bounds = (pos, x, y) => {
  let {vert, hor} = {vert: Math.floor(pos/8) + y, hor: pos%8 + x };
  if((vert <= 7) && (vert >= 0) && (hor <= 7) && (hor >= 0))
      return true;
  return false;
}
const is_free  = (board, pos) => is_legal(pos) && !board[pos];
const is_enemy = (board, pos, color) => is_legal(pos) && !is_free(board, pos) && (board[pos].color !== color);
// const is_ally = is_legal(pos) && !is_free(board, pos) && (board[pos].color === color);

export class Pawn extends Piece
{
  #orientation = "white";

  constructor(color, pos)
  {
      super("pawn", color, pos);
      this.enpas = false;
      this.moves = [{origin: pos, destination: 32}];
      this.color = color;
      this.#orientation = (color ? -1 : 1);
  }
  determine_moves(board, constraints)
  {
    this.enpas = false;
    this.moves = [];

    let moveproto = {origin: this.pos};

    if(this.moved === 5)
      {
        moveproto = {...moveproto, type: "promo", promo: true, demo: this, chosen: null};
      }

      // Forward advance
      let npos = this.pos + 8 * this.#orientation;
      if(is_free(board, npos))
      {

      // typical
      this.moves.push({...moveproto, destination: npos});
      if (!this.moved)
        {
          let npos = this.pos + 16 * this.#orientation;
          if(is_free(board, npos))
          {
            this.moves.push({...moveproto, destination: npos, enpas_add: true});
          }
        }
      }

      // Flank left
      npos = this.pos + 8 * this.#orientation - 1;
      if(is_in_bounds(this.pos, -1, this.#orientation) && is_enemy(board, npos, this.color)){
        this.moves.push({...moveproto, destination: npos, deleted: board[npos]});
      }

      // Flank right
      npos = this.pos + 8 * this.#orientation + 1;
      if(is_in_bounds(this.pos, 1, this.#orientation) && is_enemy(board, npos, this.color)){
        this.moves.push({...moveproto, destination: npos, deleted: board[npos]})
      }

      // En passant left
      npos = this.pos - 1;
      if(is_in_bounds(this.pos, -1, this.#orientation) && is_enemy(board, npos, this.color) && board[npos].enpas){
        this.moves.push({...moveproto, destination: this.pos + 8 * this.#orientation - 1, deleted: board[npos]});
      }

      // En passant right
      npos = this.pos + 1;
      if(is_in_bounds(this.pos, 1, this.#orientation) && is_enemy(board, npos, this.color) && board[npos].enpas)
      {
        this.moves.push({...moveproto, destination: this.pos + 8 * this.#orientation + 1, deleted: board[npos]});
      }
      this.constrain(constraints);
      return this.moves.length;
    }
    calculate_constraints(board)
    {
      let constraints = [];
      // Flank left
      let npos = this.pos + 8 * this.#orientation - 1;
      if(is_in_bounds(this.pos, -1, this.#orientation) && is_enemy(board, npos, this.color) && board[npos] instanceof King){
        constraints.push(npos);
      }

      // Flank right
      npos = this.pos + 8 * this.#orientation + 1;
      if(is_in_bounds(this.pos, 1, this.#orientation) && is_enemy(board, npos, this.color) && board[npos] instanceof King){
        constraints.push(npos)
      }
      return {king: true, constraints: constraints};
    }
}

export class Horse extends Piece{
  constructor(color, pos){
    super("horse", color, pos);
  }

  determine_moves(board, constraints){
    this.moves = [];
    // let hor = Math.floor(this.pos / 8);
    let possible = [{x:1, y:2, offset:17},{x:-1,y:-2, offset:-17},{x:-1,y:2,offset:15},{x:1,y:-2, offset:-15}, {x:2, y:1, offset:10}, {x:-2, y:-1, offset:-10},{x:-2, y:1, offset:6}, {x:2, y:-1, offset: -6}];
    for (let move of possible){
      let npos = this.pos + move.offset;
      if(is_free(board, npos) && is_in_bounds(this.pos, move.x, move.y)){
        this.moves.push({origin: this.pos, destination: npos});
      }
      if(is_enemy(board, npos, this.color) && is_in_bounds(this.pos, move.x, move.y)){
        this.moves.push({origin: this.pos, destination: npos, deleted: board[npos]});
      }
    }
    this.constrain(constraints);
    return this.moves.length;
  }
  calculate_constraints(board)
  {
    let constraints = [];
    let possible = [{x:1, y:2, offset:17},{x:-1,y:-2, offset:-17},{x:-1,y:2,offset:15},{x:1,y:-2, offset:-15}, {x:2, y:1, offset:10}, {x:-2, y:-1, offset:-10},{x:-2, y:1, offset:6}, {x:2, y:-1, offset: -6}];
    for (let move of possible){
      let npos = this.pos + move.offset;
      if(is_enemy(board, npos, this.color) && is_in_bounds(this.pos, move.x, move.y) && board[npos] instanceof King)
      {
        constraints.push(npos);
      }
  }
  return {king: true, constraints: constraints};
}
}
class ExtendedPiece extends Piece{

  determine_consec(board, offset, x, y){
    let npos = this.pos;
    while(is_free(board, npos + offset) && is_in_bounds(npos, x, y))
  {
    this.moves.push({origin: this.pos, destination: npos + offset});
    npos += offset;
  }
    if (is_enemy(board, npos + offset, this.color) && is_in_bounds(npos, x, y))
        this.moves.push({origin: this.pos, destination: npos + offset, deleted: board[npos+offset]});
  }

  constraint_consec(board, offset, x, y)
  {
   let prev = null;
   let king_constraints = [];
   let constraints = [];
   let npos = this.pos;
   let temp = [];
   let t = true;
   while(t){

     if(!is_in_bounds(npos, x, y))
     {
       break;
     }
     else if (!board[npos + offset] && (prev === null))
     {
       king_constraints.push(npos + offset);
     }
     else if(!board[npos + offset] && (prev !== null))
        temp.push(npos + offset);

     else if ((prev !== null) && board[npos + offset] && board[npos + offset].color === this.color)
     {
       king_constraints.push(npos+offset);
       break;
     }

     else if (board[npos + offset] && board[npos + offset].color !== this.color){
       if(board[npos+offset] instanceof King)
       {
         if(prev !== null)
         {
           constraints.push({pos: prev, constraints: [...king_constraints, ...temp, this.pos]});
         }
         else
         {
           console.log("FDFSDHKF", npos)
           king_constraints.push(npos + offset);
           npos += offset;
           if(is_in_bounds(npos, x,y))
           {
             king_constraints.push(npos+offset);
           }
           constraints.push({all: true, constraints: [...king_constraints], enemy: this.pos});
         }
       }
       else
       {
         if (prev !== null)
           break;
         prev = npos + offset;
         console.log("here", prev);
         king_constraints.push(npos+offset);
       }
     }
     npos += offset;
   }
   constraints.push({king: true, constraints: king_constraints});
   return constraints;
  }
  }
export class Rook extends ExtendedPiece
{

  constructor(pos,color){
    super("castle", pos, color);
  }

  determine_moves(board, constraints)
  {
    this.moves = [];
    this.determine_consec(board,8,0,1);
    this.determine_consec(board,-8,0,-1);
    this.determine_consec(board, 1,1,0);
    this.determine_consec(board,-1,-1,0);
    this.constrain(constraints);
    return this.moves.length;
  }
  calculate_constraints(board){
    let constraints = [];
    constraints =  constraints.concat(this.constraint_consec(board, 8, 0 ,1));
    constraints =  constraints.concat(this.constraint_consec(board, -8,0,-1));
    constraints =  constraints.concat(this.constraint_consec(board, 1,1,0));
    constraints =  constraints.concat(this.constraint_consec(board,-1,-1,0));
    return constraints;
  }
}

export class Bishop extends ExtendedPiece{
  constructor(pos, color){
    super("bishop", pos, color);
  }
  determine_moves(board, constraints){
    this.moves = [];
    this.determine_consec(board, 7, -1, 1);
    this.determine_consec(board, 9, 1, 1);
    this.determine_consec(board, -7, 1, -1);
    this.determine_consec(board, -9, -1, -1);
    this.constrain(constraints);
    return this.moves.length;
  }
  calculate_constraints(board){
    let constraints = [];
    constraints =  constraints.concat(this.constraint_consec(board, 7, -1 ,1));
    constraints =  constraints.concat(this.constraint_consec(board, 9,1,1));
    constraints =  constraints.concat(this.constraint_consec(board, -7,1,-1));
    constraints =  constraints.concat(this.constraint_consec(board, -9,-1,-1));
    return constraints;
  }
}
//
//
export class Queen extends ExtendedPiece{
  constructor(pos, color){
    super("queen", pos, color);
  }
  determine_moves(board, constraints){
    this.moves = [];
    this.determine_consec(board,8,0,1);
    this.determine_consec(board,-8,0,-1);
    this.determine_consec(board, 1,1,0);
    this.determine_consec(board,-1,-1,0);
    this.determine_consec(board, 7, -1, 1);
    this.determine_consec(board, 9, 1, 1);
    this.determine_consec(board, -7, 1, -1);
    this.determine_consec(board, -9, -1, -1);
    this.constrain(constraints);
    return this.moves.length;
  }
  calculate_constraints(board){
    let constraints = [];
    constraints =  constraints.concat(this.constraint_consec(board, 7, -1 ,1));
    constraints =  constraints.concat(this.constraint_consec(board, 9,1,1));
    constraints =  constraints.concat(this.constraint_consec(board, -7,1,-1));
    constraints =  constraints.concat(this.constraint_consec(board, -9,-1,-1));
    constraints =  constraints.concat(this.constraint_consec(board, 8, 0 ,1));
    constraints =  constraints.concat(this.constraint_consec(board, -8,0,-1));
    constraints =  constraints.concat(this.constraint_consec(board, 1,1,0));
    constraints =  constraints.concat(this.constraint_consec(board,-1,-1,0));
    return constraints;
  }
}

export class King extends Piece{
  constructor(pos, color){
    super("king", pos, color);
    this.check = false;
  }

  constrain(constraints)
  {
    let con = [].concat.apply([],constraints.filter(item => item.king || item.all).map(item => item.constraints))
    if (con.includes(this.pos)){
      this.check = true;
    }
    this.moves = this.moves.filter(move => !con.includes(move.destination));
    return con;
  }

  determine_moves(board, constraints)
  {
        this.moves = [];
        let possible = [{x:1, y:1, offset:9},{x:-1,y:-1, offset: -9},{x:-1,y:1,offset:7},{x:1,y:-1, offset:-7}, {x:0, y:1, offset:8}, {x:1, y:0, offset: 1},{x:-1, y:0, offset:-1}, {x:0, y:-1, offset: -8}];
        for (let move of possible){
          let npos = this.pos + move.offset;
          if(is_free(board, npos) && is_in_bounds(this.pos, move.x, move.y)){
            this.moves.push({origin: this.pos, destination: npos});
          }
          if(is_enemy(board, npos, this.color) && is_in_bounds(this.pos, move.x, move.y)){
            this.moves.push({origin: this.pos, destination: npos, deleted: board[npos]});
          }
        }
        let con = this.constrain(constraints);
        if(!this.moved && !this.check){
          this.castling(board, con);
        }
        return this.moves.length;
  }
  calculate_constraints(board){
    this.check = false;
    let constraints = [];
    let possible = [{x:1, y:1, offset:9},{x:-1,y:-1, offset: -9},{x:-1,y:1,offset:7},{x:1,y:-1, offset:-7}, {x:0, y:1, offset:8}, {x:1, y:0, offset: 1},{x:-1, y:0, offset:-1}, {x:0, y:-1, offset: -8}];
    for (let move of possible){
      let npos = this.pos + move.offset;
      if(is_enemy(board, npos, this.color) && is_in_bounds(this.pos, move.x, move.y) && board[npos] instanceof King){
        constraints.push(npos);
      }
    }
    return {king: true, constraints: constraints};
  }
  castling(board, constraints)
  {
    // LEFT
    let npos = this.pos - 4;
    if(is_legal(npos) && board[npos] instanceof Rook && !board[npos].moved && [-1,-2,-3].map(item => is_free(board, item + this.pos)).reduce((a,b) => a & b) && !constraints.includes(this.pos - 1) && !constraints.includes(this.pos -2))
          this.moves.push({type:"castling", origin: this.pos, destination: this.pos - 2, castling: {origin: npos, destination: npos + 3}});
    // RIGHT
    npos = this.pos + 3;
    if(is_legal(npos) && board[npos] instanceof Rook && !board[npos].moved && [1,2].map(item => is_free(board, item + this.pos)).reduce((a,b)=> a && b) && !constraints.includes(this.pos + 1) && !constraints.includes(this.pos + 2))
          this.moves.push({type: "castling", origin: this.pos, destination: this.pos + 2, castling: {origin: this.pos + 3 , destination: this.pos + 1}});
  }
}
