"use client";

import { useState } from "react";
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

  const handleCreateUrl = async () => {
    if (!originalUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: originalUrl,
        }),
      });

      const result = await response.json();

      console.log(result);

      if (!response.ok) {
        toast.error(result.error || "Failed to shorten URL");
        return;
      }

      setUrls((prev) => [result.data, ...prev]);

      toast.success("URL shortened successfully!");

      setOriginalUrl("");
    } catch (error) {
      console.log(error);

      toast.error("Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const deleteUrl = async (id: string) => {
    try {
      await fetch(`/api/url/${id}`, {
        method: "DELETE",
      });

      setUrls(urls.filter((url) => url.id !== id));
      toast.success("URL deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete URL");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toaster />

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">LinkShort</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              Dashboard
            </Badge>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Your Links</h2>
          <p className="text-slate-400">Create and manage all your shortened URLs</p>
        </div>

        {/* Create URL Section */}
        <Card className="bg-slate-800 border-slate-700 mb-8 p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Create New Short Link</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="url"
              placeholder="https://example.com/very/long/url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 flex-1"
            />
            <Button
              onClick={handleCreateUrl}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 font-semibold"
            >
              {loading ? "Creating..." : "Shorten"}
            </Button>
          </div>
        </Card>

        {/* URLs Table */}
        {urls.length > 0 ? (
          <Card className="bg-slate-800 border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-400" />
                Your Shortened Links ({urls.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300">Short Link</TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell">Original URL</TableHead>
                    <TableHead className="text-slate-300 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        Clicks
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-300 hidden lg:table-cell">Created</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urls.map((url) => (
                    <TableRow key={url.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-mono text-blue-400 font-semibold">
                        short.url/{url.short_code}
                      </TableCell>
                      <TableCell className="text-slate-300 hidden md:table-cell truncate max-w-xs">
                        {url.original_url}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-300">
                          {url.clicks}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 hidden lg:table-cell text-sm">
                        {new Date(url.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(`short.url/${url.short_code}`)}
                            className="text-slate-400 hover:text-white hover:bg-slate-600"
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="text-slate-400 hover:text-white hover:bg-slate-600"
                            title="Open link"
                          >
                            <a href={url.original_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteUrl(url.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950"
                            title="Delete link"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <Card className="bg-slate-800 border-slate-700 p-12 text-center shadow-2xl">
            <LinkIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No URLs yet</h3>
            <p className="text-slate-400 mb-6">Start by creating your first shortened link above</p>
            <Button
              onClick={() => document.querySelector("input")?.focus()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Create Your First Link
            </Button>
          </Card>
        )}

        {/* Stats Section */}
        {urls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <p className="text-slate-400 text-sm">Total Links</p>
              <p className="text-3xl font-bold text-white mt-2">{urls.length}</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-6">
              <p className="text-slate-400 text-sm">Total Clicks</p>
              <p className="text-3xl font-bold text-white mt-2">
                {urls.reduce((sum, url) => sum + (url.clicks || 0), 0)}
              </p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-6">
              <p className="text-slate-400 text-sm">Avg Clicks/Link</p>
              <p className="text-3xl font-bold text-white mt-2">
                {Math.round(urls.reduce((sum, url) => sum + (url.clicks || 0), 0) / urls.length)}
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
