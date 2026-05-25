"use client";

import { useState, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, LinkIcon, Trash2, ExternalLink, Plus, BarChart3 } from "lucide-react";
import { toast, Toaster } from "sonner";

interface URL {
  id: string;
  short_code: string;
  original_url: string;
  clicks: number;
  created_at: string;
}

interface DashboardClientProps {
  initialUrls: URL[];
}

export default function DashboardClient({ initialUrls }: DashboardClientProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<URL[]>(initialUrls);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleCreateUrl = useCallback(async () => {
    if (!originalUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: originalUrl }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || "Failed to shorten URL");
        return;
      }

      const result = await response.json();
      setUrls((prev) => [result.data, ...prev]);
      toast.success("URL shortened successfully!");
      setOriginalUrl("");
    } catch (error) {
      console.error("Error creating URL:", error);
      toast.error("Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  }, [originalUrl]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }, []);

  const deleteUrl = useCallback(async (id: string) => {
    try {
      setDeletingIds((prev) => new Set(prev).add(id));

      const response = await fetch(`/api/url/${id}`, { method: "DELETE" });

      if (!response.ok) {
        toast.error("Failed to delete URL");
        return;
      }

      setUrls((prev) => prev.filter((url) => url.id !== id));
      toast.success("URL deleted successfully!");
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("Failed to delete URL");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !loading) handleCreateUrl();
    },
    [handleCreateUrl, loading]
  );

  const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const avgClicks = urls.length > 0 ? Math.round(totalClicks / urls.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <Toaster />

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg flex-shrink-0">
              <LinkIcon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">LinkShort</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              Dashboard
            </Badge>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Your Links</h2>
          <p className="text-slate-400 text-sm sm:text-base">Create and manage all your shortened URLs</p>
        </div>

        {/* Create URL Section */}
        <Card className="bg-slate-800 border-slate-700 mb-6 sm:mb-8 p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Plus className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-white">Create New Short Link</h3>
          </div>
          <div className="flex flex-col gap-2 sm:gap-3">
            <Input
              type="url"
              placeholder="https://example.com/very/long/url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 flex-1 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
            />
            <Button
              onClick={handleCreateUrl}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 sm:px-8 font-semibold w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3"
            >
              {loading ? "Creating..." : "Shorten"}
            </Button>
          </div>
        </Card>

        {/* URLs Table */}
        {urls.length > 0 ? (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <LinkIcon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 flex-shrink-0" />
                <span className="truncate">Your Shortened Links ({urls.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300 text-xs sm:text-sm px-2 sm:px-4">Short Link</TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell text-xs sm:text-sm px-2 sm:px-4">Original URL</TableHead>
                    <TableHead className="text-slate-300 text-center text-xs sm:text-sm px-2 sm:px-4">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span className="hidden sm:inline">Clicks</span>
                        <span className="sm:hidden">C</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-300 hidden lg:table-cell text-xs sm:text-sm px-2 sm:px-4">Created</TableHead>
                    <TableHead className="text-slate-300 text-right text-xs sm:text-sm px-2 sm:px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urls.map((url) => (
                    <TableRow key={url.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-mono text-blue-400 font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 truncate">
                        linkshort-three.vercel.app/{url.short_code}
                      </TableCell>
                      <TableCell className="text-slate-300 hidden md:table-cell truncate max-w-xs text-xs sm:text-sm px-2 sm:px-4">
                        {url.original_url}
                      </TableCell>
                      <TableCell className="text-center px-2 sm:px-4 py-2 sm:py-3">
                        <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-300 text-xs">
                          {url.clicks}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 hidden lg:table-cell text-xs sm:text-sm px-2 sm:px-4">
                        {new Date(url.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right px-2 sm:px-4">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(`linkshort-three.vercel.app/${url.short_code}`)}
                            className="text-slate-400 hover:text-white hover:bg-slate-600 p-1.5 sm:p-2"
                            title="Copy link"
                          >
                            <Copy className="w-3 sm:w-4 h-3 sm:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="text-slate-400 hover:text-white hover:bg-slate-600 p-1.5 sm:p-2"
                            title="Open link"
                          >
                            <a href={url.original_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4" />
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteUrl(url.id)}
                            disabled={deletingIds.has(url.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950 disabled:opacity-50 p-1.5 sm:p-2"
                            title="Delete link"
                          >
                            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700 p-8 sm:p-12 text-center shadow-2xl">
            <LinkIcon className="w-10 sm:w-12 h-10 sm:h-12 text-slate-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">No URLs yet</h3>
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Start by creating your first shortened link above</p>
            <Button
              onClick={() => document.querySelector("input")?.focus()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm sm:text-base"
            >
              Create Your First Link
            </Button>
          </Card>
        )}

        {/* Stats Section - Memoized calculations */}
        {urls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Card className="bg-slate-800 border-slate-700 p-4 sm:p-6">
              <p className="text-slate-400 text-xs sm:text-sm">Total Links</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{urls.length}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4 sm:p-6">
              <p className="text-slate-400 text-xs sm:text-sm">Total Clicks</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{totalClicks}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4 sm:p-6">
              <p className="text-slate-400 text-xs sm:text-sm">Avg Clicks/Link</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{avgClicks}</p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
