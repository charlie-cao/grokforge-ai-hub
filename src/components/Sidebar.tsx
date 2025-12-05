import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SidebarProps {
  onNewChat: () => void;
  onSearch: (query: string) => void;
}

export function Sidebar({ onNewChat, onSearch }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          →
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen">
      {/* Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search Ctrl+K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </form>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-md"
        >
          + New Chat
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2">
        <nav className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            💬 Chat
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            🎤 Voice
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            🎨 Imagine
          </Button>
        </nav>

        {/* History */}
        <div className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            History
          </div>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
            >
              Today
            </Button>
          </div>
        </div>
      </div>

      {/* Collapse Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="text-slate-500 dark:text-slate-400"
        >
          ←
        </Button>
      </div>
    </div>
  );
}

