
convertTofilerank(pos)
{
  let vert = 8 - Math.floor(pos/8);
  let hor = ["a","b","c","d","e","f","g","h"][pos % 8];
  return hor + vert;
}

export default function(move, board, extra){
  if(move.castling)
  {
    if(move.origin > move.destination)
      return "O-O-O"
    else {
      return "O-O"
    }
  }
  let string = "";
  switch(board[move.destination])
  

  return string;
}
