'use client';

import {useState} from 'react';
import {Pencil, ChevronLeft} from 'lucide-react';

type Player = {
    name: string;
    rounds: number[][];
    totalScore: number;
};

type GameState = 'setup' | 'playing' | 'editing' | 'finished';

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

    // Edit state
    const [editPlayerIndex, setEditPlayerIndex] = useState(0);
    const [editRoundIndex, setEditRoundIndex] = useState<number | null>(null);
    const [editThrowIndex, setEditThrowIndex] = useState<number | null>(null);
    const [editStep, setEditStep] = useState<'selectPlayer' | 'selectRound' | 'selectThrow' | 'selectScore'>('selectPlayer');
    const [editMetalBonus, setEditMetalBonus] = useState(false);

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

    const openEditMode = () => {
        setEditPlayerIndex(0);
        setEditRoundIndex(null);
        setEditThrowIndex(null);
        setEditStep('selectPlayer');
        setGameState('editing');
    };

    const applyEdit = (basePoints: number) => {
        if (editPlayerIndex === null || editRoundIndex === null || editThrowIndex === null) return;

        const newScore = basePoints + (editMetalBonus ? 1 : 0);

        const updatedPlayers = [...players];
        const player = {...updatedPlayers[editPlayerIndex]};
        const rounds = player.rounds.map(r => [...r]);

        const oldScore = rounds[editRoundIndex][editThrowIndex];
        rounds[editRoundIndex][editThrowIndex] = newScore;

        player.rounds = rounds;
        player.totalScore = player.totalScore - oldScore + newScore;
        updatedPlayers[editPlayerIndex] = player;
        setPlayers(updatedPlayers);

        setEditRoundIndex(null);
        setEditThrowIndex(null);
        setEditMetalBonus(false);
        setEditStep('selectPlayer');
        setGameState('playing');
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

    // ── EDIT SCREEN ──────────────────────────────────────────────────────────
    if (gameState === 'editing') {
        const editPlayer = players[editPlayerIndex];

        return (
            <div className="min-h-screen bg-[url('/weathered_wood.jpg')] bg-cover bg-center p-4 flex flex-col">
                <div className="max-w-md mx-auto w-full flex-1 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center gap-3 mt-6 mb-6">
                        <button
                            onClick={() => {
                                if (editStep === 'selectPlayer') {
                                    setGameState('playing');
                                } else if (editStep === 'selectRound') {
                                    setEditStep('selectPlayer');
                                } else if (editStep === 'selectThrow') {
                                    setEditStep('selectRound');
                                    setEditRoundIndex(null);
                                } else if (editStep === 'selectScore') {
                                    setEditStep('selectThrow');
                                    setEditThrowIndex(null);
                                }
                            }}
                            className="bg-white/60 backdrop-blur-md p-2 rounded-lg hover:bg-white/80 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <h1 className="text-2xl font-bold text-white drop-shadow">Edit Score</h1>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-5 space-y-4">

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
                            <span className={editStep === 'selectPlayer' ? 'text-indigo-600 font-semibold' : ''}>Player</span>
                            <span>›</span>
                            <span className={editStep === 'selectRound' ? 'text-indigo-600 font-semibold' : ''}>Round</span>
                            <span>›</span>
                            <span className={editStep === 'selectThrow' ? 'text-indigo-600 font-semibold' : ''}>Throw</span>
                            <span>›</span>
                            <span className={editStep === 'selectScore' ? 'text-indigo-600 font-semibold' : ''}>New Score</span>
                        </div>

                        {/* Step 1: Select Player */}
                        {editStep === 'selectPlayer' && (
                            <div className="space-y-3">
                                <p className="text-gray-700 font-semibold">Select a player</p>
                                {players.map((player, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setEditPlayerIndex(idx);
                                            setEditStep('selectRound');
                                        }}
                                        className="w-full flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        <span className="font-semibold text-gray-800">{player.name}</span>
                                        <span className="text-indigo-600 font-bold">{player.totalScore} pts</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Select Round */}
                        {editStep === 'selectRound' && (
                            <div className="space-y-3">
                                <p className="text-gray-700 font-semibold">
                                    Select a round for <span className="text-indigo-600">{editPlayer.name}</span>
                                </p>
                                {editPlayer.rounds.map((round, idx) => {
                                    const hasData = round.length > 0;
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!hasData}
                                            onClick={() => {
                                                setEditRoundIndex(idx);
                                                setEditStep('selectThrow');
                                            }}
                                            className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border transition-colors text-left ${
                                                hasData
                                                    ? 'bg-white border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
                                                    : 'bg-gray-100 border-gray-100 opacity-40 cursor-not-allowed'
                                            }`}
                                        >
                                            <span className="font-semibold text-gray-800">Round {idx + 1}</span>
                                            {hasData ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">{round.join(', ')}</span>
                                                    <span className="text-indigo-600 font-bold">
                                                        {round.reduce((a, b) => a + b, 0)} pts
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Not played</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Step 3: Select Throw */}
                        {editStep === 'selectThrow' && editRoundIndex !== null && (
                            <div className="space-y-3">
                                <p className="text-gray-700 font-semibold">
                                    Select a throw to edit — <span className="text-indigo-600">{editPlayer.name}</span>, Round {editRoundIndex + 1}
                                </p>
                                {editPlayer.rounds[editRoundIndex].map((score, throwIdx) => (
                                    <button
                                        key={throwIdx}
                                        onClick={() => {
                                            setEditThrowIndex(throwIdx);
                                            setEditStep('selectScore');
                                        }}
                                        className="w-full flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                                    >
                                        <span className="font-semibold text-gray-800">Throw {throwIdx + 1}</span>
                                        <span className="text-indigo-600 font-bold text-lg">{score} pts</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 4: Select New Score */}
                        {editStep === 'selectScore' && editRoundIndex !== null && editThrowIndex !== null && (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-700 font-semibold mb-1">
                                        Choose new score for <span className="text-indigo-600">{editPlayer.name}</span>
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        Round {editRoundIndex + 1} · Throw {editThrowIndex + 1} · Currently:{' '}
                                        <span className="font-bold text-indigo-600">
                                            {editPlayer.rounds[editRoundIndex][editThrowIndex]} pts
                                        </span>
                                    </p>
                                </div>

                                {/* Metal bonus toggle — identical to playing screen */}
                                            <button
                                    onClick={() => setEditMetalBonus(!editMetalBonus)}
                                    className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                                        editMetalBonus
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                                }`}
                                            >
                                    +1 Metal-on-Metal {editMetalBonus ? '✓' : ''}
                                            </button>

                                {/* Score grid — identical layout to playing screen */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => applyEdit(0)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-lg text-xl">0</button>
                                    <button onClick={() => applyEdit(1)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-xl">1</button>
                                    <button onClick={() => applyEdit(2)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg text-xl">2</button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => applyEdit(3)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-lg text-xl">3</button>
                                    <button onClick={() => applyEdit(4)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg text-xl">4</button>
                                    <button onClick={() => applyEdit(7)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg text-xl">🎯 7</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── SETUP ─────────────────────────────────────────────────────────────────
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

    // ── PLAYING ───────────────────────────────────────────────────────────────
    if (gameState === 'playing') {
        const currentPlayer = players[currentPlayerIndex];
        const currentTurnScore = currentRoundScores.reduce((a, b) => a + b, 0);

        return (
            <div className="min-h-screen bg-[url('/weathered_wood.jpg')] bg-cover bg-center p-4 flex flex-col">
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg p-4 mb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                <div className="text-center mb-2">
                            <div className="text-sm text-gray-500">Round {currentRound + 1} of {numRounds}</div>
                            <div className="text-sm text-gray-500">Throw {currentThrow + 1} of 4</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{currentPlayer.name}</div>
                            <div className="text-lg text-gray-600">This Turn: {currentTurnScore} pts</div>
                        </div>
                    </div>
                        {/* Edit Button */}
                        <button
                            onClick={openEditMode}
                            className="ml-2 p-2 bg-white/70 hover:bg-white rounded-lg transition-colors shadow-sm"
                            title="Edit a previous score"
                        >
                            <Pencil className="w-5 h-5 text-gray-600" />
                        </button>
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

    // ── FINISHED ──────────────────────────────────────────────────────────────
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
