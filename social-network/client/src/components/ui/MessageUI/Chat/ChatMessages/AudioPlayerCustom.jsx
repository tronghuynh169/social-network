import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const AudioPlayerCustom = ({ file }) => {
    console.log(file.url);
    const audioRef = useRef(null);
    const [duration, setDuration] = useState("0:00");
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;

        const updateDuration = () => {
            if (audio?.duration && isFinite(audio.duration)) {
                setDuration(formatDuration(audio.duration));
            } else {
                setDuration("..."); // hoặc ẩn
            }
        };

        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("canplaythrough", updateDuration);

        const delayCheck = setTimeout(() => {
            updateDuration();
        }, 1000);

        return () => {
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("canplaythrough", updateDuration);
            clearTimeout(delayCheck);
        };
    }, []);

    const formatDuration = (seconds) => {
        if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-3 bg-pink-300 rounded-2xl px-4 py-2 max-w-[260px] shadow-md">
            <button onClick={togglePlay} className="text-white">
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            {/* Sóng âm giả lập */}
            <div className="flex-1 flex gap-[2px] items-end h-6">
                {[6, 12, 8, 16, 10, 6, 14].map((h, i) => (
                    <div
                        key={i}
                        className="w-[2px] bg-white rounded transition-all duration-300"
                        style={{ height: `${h}px` }}
                    ></div>
                ))}
            </div>

            <span className="text-white text-sm font-medium">{duration}</span>

            <audio ref={audioRef} src={file.url} preload="metadata" hidden />
        </div>
    );
};

export default AudioPlayerCustom;
