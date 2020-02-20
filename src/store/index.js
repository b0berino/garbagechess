import Vue from 'vue'
import Vuex from 'vuex'
import {createPiece} from '@/gamelogic/board.js'

let BLACK = false;
let WHITE = true;
Vue.use(Vuex)
const animations = {
  namespaced: true,
  state:
  {
    animIndex: 0,
    animList: [],
    webSocket: null,
  },
  getters:
  {
    white_graveyard: state => state.animList.slice(0, state.animIndex).map(item => item.deleted).filter(item => item && item.color == WHITE),
    black_graveyard: state => state.animList.slice(0, state.animIndex).map(item => item.deleted).filter(item => item && item.color == BLACK),
  },
  mutations:
  {
    changeList(state,action)
    {
        state.animList.splice(state.animIndex, (state.animList.length - state.animIndex), action);
        state.animIndex += 1;
    },
    changeAnimIndex(state, n)
    {
      if(state.animIndex + n < state.animList.length || state.animIndex + n > 0)
        state.animIndex += n;
    },
  },
  actions:{
    // queryRequest({state}, request){},

    undo({commit, rootState}, n=1)
    {
      commit("changeAnimIndex", -n);
      commit("changeTurn", (n % 2 ? !rootState.turn : rootState.turn), {root:true});
    },
    redo({rootState, commit}, n=1)
    {
      commit("changeAnimIndex", n);
      commit("changeTurn", (n % 2 ? !rootState.turn : rootState.turn), {root:true});
    },
    addAnimation({commit, rootState}, action)
    {
      commit("changeList", action);
      commit("changeTurn", !rootState.turn, {root:true});
    },
    returnAnimations({state}, n=0)
    {
      // REDOS
      if( n < state.animIndex)
      {
          return state.animList.slice(n, state.animIndex);
      }
      // UNDOS
      else
      {
          return state.animList.slice(state.animIndex, n).reverse().map(animation => {return {...animation, undo: true} });
      }
    }
   },
 }
const board = {
  namespaced: true,
  state:
  {
    layout: null,
    selected_moves: null,
  },
  getters:{
    board: (state,getters, rootState) =>
    {
      let b = null
      console.log(rootState.playerColor, "FDSFSDFSDFFS");
      b = state.layout.map((item,index) => item ? {piece: item, index:index, move: null} : {piece:null, index:index, move:null});
      if(rootState.playerColor === BLACK){
        b.reverse();
      }
      if(state.selected_moves){
        if(rootState.playerColor === WHITE)
        state.selected_moves.forEach((item)=> b[item.destination].move = item)
        else{
          state.selected_moves.forEach((item)=> b[63-item.destination].move = item);
        }
      }
      return b
    },
  },
  mutations:
  {
    setLayout(state, val)
    {
      state.layout = val;
    },
    setSelectedMoves(state, val)
    {
      state.selected_moves = val;
    },
    executeMove(state, move)
    {
          switch(move.type)
          {
            case "promo":
              if(move.undo)
              {
                console.log(move.chosen, "wakandandlkajdkljfkljsda")
                Vue.set(state.layout, move.destination, null);
                Vue.set(state.layout, move.origin, move.demo);
              }
              else
              {
                console.log(move.chosen, "wakandandlkajdkljfkljsda")
                Vue.set(state.layout, move.origin, null);
                Vue.set(state.layout, move.destination, move.chosen);
              }
            break;
            case "castling":
              if(move.undo){
                let king = state.layout[move.destination];
                let castle = state.layout[move.castling.destination];
                castle.moved -= 1;
                king.moved -= 1;
                king.pos = move.origin;
                castle.pos = move.castling.origin;
                Vue.set(state.layout, move.destination, null);
                Vue.set(state.layout, move.origin, king);
                Vue.set(state.layout, move.castling.destination, null);
                Vue.set(state.layout, move.castling.origin, castle);
              }
              else{
                let king = state.layout[move.origin];
                let castle = state.layout[move.castling.origin];
                castle.moved += 1;
                king.moved += 1;
                king.pos = move.destination;
                castle.pos = move.castling.destination;
                Vue.set(state.layout, move.origin, null);
                Vue.set(state.layout, move.destination, king);
                Vue.set(state.layout, move.castling.origin, null);
                Vue.set(state.layout, move.castling.destination, castle);
              }

            break;
            default:
              if(move.undo)
              {
                let piece = state.layout[move.destination];
                if(move.deleted)
                {
                  Vue.set(state.layout, move.deleted.pos, move.deleted);
                }
                if(!move.deleted || move.deleted.pos != move.destination)
                {
                  Vue.set(state.layout, move.destination, null);
                }

                Vue.set(state.layout, move.origin, piece);
                piece.moved -= 1;
                piece.pos = move.origin;
                if(move.enpas_add)
                {
                  piece.enpas = false;
                  piece.moved -= 1;
                }
              }
              else
              {
                let piece = state.layout[move.origin];
                Vue.set(state.layout, move.origin, null);
                if(move.deleted)
                {
                  Vue.set(state.layout, move.deleted.pos, null);
                }
                Vue.set(state.layout, move.destination, piece);
                piece.moved += 1;
                piece.pos = move.destination;
                if(move.enpas_add)
                {
                  piece.enpas = true;
                  piece.moved += 1;
                }
                if(piece.check){
                  piece.check = false;
                }
              }
            break;
          }
    },
    setMoving(state, payload){
      const {piece, moving} = payload;
      Vue.set(piece, 'moving', moving);
    },
    removeMoving(state, piece)
    {
      Vue.delete(piece, 'moving');
    }
    },
  actions:{
    initialize({commit,dispatch})
    {
    // THE BOARD STATE FOR REGULAR GAME
      let pieces = [createPiece("pawn", BLACK, 8),createPiece("pawn", BLACK, 9), createPiece("pawn", BLACK, 10), createPiece("pawn", BLACK, 11), createPiece("pawn", BLACK, 12), createPiece("pawn", BLACK, 13), createPiece("pawn", BLACK, 14), createPiece("pawn", BLACK, 15),createPiece("pawn", WHITE, 48), createPiece("pawn", WHITE, 49), createPiece("pawn", WHITE, 50), createPiece("pawn", WHITE, 51), createPiece("pawn", WHITE, 52), createPiece("pawn", WHITE, 53), createPiece("pawn", WHITE, 54), createPiece("pawn", WHITE, 55), createPiece("rook", WHITE, 63), createPiece("rook", WHITE, 56), createPiece("rook", BLACK, 0), createPiece("rook", BLACK, 7), createPiece("bishop", WHITE, 58), createPiece("bishop", WHITE, 61), createPiece("horse", WHITE, 57), createPiece("horse", WHITE, 62), createPiece("king", WHITE, 60), createPiece("queen", WHITE, 59), createPiece("horse", BLACK, 1), createPiece("horse", BLACK, 6), createPiece("bishop", BLACK, 2), createPiece("bishop", BLACK, 5), createPiece("king", BLACK, 4), createPiece("queen", BLACK, 3)];
      // let pieces = [createPiece("king", WHITE, 4), createPiece("rook", WHITE, 13), createPiece("rook", WHITE, 0), createPiece("rook", BLACK, 14), createPiece('pawn', WHITE, 9, 5) ];
      let layout = Array(64).fill(null);
      pieces.forEach(piece => layout[piece.pos] = piece);
      commit('setLayout', layout);
      dispatch("calculate_moves");
    },
    setPiece({state, rootState, commit}, move){
      const {origin, destination} = move;
      if (move.undo)
      {
        const piece = state.layout[destination];
        let hor = rootState.playerColor === WHITE ? origin%8 - destination%8: -(origin%8 - destination%8);
        let vert = rootState.playerColor === WHITE ? Math.floor(origin/8) - Math.floor(destination/8) : -(Math.floor(origin/8) - Math.floor(destination/8));
        commit('setMoving', {piece:piece, moving:{hor: hor, vert: vert}});
        if(move.castling)
        {
          const {origin, destination} = move.castling;
          const piece = state.layout[destination];
          let hor = rootState.playerColor === WHITE ? origin%8 - destination%8: -(origin%8 - destination%8);
          commit('setMoving', {piece:piece, moving:{hor: hor, vert: 0, noUpdate: true}});
        }
      }
      else
      {
        const piece = state.layout[origin];
        let hor = rootState.playerColor === WHITE ? destination%8 - origin%8 : -(destination%8 - origin%8);
        let vert = rootState.playerColor === WHITE ?  Math.floor(destination/8) - Math.floor(origin/8) : - (Math.floor(destination/8) - Math.floor(origin/8));
        console.log(piece,'fdsaf', vert, hor, origin%8-destination%8, Math.floor(origin/8) - Math.floor(destination/8), "KING");
        commit('setMoving', {piece:piece, moving:{hor: hor, vert: vert}});
        if(move.castling)
        {
          const {origin, destination} = move.castling;
          const piece = state.layout[origin];
          let hor = rootState.playerColor === WHITE ? destination%8 - origin%8 : -(destination%8 - origin%8);
          commit('setMoving', {piece:piece, moving: {hor: hor, vert: 0, noUpdate: true}})
        }
      }
    },
    //TODO: add state parent to access
    toggleMoves({commit, rootState}, piece=null){

      if(piece && piece.color === rootState.turn){
        commit("setSelectedMoves", piece.show_moves());
      }
      else{
        commit("setSelectedMoves", null);
      }
    },
    endMoving({state, commit}, move)
    {
      const {origin, destination} = move;
      if(move.undo)
      {
        const piece = state.layout[destination];
        commit("removeMoving", piece);
        if(move.castling)
        {
          const piece = state.layout[move.castling.destination];
          commit("removeMoving", piece);
        }
      }
      else
      {
        const piece = state.layout[origin];
        commit("removeMoving", piece);
        if(move.castling)
        {
          const piece = state.layout[move.castling.origin];
          commit("removeMoving", piece);
        }
      }
        commit("executeMove", move);
    },
    calculate_moves({state, commit, rootState}){
      let constraints = [];
      let moves = 0;
      state.layout.filter(piece => piece && (piece.color !== rootState.turn)).forEach(piece => constraints = constraints.concat(piece.calculate_constraints(state.layout)));
      state.layout.filter(piece => piece && piece.color == rootState.turn).forEach(piece => moves += piece.determine_moves(state.layout, constraints));

      if(moves === 0)
      {
        commit("setGameOver", true, {root: true});
      }
    }
  },
};

 // const status = {
 //  state:{
 //    modalOn: false,
 //    status: null,
 //  },
 //    mutations:{
 //      setStatus(state, val){
 //        state.status = val;
 //      }
 //      setModal(state, val){
 //        state.modalOn = val;
 //      }
 //    },
 //    actions:{
 //      setModal({state}, payload)
 //      {
 //        commit("setStatus", payload.status);
 //      },
 //
 //    },
 // };

export default new Vuex.Store({
  state:{
    playerColor: WHITE,
    turn: WHITE,
    gameOver: false
  },
  mutations:{
    changeTurn(state, val)
    {
      state.turn = val;
    },

    setPlayerColor(state, val)
    {
      state.playerColor = val;
    },

    setGameOver(state, val)
    {
      state.gameOver = val;
    }
  },
  actions: {



  },
  modules:{
    animations,
    board
  }
})
