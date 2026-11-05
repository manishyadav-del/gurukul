"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  HelpCircle,
  FileText,
  Bookmark,
  UserCheck,
  Users,
  Search,
  Plus,
  ThumbsUp,
  MessageCircle,
  Share2,
  Compass,
  Sparkles,
  BookOpen,
  Brain,
  Flame,
  Leaf,
} from "lucide-react";

export default function KnowledgeCommunityView() {
  const [selectedTab, setSelectedTab] = useState("all-discussions");
  const [filterTab, setFilterTab] = useState("Latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostModal, setNewPostModal] = useState(false);

  const sidebarNav = [
    { id: "all-discussions", label: "All Discussions", icon: MessageSquare },
    { id: "ask-question", label: "Ask a Question", icon: HelpCircle },
    { id: "my-posts", label: "My Posts", icon: FileText },
    { id: "saved", label: "Saved", icon: Bookmark },
    { id: "following", label: "Following", icon: UserCheck },
    { id: "groups", label: "Groups", icon: Users },
  ];

  const popularTopics = [
    { label: "Vedic Astrology", count: 420 },
    { label: "Spirituality", count: 312 },
    { label: "Ancient Texts", count: 285 },
    { label: "Life & Philosophy", count: 194 },
    { label: "Meditation", count: 168 },
    { label: "Ayurveda", count: 142 },
  ];

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Ananya Sharma",
      time: "2 hrs ago",
      tag: "Vedic Astrology",
      title: "Impact of Saturn Transit on Career Growth",
      content:
        "How does Shani's transit in Pisces affect career for Taurus rising? Looking for insights from experienced practitioners.",
      likes: 24,
      liked: false,
      replies: 8,
      avatar: "AS",
      avatarBg: "bg-amber-100 text-amber-800",
    },
    {
      id: 2,
      author: "Rohit Verma",
      time: "4 hours ago",
      tag: "Spirituality",
      title: "Best practices for daily meditation",
      content:
        "What time of day works best for meditation according to our scriptures? Does Brahma Muhurta make a perceptible difference in mind stability?",
      likes: 16,
      liked: false,
      replies: 5,
      avatar: "RV",
      avatarBg: "bg-emerald-100 text-emerald-800",
    },
    {
      id: 3,
      author: "Meera Iyer",
      time: "1 day ago",
      tag: "Ancient Texts",
      title: "Meaning of a verse from the Upanishads",
      content:
        "Can someone help explain this verse from Katha Upanishad in simple terms? 'Uttisthata jagrata prapya varan nibodhata' — how should one apply this in modern daily routines?",
      likes: 32,
      liked: false,
      replies: 12,
      avatar: "MI",
      avatarBg: "bg-sky-100 text-sky-800",
    },
  ]);

  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          return {
            ...post,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
            liked: !post.liked,
          };
        }
        return post;
      })
    );
  };

  return (
    <div className="bg-[#fcfaf5] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 xl:col-span-3 space-y-4">
            {/* Primary Navigation */}
            <div className="bg-white rounded-2xl border border-[#ede5d6] p-3 shadow-2xs space-y-1">
              {sidebarNav.map((item) => {
                const Icon = item.icon;
                const isActive = selectedTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left cursor-pointer ${
                      isActive
                        ? "bg-[#13382c] text-white shadow-xs font-semibold"
                        : "text-stone-700 hover:bg-[#faf7f0] hover:text-[#13382c]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-[#d4a359]" : "text-stone-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Popular Topics */}
            <div className="bg-white rounded-2xl border border-[#ede5d6] p-4 shadow-2xs space-y-3">
              <h3 className="font-serif font-bold text-sm text-stone-900">
                Popular Topics
              </h3>
              <div className="space-y-1.5 text-xs">
                {popularTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(topic.label)}
                    className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#faf7f0] text-stone-600 hover:text-[#13382c] transition cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[#c4903c] font-bold">#</span>
                      {topic.label}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {topic.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Community Feed */}
          <main className="lg:col-span-9 xl:col-span-9 space-y-5">
            {/* Top Bar: Title & New Post Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
                  Knowledge Community
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Discuss, learn and share with like-minded seekers
                </p>
              </div>

              <button
                onClick={() => setNewPostModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1b4b3b] text-white text-xs sm:text-sm font-semibold transition self-start sm:self-auto shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>
            </div>

            {/* Search Input & Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search discussions..."
                  className="w-full bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#ede5d6] focus:outline-none focus:ring-1 focus:ring-[#13382c] shadow-2xs"
                />
              </div>

              <div className="inline-flex rounded-xl border border-[#ede5d6] bg-white p-1 text-xs font-medium shadow-2xs shrink-0">
                {["Latest", "Trending", "For You"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                      filterTab === tab
                        ? "bg-[#13382c] text-white font-semibold shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Discussion Posts Feed */}
            <div className="space-y-3.5">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs hover:border-[#d4a359] transition space-y-3"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${post.avatarBg}`}
                      >
                        {post.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-stone-900">
                            {post.author}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            • {post.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#faf5ec] text-[#c4903c] border border-[#f0e3cc]">
                      {post.tag}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h2 className="font-serif font-bold text-base text-stone-900 hover:text-[#13382c] transition cursor-pointer">
                      {post.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1.5">
                      {post.content}
                    </p>
                  </div>

                  {/* Actions: Likes, Comments, Share */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 hover:text-[#13382c] transition cursor-pointer ${
                          post.liked ? "text-[#13382c] font-semibold" : ""
                        }`}
                      >
                        <ThumbsUp
                          className={`w-3.5 h-3.5 ${
                            post.liked ? "fill-current" : ""
                          }`}
                        />
                        <span>{post.likes}</span>
                      </button>

                      <button className="flex items-center gap-1.5 hover:text-[#13382c] transition cursor-pointer">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.replies}</span>
                      </button>
                    </div>

                    <button className="flex items-center gap-1 hover:text-[#13382c] transition cursor-pointer">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
