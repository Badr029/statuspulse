export default function StatusBadge({ status, isActive = true }) {
        if (!isActive) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                PAUSED
            </span>
        );
    }
    
    const isUp = status === 'up';
    const isDown = status === 'down';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isUp
                ? 'bg-green-900 text-green-300'
                :  isDown
                    ? 'bg-red-900 text-red-300'
                    : 'bg-red-800 test-grey-300'
            }`}>
            <span className={`w-2 h-2 rounded-full ${
                isUp 
                    ? 'bg-green-400' 
                    : isDown
                        ? 'bg-red-400'
                        : 'bg-grey-400'
                }`} />
        {isUp ? 'UP' : 'DOWN'}
    </span>
    );
}
