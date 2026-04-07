"use client";

import { useState } from "react";
import { CMSVideo } from "@/lib/supabase";
import SectionHeader from "@/components/SectionHeader";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function VideoCard({ video }: { video: CMSVideo }) {
  const [playing, setPlaying] = useState(false);

  if (video.source === "upload" && video.video_url) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-black">
        <video
          src={video.video_url}
          controls
          className="w-full aspect-video object-cover"
          preload="metadata"
        />
        <div className="p-4 bg-white">
          <p className="text-sm font-semibold text-dark line-clamp-1">{video.title}</p>
        </div>
      </div>
    );
  }

  const vid = video.youtube_url ? getYouTubeId(video.youtube_url) : null;
  if (!vid) return null;

  return (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-black">
      {playing ? (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="relative w-full aspect-video group block"
          aria-label={`Play ${video.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
              <svg className="w-6 h-6 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white text-sm font-semibold line-clamp-1">{video.title}</p>
          </div>
        </button>
      )}
    </div>
  );
}

export default function VideoSection({ videos }: { videos: CMSVideo[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="py-24 px-[5%]">
      <SectionHeader
        tag="EXPERIENCE IT FIRST"
        title="See Hidden Paradise in Action"
        description="Watch our highlights, events, and nature moments straight from the park."
      />
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
}
