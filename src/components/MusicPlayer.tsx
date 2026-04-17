import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// 自动扫描 public/music 下的 mp3 文件
const musicFiles = import.meta.glob('/public/music/*.mp3', { eager: true, query: '?url', import: 'default' });

function getMusicList(): { name: string; url: string }[] {
  return Object.entries(musicFiles).map(([path, url]) => {
    const fileName = path.split('/').pop()?.replace('.mp3', '') ?? 'Unknown';
    return { name: fileName, url: url as string };
  });
}

type PlayMode = 'loop-all' | 'loop-one';

export function MusicPlayer() {
  const [songs] = useState(() => getMusicList());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('loop-all');
  const [volume, setVolume] = useState(0.3);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = songs[currentIndex] ?? null;
  const hasSongs = songs.length > 0;

  // 初始化 audio
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // 切歌时加载
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.src = currentSong.url;
    audio.loop = playMode === 'loop-one';

    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentIndex, currentSong, playMode]);

  // 歌曲播放结束
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (playMode === 'loop-all') {
        setCurrentIndex(prev => (prev + 1) % songs.length);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [playMode, songs.length]);

  // 音量变化
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, currentSong]);

  const playNext = useCallback(() => {
    if (songs.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % songs.length);
    setIsPlaying(true);
  }, [songs.length]);

  const playPrev = useCallback(() => {
    if (songs.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  }, [songs.length]);

  const toggleMode = useCallback(() => {
    setPlayMode(prev => {
      const next = prev === 'loop-all' ? 'loop-one' : 'loop-all';
      if (audioRef.current) audioRef.current.loop = next === 'loop-one';
      return next;
    });
  }, []);

  if (!hasSongs) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-sm cute-border px-4 py-2 text-xs text-muted-foreground">
          🎵 请在 public/music/ 放入 mp3 文件
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={cn(
        'bg-white/95 backdrop-blur-sm cute-border transition-all duration-300',
        expanded ? 'w-72 p-4' : 'w-auto p-2'
      )}>
        {/* 折叠态 - 只显示小按钮 */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <span>{isPlaying ? '🎵' : '🔇'}</span>
            <span className="max-w-[120px] truncate text-xs">{currentSong?.name ?? '音乐'}</span>
          </button>
        )}

        {/* 展开态 */}
        {expanded && (
          <div className="space-y-3">
            {/* 标题行 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">🎵 音乐播放器</span>
              <button
                onClick={() => setExpanded(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                收起
              </button>
            </div>

            {/* 当前歌曲 */}
            <div className="text-xs text-primary font-medium truncate">
              {currentSong?.name}
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={playPrev} className="text-lg hover:scale-110 transition-transform">⏮</button>
              <button onClick={togglePlay} className="text-2xl hover:scale-110 transition-transform">
                {isPlaying ? '⏸' : '▶️'}
              </button>
              <button onClick={playNext} className="text-lg hover:scale-110 transition-transform">⏭</button>
              <button
                onClick={toggleMode}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  playMode === 'loop-one'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {playMode === 'loop-all' ? '列表循环' : '单曲循环'}
              </button>
            </div>

            {/* 音量 */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1 accent-primary"
              />
              <span className="text-muted-foreground w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>

            {/* 歌曲列表 */}
            <div className="max-h-32 overflow-y-auto space-y-1">
              {songs.map((song, idx) => (
                <button
                  key={song.url}
                  onClick={() => { setCurrentIndex(idx); setIsPlaying(true); }}
                  className={cn(
                    'w-full text-left text-xs px-2 py-1 rounded transition-colors truncate',
                    idx === currentIndex
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {idx === currentIndex && isPlaying ? '♪ ' : ''}{song.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
