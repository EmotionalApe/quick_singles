import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

interface GameState {
  player1Points: number;
  player2Points: number;
  player1Sets: number;
  player2Sets: number;
  server: 1 | 2;
}

export const TableTennisPage: React.FC = () => {
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [history, setHistory] = useState<GameState[]>([]);

  const [state, setState] = useState<GameState>({
    player1Points: 0,
    player2Points: 0,
    player1Sets: 0,
    player2Sets: 0,
    server: 1,
  });

  const handleStartMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatchStarted(true);
    // Reset state for new match
    setState({
      player1Points: 0,
      player2Points: 0,
      player1Sets: 0,
      player2Sets: 0,
      server: 1,
    });
    setHistory([]);
  };

  const calculateNextServer = (p1Pts: number, p2Pts: number, p1Sets: number, p2Sets: number): 1 | 2 => {
    const totalSets = p1Sets + p2Sets;
    const startingServer = totalSets % 2 === 0 ? 1 : 2;
    const totalPoints = p1Pts + p2Pts;

    let isServeSwitched = false;
    if (p1Pts >= 10 && p2Pts >= 10) {
      // In deuce, server changes every point
      isServeSwitched = totalPoints % 2 !== 0;
    } else {
      // Normal game, server changes every 2 points
      isServeSwitched = Math.floor(totalPoints / 2) % 2 !== 0;
    }

    if (startingServer === 1) {
      return isServeSwitched ? 2 : 1;
    } else {
      return isServeSwitched ? 1 : 2;
    }
  };

  const checkGameEnd = (p1Pts: number, p2Pts: number) => {
    if ((p1Pts >= 11 && p1Pts - p2Pts >= 2) || (p2Pts >= 11 && p2Pts - p1Pts >= 2)) {
      return p1Pts > p2Pts ? 1 : 2;
    }
    return 0;
  };

  const addPoint = (player: 1 | 2) => {
    setHistory([...history, state]);

    let newP1Pts = state.player1Points + (player === 1 ? 1 : 0);
    let newP2Pts = state.player2Points + (player === 2 ? 1 : 0);
    let newP1Sets = state.player1Sets;
    let newP2Sets = state.player2Sets;

    const winner = checkGameEnd(newP1Pts, newP2Pts);

    if (winner !== 0) {
      if (winner === 1) newP1Sets++;
      else newP2Sets++;

      newP1Pts = 0;
      newP2Pts = 0;
      // Loser of the set serves first next set. Or alternate based on set number.
      // Usually players switch serve at start of new set, but standard rule is player who served first in prev game receives first.
      // We can just keep the alternate logic or simplify. For simplicity, we just alternate based on total sets played.
      const totalSets = newP1Sets + newP2Sets;
      setState({
        player1Points: newP1Pts,
        player2Points: newP2Pts,
        player1Sets: newP1Sets,
        player2Sets: newP2Sets,
        server: totalSets % 2 === 0 ? 1 : 2,
      });
    } else {
       setState({
         ...state,
         player1Points: newP1Pts,
         player2Points: newP2Pts,
         server: calculateNextServer(newP1Pts, newP2Pts, newP1Sets, newP2Sets)
       });
    }
  };

  const undo = () => {
    if (history.length > 0) {
      const prevState = history[history.length - 1];
      setState(prevState);
      setHistory(history.slice(0, -1));
    }
  };

  const resetMatch = () => {
    setIsMatchStarted(false);
  };

  if (!isMatchStarted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f3f2f8] text-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6">
          <div className="w-full max-w-sm">
             <div className="mb-4">
              <Link
                to="/"
                className="text-xs font-bold text-slate-500 hover:text-black transition-colors"
              >
                ← Back
              </Link>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-black">
                Table Tennis
              </h1>
            </div>

            <form
              onSubmit={handleStartMatch}
              className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000] space-y-4"
            >
              <div>
                <label htmlFor="player1Name" className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Player 1 Name
                </label>
                <input
                  id="player1Name"
                  type="text"
                  required
                  maxLength={50}
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-slate-50 px-3.5 py-2 text-xs font-bold text-black placeholder-slate-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="player2Name" className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Player 2 Name
                </label>
                <input
                  id="player2Name"
                  type="text"
                  required
                  maxLength={50}
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-slate-50 px-3.5 py-2 text-xs font-bold text-black placeholder-slate-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#ffd260] py-2.5 px-4 text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all"
                >
                  Start Match
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f2f8] text-black">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 sm:px-6">
        <div className="w-full max-w-sm space-y-4">
           {/* Top Bar */}
           <div className="flex justify-between items-center bg-white rounded-xl border-2 border-black p-3 shadow-[2px_2px_0px_#000]">
             <span className="text-xs font-black uppercase tracking-wider">
               Sets: {state.player1Sets} - {state.player2Sets}
             </span>
             <button
               onClick={resetMatch}
               className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200"
             >
               End Match
             </button>
           </div>

           {/* Scoreboard */}
           <div className="grid grid-cols-2 gap-3">
             {/* Player 1 */}
             <div
                className={`relative rounded-2xl border-2 p-4 flex flex-col items-center justify-center shadow-[3px_3px_0px_#000] ${state.server === 1 ? 'border-[#ffd260] bg-[#fff9e6]' : 'border-black bg-white'}`}
             >
               {state.server === 1 && (
                 <span className="absolute top-2 right-2 text-[10px] bg-[#ffd260] border border-black rounded-full px-2 font-black uppercase shadow-[1px_1px_0px_#000]">
                   Serve
                 </span>
               )}
               <h2 className="text-sm font-bold text-slate-600 truncate w-full text-center mb-2">
                 {player1Name}
               </h2>
               <div className="text-6xl font-black text-black tabular-nums tracking-tighter">
                 {state.player1Points}
               </div>
             </div>

             {/* Player 2 */}
             <div
                className={`relative rounded-2xl border-2 p-4 flex flex-col items-center justify-center shadow-[3px_3px_0px_#000] ${state.server === 2 ? 'border-[#ffd260] bg-[#fff9e6]' : 'border-black bg-white'}`}
             >
               {state.server === 2 && (
                 <span className="absolute top-2 right-2 text-[10px] bg-[#ffd260] border border-black rounded-full px-2 font-black uppercase shadow-[1px_1px_0px_#000]">
                   Serve
                 </span>
               )}
               <h2 className="text-sm font-bold text-slate-600 truncate w-full text-center mb-2">
                 {player2Name}
               </h2>
               <div className="text-6xl font-black text-black tabular-nums tracking-tighter">
                 {state.player2Points}
               </div>
             </div>
           </div>

           {/* Controls */}
           <div className="grid grid-cols-2 gap-3 pt-4">
             <button
               onClick={() => addPoint(1)}
               className="h-16 rounded-xl border-2 border-black bg-white active:bg-slate-50 shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center"
             >
               <span className="text-lg font-black text-black">+1 Point</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase">{player1Name}</span>
             </button>
             <button
               onClick={() => addPoint(2)}
               className="h-16 rounded-xl border-2 border-black bg-white active:bg-slate-50 shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center"
             >
               <span className="text-lg font-black text-black">+1 Point</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase">{player2Name}</span>
             </button>
           </div>

           {/* Undo */}
           <div className="pt-2">
             <button
                onClick={undo}
                disabled={history.length === 0}
                className="w-full rounded-xl border-2 border-black bg-white py-3 px-4 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50 transition-all disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[2px_2px_0px_#000]"
             >
               ↩ Undo Last Point
             </button>
           </div>
        </div>
      </main>
    </div>
  );
};
