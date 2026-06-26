"use client";
export default function AdBanner({ code, isEnabled }) {
    if (!isEnabled || !code || code.length < 5) return null;
    return (
        <div className="w-full my-6 flex flex-col items-center glass-card rounded-2xl p-4">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-2">
                Advertisement
            </div>
            <div dangerouslySetInnerHTML={{ __html: code }} />
        </div>
    );
}
