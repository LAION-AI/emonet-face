export function SevenBar({ count }: { count: number }) {
    return (
    <div>
        <div class="w-full h-1 bg-gray-200">
            <div
                style={{
                    width: `${count / 7 * 100}%`,
                }}
                class="h-full bg-green-500"
            >
            </div>
        </div>
    </div>
    );
}
