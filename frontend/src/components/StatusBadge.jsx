export default function StatusBadge({ status, isActive = true }) {
        if (!isActive) {
        return (
            <span data-testid="status-badge" data-status="paused" className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs font-bold text-[#c4d5ce]">
                <span className="h-2 w-2 rounded-full bg-[#879b92]" />
                PAUSED
            </span>
        );
    }
    
    const isUp = status === 'up';
    const isDown = status === 'down';
    return (
        <span data-testid="status-badge" data-status={isUp ? 'up' : isDown ? 'down' : 'unknown'} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${
            isUp
                ? 'border-[#50e89a]/35 bg-[#50e89a]/12 text-[#6ff2ae]'
                :  isDown
                    ? 'border-red-400/35 bg-red-500/12 text-red-200'
                    : 'border-white/15 bg-white/5 text-[#c4d5ce]'
            }`}>
            <span className={`h-2 w-2 rounded-full ${
                isUp 
                    ? 'bg-[#50e89a]' 
                    : isDown
                        ? 'bg-red-400'
                        : 'bg-[#879b92]'
                }`} />
        {isUp ? 'UP' : isDown ? 'DOWN' : 'UNKNOWN'}
    </span>
    );
}
