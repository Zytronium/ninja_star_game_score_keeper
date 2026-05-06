'use client';

import { useState } from 'react';
import { ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react';

type LegendProps = {
    onClose: () => void;
};

export default function Legend({ onClose }: LegendProps) {
    const [zoomed, setZoomed] = useState(false);

    return (
        <div className="min-h-screen bg-[url('/weathered_wood.jpg')] bg-cover bg-center p-4 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">

            {/* Header */}
            <div className="flex items-center gap-3 mt-6 mb-6">
    <button
        onClick={onClose}
    className="bg-white/60 backdrop-blur-md p-2 rounded-lg hover:bg-white/80 transition-colors"
    >
    <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-white drop-shadow">How to Score</h1>
    </div>

    {/* Point System */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-5 mb-4 space-y-3">
    <h2 className="font-bold text-gray-800 text-lg mb-1">Point Values</h2>

    <div className="space-y-2 text-base">
    <p>
        <span className="font-bold text-gray-500">0 pts</span>
        <span className="text-gray-700"> — A miss. The star does not stick to the board.</span>
    </p>
    <p>
        <span className="font-bold text-blue-500">1 pt</span>
        <span className="text-gray-700"> — A hit to the outermost lighter-colored board.</span>
    </p>
    <p>
        <span className="font-bold text-green-600">2 pts</span>
        <span className="text-gray-700"> — A hit to the innermost darker-colored board, outside the target.</span>
    </p>
    <p>
        <span className="font-bold text-yellow-500">3 pts</span>
        <span className="text-gray-700"> — A hit to the outermost two rings of the target, or to the white space in the corners of the target face.</span>
    </p>
    <p>
        <span className="font-bold text-orange-500">4 pts</span>
        <span className="text-gray-700"> — A hit to the innermost three rings of the target (rings 7, 8, and 9).</span>
    </p>
    <p>
        <span className="font-bold text-red-500">7 pts</span>
        <span className="text-gray-700"> — A bullseye. Dead center.</span>
    </p>
    </div>
    </div>

    {/* Metal-on-Metal Bonus */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-5 mb-4">
    <h2 className="font-bold text-gray-800 text-lg mb-2">Metal-on-Metal Bonus</h2>
    <p className="text-gray-700 text-base leading-relaxed">
        If a ninja star or throwing knife strikes a previously thrown star/knife (you can both hear and see the metal-on-metal contact) and sticks in the board, that throw earns{' '}
    <span className="font-bold text-emerald-600">3 bonus points</span>.
    To apply the bonus, press the{' '}
    <span className="font-semibold text-gray-800">Metal-on-Metal</span>{' '}
    button before tapping your score. The 3 bonus points are added automatically when you select the score value.
    </p>
    </div>

    {/* Board Diagram */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-5">
    <div className="flex items-center justify-between mb-3">
    <h2 className="font-bold text-gray-800 text-lg">Board Diagram</h2>
    <button
    onClick={() => setZoomed(!zoomed)}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 hover:bg-white rounded-lg transition-colors text-sm font-medium text-gray-700 shadow-sm"
        >
        {zoomed ? (
                <>
                    <ZoomOut className="w-4 h-4" />
                    Zoom Out
                </>
) : (
        <>
            <ZoomIn className="w-4 h-4" />
            Zoom In
    </>
)}
    </button>
    </div>

    <div className="rounded-xl overflow-hidden border border-white/40 shadow-sm">
    <img
        src={zoomed ? '/legend_2.webp' : '/legend_1.webp'}
    alt={zoomed ? 'Board diagram zoomed in' : 'Board diagram overview'}
    className="w-full object-contain transition-opacity duration-200"
        />
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
        {zoomed ? 'Showing zoomed-in view of the target rings' : 'Tap Zoom In to see the target rings up close'}
        </p>
        </div>

        </div>
        </div>
);
}
