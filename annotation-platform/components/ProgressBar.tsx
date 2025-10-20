export function ProgressBar({ index, total }: { index: number, total: number }) {
    return (
        <div class="w-full h-1 bg-gray-200">
            <div
                style={{
                    width: `${index / total * 100}%`,
                }}
                class="h-full bg-green-500"
            >
            </div>
        </div>
    );
}
