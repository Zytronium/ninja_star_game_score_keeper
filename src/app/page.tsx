'use client';

import {useState} from 'react';

type Player = {
    name: string;
    rounds: number[][];
    totalScore: number;
};

type GameState = 'setup' | 'playing' | 'finished';

export default function Home() {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [numRounds, setNumRounds] = useState(5);
    const [numPlayers, setNumPlayers] = useState(2);
    const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [currentRound, setCurrentRound] = useState(0);
    const [currentThrow, setCurrentThrow] = useState(0);
    const [currentRoundScores, setCurrentRoundScores] = useState<number[]>([]);
    const [metalBonus, setMetalBonus] = useState(false);

    const startGame = () => {
        const initialPlayers: Player[] = playerNames.map(name => ({
            name,
            rounds: Array(numRounds).fill([]),
            totalScore: 0,
        }));
        setPlayers(initialPlayers);
        setCurrentPlayerIndex(0);
        setCurrentRound(0);
        setCurrentThrow(0);
        setCurrentRoundScores([]);
        setGameState('playing');
    };

    const recordThrow = (points: number) => {
        const finalPoints = points + (metalBonus ? 1 : 0);
        const newScores = [...currentRoundScores, finalPoints];
        setCurrentRoundScores(newScores);
        setMetalBonus(false);

        if (currentThrow === 3) {
            const updatedPlayers = [...players];
            updatedPlayers[currentPlayerIndex].rounds[currentRound] = newScores;
            updatedPlayers[currentPlayerIndex].totalScore += newScores.reduce((a, b) => a + b, 0);
            setPlayers(updatedPlayers);

            if (currentPlayerIndex === players.length - 1) {
                if (currentRound === numRounds - 1) {
                    setGameState('finished');
                } else {
                    setCurrentRound(currentRound + 1);
                    setCurrentPlayerIndex(0);
                }
            } else {
                setCurrentPlayerIndex(currentPlayerIndex + 1);
            }

            setCurrentThrow(0);
            setCurrentRoundScores([]);
        } else {
            setCurrentThrow(currentThrow + 1);
        }
    };

    const resetGame = () => {
        setGameState('setup');
        setNumRounds(3);
        setNumPlayers(2);
        setPlayerNames(['Player 1', 'Player 2']);
        setPlayers([]);
        setCurrentPlayerIndex(0);
        setCurrentRound(0);
        setCurrentThrow(0);
        setCurrentRoundScores([]);
    };

    if (gameState === 'setup') {
        return (
            <div className="min-h-screen bg-[url('/weathered_wood.jpg')] bg-cover bg-center p-4 flex flex-col">
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                    <h1 className="text-4xl font-bold text-white text-center mt-8 mb-8">Score</h1>

                <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg p-6 space-y-6">
                <div>
                            <label className="block text-gray-700 font-semibold mb-2">Number of Rounds</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={numRounds}
                                onChange={(e) => setNumRounds(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-black"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Number of Players</label>
                            <input
                                type="number"
                                min="1"
                                max="8"
                                value={numPlayers}
                                onChange={(e) => {
                                    const num = parseInt(e.target.value) || 0;
                                    setNumPlayers(num);
                                    setPlayerNames(Array(num).fill('').map((_, i) =>
                                        playerNames[i] || `Player ${i + 1}`
                                    ));
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-black"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Player Names</label>
                            <div className="space-y-2">
                                {playerNames.map((name, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            const newNames = [...playerNames];
                                            newNames[index] = e.target.value;
                                            setPlayerNames(newNames);
                                        }}
                                        placeholder={`Player ${index + 1}`}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black"
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        const currentPlayer = players[currentPlayerIndex];
        const currentTurnScore = currentRoundScores.reduce((a, b) => a + b, 0);

        return (
            <div className="min-h-screen bg-[url('/weathered_wood.jpg')] bg-cover bg-center p-4 flex flex-col">
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg p-4 mb-4">
                <div className="text-center mb-2">
                            <div className="text-sm text-gray-500">Round {currentRound + 1} of {numRounds}</div>
                            <div className="text-sm text-gray-500">Throw {currentThrow + 1} of 4</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{currentPlayer.name}</div>
                            <div className="text-lg text-gray-600">This Turn: {currentTurnScore} pts</div>
                        </div>
                    </div>

                <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg p-4 mb-4 flex-1 overflow-auto">
                <h3 className="font-semibold text-gray-700 mb-3">Scoreboard</h3>
                        <div className="space-y-2">
                            {players.map((player, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg ${
                                        index === currentPlayerIndex ? 'bg-indigo-100 border-2 border-indigo-400' : 'bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">{player.name}</span>
                                        <span className="text-xl font-bold text-indigo-600">{player.totalScore}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg p-4">
                    {/* Bonus Toggle */}
                    <button
                        onClick={() => setMetalBonus(!metalBonus)}
                        className={`w-full mb-3 py-3 rounded-lg font-bold text-lg transition-colors ${
                            metalBonus
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                        }`}
                    >
                        +1 Metal-on-Metal {metalBonus ? '✓' : ''}
                    </button>

                    {/* Score Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <button
                            onClick={() => recordThrow(0)}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-lg text-xl"
                        >
                            0
                        </button>
                        <button
                            onClick={() => recordThrow(1)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-xl"
                        >
                            1
                        </button>
                        <button
                            onClick={() => recordThrow(2)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg text-xl"
                        >
                            2
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <button
                            onClick={() => recordThrow(3)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-lg text-xl"
                        >
                            3
                        </button>
                        <button
                            onClick={() => recordThrow(4)}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg text-xl"
                        >
                            4
                        </button>
                        <button
                            onClick={() => recordThrow(7)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg text-xl"
                        >
                            🎯 7
                        </button>
                    </div>
                  </div>
                </div>
            </div>
        );
    }

    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

    return (
        <div className="min-h-screen bg-[url('/weathered_wood.jpg')] bg-cover bg-center p-4 flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
                <h1 className="text-4xl font-bold text-white text-center mt-8 mb-8">🏆 Game Over!</h1>

            <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-2xl font-bold text-center mb-4">Final Standings</h2>
                    <div className="space-y-3">
                        {sortedPlayers.map((player, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg ${
                                    index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}</span>
                                        <span className="font-bold text-lg">{player.name}</span>
                                    </div>
                                    <span className="text-2xl font-bold text-indigo-600">{player.totalScore}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg p-6 mb-4 flex-1 overflow-auto">
            <h3 className="text-xl font-bold mb-4">Round by Round</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b-2 border-gray-300">
                                <th className="text-left py-2 px-2">Player</th>
                                {Array.from({length: numRounds}, (_, i) => (
                                    <th key={i} className="text-center py-2 px-2">R{i + 1}</th>
                                ))}
                                <th className="text-right py-2 px-2 font-bold">Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {players.map((player, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-2 px-2 font-semibold">{player.name}</td>
                                    {player.rounds.map((round, roundIndex) => (
                                        <td key={roundIndex} className="text-center py-2 px-2">
                                            {round.reduce((a, b) => a + b, 0)}
                                        </td>
                                    ))}
                                    <td className="text-right py-2 px-2 font-bold text-indigo-600">
                                        {player.totalScore}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <button
                    onClick={resetGame}
                    className="bg-white/60 backdrop-blur-md hover:bg-white/90 text-indigo-600 font-bold py-4 rounded-lg text-lg transition-colors mb-4"
                >
                    New Game
                </button>
            </div>
        </div>
    );
}
