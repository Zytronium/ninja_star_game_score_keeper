'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Calendar, Loader2, Swords, ChevronLeft, Award, Medal } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — mirror your Firestore document shape exactly
// ─────────────────────────────────────────────────────────────────────────────

export type ScoreEntry = {
    id: string;           // Firestore document ID
    playerName: string;
    totalScore: number;
    numRounds: number;    // used to filter by game length
    rounds: number[];     // per-round totals — e.g. [13, 10, 11, …]
    playedAt: Date;       // stored as Firestore Timestamp, converted on read
};

export type LeaderboardClass = 'S' | 'A' | 'B';

// ─────────────────────────────────────────────────────────────────────────────
// DATA HOOK
// ─────────────────────────────────────────────────────────────────────────────

function useLeaderboard(numRounds: number, cls: LeaderboardClass) {
    const [entries, setEntries] = useState<ScoreEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const q = query(
            collection(db, getCollectionName(cls)),
            where('numRounds', '==', numRounds),
            orderBy('totalScore', 'desc'),
            limit(10),
        );

        getDocs(q)
            .then(snapshot => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    playedAt: (doc.data() as any).playedAt?.toDate() ?? new Date(),
                })) as ScoreEntry[];
                setEntries(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [numRounds, cls]);

    return { entries, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function barWidth(score: number, topScore: number) {
    return topScore ? Math.round((score / topScore) * 100) : 0;
}

function nextClass(cls: LeaderboardClass): LeaderboardClass {
    switch (cls) {
        case 'S':
            return 'S';
        case 'A':
            return 'S';
        case 'B':
            return 'A';
        default: // should be impossible; default to A
            return 'A';
    }
}

function prevClass(cls: LeaderboardClass): LeaderboardClass {
    switch (cls) {
        case 'S':
            return 'A';
        case 'A':
            return 'B';
        case 'B':
            return 'B';
        default: // should be impossible; default to A
            return 'A';
    }
}

export function getClassFromDistance(distance: number): LeaderboardClass {
    if (distance === 20) return 'S';
    if (distance === 17) return 'A';
    return 'B'; // 14ft
}

export function getDistanceFromClass(cls: LeaderboardClass): number {
    if (cls === 'S') return 20;
    if (cls === 'A') return 17;
    return 14;
}

function getCollectionName(cls: LeaderboardClass) {
    return `Leaderboard ${cls}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
    if (rank === 0) {
        return (
            <span className="w-8 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-400" />
            </span>
        );
    }
    if (rank === 1) {
        return (
            <span className="w-8 flex items-center justify-center">
                <Award className="w-6 h-6 text-slate-400 fill-slate-300" />
            </span>
        );
    }
    if (rank === 2) {
        return (
            <span className="w-8 flex items-center justify-center">
                <Medal className="w-6 h-6 text-amber-700 fill-amber-600" />
            </span>
        );
    }
    return (
        <span className="w-8 text-center text-sm font-bold text-gray-400 tabular-nums">
            #{rank + 1}
        </span>
    );
}

function ScoreRow({
                      entry,
                      rank,
                      topScore,
                      animDelay,
                  }: {
    entry: ScoreEntry;
    rank: number;
    topScore: number;
    animDelay: number;
}) {
    const isTop = rank === 0;
    const width = barWidth(entry.totalScore, topScore);

    return (
        <div
            className="leaderboard-row relative overflow-hidden rounded-xl mb-2"
            style={{ animationDelay: `${animDelay}ms` }}
        >
            {/* Background bar */}
            <div
                className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700"
                style={{
                    width: `${width}%`,
                    background: isTop
                        ? 'linear-gradient(90deg, rgba(250,204,21,0.35), rgba(250,204,21,0.08))'
                        : 'linear-gradient(90deg, rgba(99,102,241,0.22), rgba(99,102,241,0.04))',
                }}
            />

            <div
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors
          ${isTop
                    ? 'border-yellow-400/80 bg-yellow-50/90'
                    : 'border-white/60 bg-white/80'
                }`}
            >
                <RankBadge rank={rank} />

                <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${isTop ? 'text-yellow-900' : 'text-gray-900'}`}>
                        {entry.playerName}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.playedAt)}
                    </p>
                </div>

                <div className="text-right shrink-0">
                    <span className={`text-2xl font-black tabular-nums ${isTop ? 'text-yellow-800' : 'text-indigo-700'}`}>
                        {entry.totalScore}
                    </span>
                    <p className="text-xs text-gray-500">pts</p>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Leaderboard({
    onClose,
    initialClass = 'A',
    initialRounds = 5,
}: {
    onClose?: () => void;
    initialClass?: LeaderboardClass;
    initialRounds?: number;
}) {
    const [selectedRounds, setSelectedRounds] = useState(initialRounds);
    const [roundInputValue, setRoundInputValue] = useState(String(initialRounds));
    const [classInputValue, setClassInputValue] = useState<string>(initialClass);
    const [selectedClass, setSelectedClass] = useState<LeaderboardClass>(initialClass);
    const { entries, loading, error } = useLeaderboard(selectedRounds, selectedClass);

    const topScore = entries[0]?.totalScore ?? 0;

    function handleRoundsChange(e: React.ChangeEvent<HTMLInputElement>) {
        setRoundInputValue(e.target.value);
        const parsed = parseInt(e.target.value, 10);
        if (!isNaN(parsed) && parsed >= 1) {
            setSelectedRounds(parsed);
        }
    }

    function handleRoundsBlur() {
        const parsed = parseInt(roundInputValue, 10);
        if (isNaN(parsed) || parsed < 1) {
            setRoundInputValue('5');
            setSelectedRounds(5);
        } else {
            setRoundInputValue(String(parsed));
            setSelectedRounds(parsed);
        }
    }

    function handleClassChange(e: React.ChangeEvent<HTMLInputElement>) {
        const cls = e.target.value.toUpperCase();
        setClassInputValue(cls);
        if (['S', 'A', 'B'].includes(cls)) {
            setSelectedClass(cls as LeaderboardClass);
        }
    }

    function handleClassBlur() {
        const cls = classInputValue.toUpperCase();
        if (!['S', 'A', 'B'].includes(cls)) {
            setClassInputValue('A');
            setSelectedClass('A');
        } else {
            setClassInputValue(cls);
            setSelectedClass(cls as LeaderboardClass);
        }
    }

    // Distance label shown next to the class selector
    const distanceLabel: Record<LeaderboardClass, string> = { S: '20ft', A: '17ft', B: '14ft' };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

        .leaderboard-font { font-family: 'Cinzel', serif; }
        .body-font        { font-family: 'DM Sans', sans-serif; }

        .leaderboard-row {
          animation: slideIn 0.4s ease both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .rounds-input {
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255,255,255,0.6);
          border-radius: 0.75rem;
          color: #1f2937;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
          outline: none;
          width: 3rem;
          padding: 0.5rem 0.25rem;
          -moz-appearance: textfield;
        }
        .rounds-input::-webkit-outer-spin-button,
        .rounds-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .rounds-input:focus {
          background: rgba(255,255,255,0.75);
          border-color: rgba(99,102,241,0.7);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
        }

        .rounds-stepper {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rounds-stepper button {
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 6px;
          color: #4b5563;
          cursor: pointer;
          font-size: 0.65rem;
          font-weight: 700;
          line-height: 1;
          padding: 3px 7px;
          transition: background 0.15s;
          user-select: none;
        }
        .rounds-stepper button:hover {
          background: rgba(255,255,255,0.75);
          color: #1f2937;
        }
      `}</style>

            <div className="min-h-screen bg-[url('/weathered_wood.jpg')] bg-cover bg-center p-4 flex flex-col body-font">
                <div className="max-w-md mx-auto w-full flex-1 flex flex-col">

                    {/* ── Header ───────────────────────────────────────────────────── */}
                    <div className="text-center mt-8 mb-6 relative">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md p-2 rounded-lg hover:bg-white/80 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                        )}
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Swords className="w-6 h-6 text-yellow-300 drop-shadow" />
                            <h1 className="leaderboard-font text-3xl font-black text-white drop-shadow-lg tracking-wide">
                                Leaderboard
                            </h1>
                            <Swords className="w-6 h-6 text-yellow-300 drop-shadow scale-x-[-1]" />
                        </div>
                        <p className="text-white/70 text-sm">All-time best individual scores</p>
                    </div>

                    {/* ── Round & Class Selector ────────────────────────────────────────────── */}
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex items-center justify-center gap-3 mb-5 shadow-inner flex-wrap">
                        <span className="text-white/80 text-sm font-semibold">Rounds:</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                value={roundInputValue}
                                onChange={handleRoundsChange}
                                onBlur={handleRoundsBlur}
                                className="rounds-input"
                            />
                            <div className="rounds-stepper">
                                <button
                                    onClick={() => {
                                        const next = selectedRounds + 1;
                                        setSelectedRounds(next);
                                        setRoundInputValue(String(next));
                                    }}
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => {
                                        const next = Math.max(1, selectedRounds - 1);
                                        setSelectedRounds(next);
                                        setRoundInputValue(String(next));
                                    }}
                                >
                                    ▼
                                </button>
                            </div>
                        </div>

                        <span className="text-white/80 text-sm font-semibold">Class:</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={classInputValue}
                                onChange={handleClassChange}
                                onBlur={handleClassBlur}
                                className="rounds-input"
                            />
                            <div className="rounds-stepper">
                                <button
                                    onClick={() => {
                                        const next = nextClass(selectedClass);
                                        setSelectedClass(next);
                                        setClassInputValue(next);
                                    }}
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => {
                                        const next = prevClass(selectedClass);
                                        setSelectedClass(next);
                                        setClassInputValue(next);
                                    }}
                                >
                                    ▼
                                </button>
                            </div>
                            <span className="text-white/60 text-xs font-medium">
                                {distanceLabel[selectedClass]}
                            </span>
                        </div>
                    </div>

                    {/* ── Board ─────────────────────────────────────────────────────── */}
                    <div className="flex-1">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                <p className="text-white/70 text-sm">Loading scores…</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100/70 backdrop-blur-md rounded-xl p-4 text-red-700 text-sm text-center">
                                Failed to load scores: {error}
                            </div>
                        )}

                        {!loading && !error && entries.length === 0 && (
                            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-10 text-center">
                                <Trophy className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-semibold">No scores yet</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Play a {selectedRounds}-round Class {selectedClass} game to get on the board!
                                </p>
                            </div>
                        )}

                        {!loading && !error && entries.length > 0 && (
                            <>
                                <div className="bg-yellow-100/95 border border-yellow-400/80 rounded-2xl p-4 mb-4 flex items-center gap-3">
                                    <Star className="w-7 h-7 text-yellow-400 shrink-0 fill-yellow-300" />
                                    <div>
                                        <p className="text-xs text-amber-900 font-medium uppercase tracking-wider">
                                            Record — {selectedRounds} rounds · Class {selectedClass} · {distanceLabel[selectedClass]}
                                        </p>
                                        <p className="text-gray-900 font-black text-xl leading-tight">
                                            {entries[0].playerName}
                                            <span className="text-amber-800 ml-2">{topScore} pts</span>
                                        </p>
                                    </div>
                                </div>

                                {entries.map((entry, i) => (
                                    <ScoreRow
                                        key={entry.id}
                                        entry={entry}
                                        rank={i}
                                        topScore={topScore}
                                        animDelay={i * 60}
                                    />
                                ))}
                            </>
                        )}
                    </div>

                    <p className="text-center text-white/30 text-xs pb-6 pt-4">
                        Top 10 scores per round count · per distance class
                    </p>
                </div>
            </div>
        </>
    );
}
