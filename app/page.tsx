"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, LinkIcon, Trash2, ExternalLink } from "lucide-react";
import { toast, Toaster } from "sonner";
import {FaGithub} from "react-icons/fa"

interface ShortenedURL {
  id: string;
  original: string;
  shortened: string;
  clicks: number;
  createdAt: Date;
}


export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([]);

  const handleShorten = async () => {
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

      if (response.status === 429) {
        toast.error("Too many requests. Please try again later.");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to shorten URL");
        return;
      }

      const newUrl: ShortenedURL = {
        id: result.data.id,
        original: result.data.original_url,
        shortened: `${window.location.origin}/${result.data.short_code}`,
        clicks: result.data.clicks,
        createdAt: new Date(result.data.created_at),
      };

      setShortenedUrls([newUrl, ...shortenedUrls]);

      setOriginalUrl("");

      toast.success("URL shortened successfully!");
    } catch {
      toast.error("Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const deleteUrl = (id: string) => {
    setShortenedUrls(shortenedUrls.filter((url) => url.id !== id));
    toast.success("URL deleted");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleShorten();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toaster />

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">LinkShort</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              Free & Fast
            </Badge>

            <Link href="https://github.com/MuzzaiyyanHussain/linkshort" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 flex items-center gap-2"
              >
                <FaGithub className="w-5 h-5" />
                <span className="hidden sm:inline text-xs">GitHub</span>
              </Button>
            </Link>

            <SignedOut>
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700">
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Shorten Your Links Instantly
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Create short, shareable, and trackable links in seconds.
          </p>
        </div>

        <SignedOut>
          {/* Guest View - Features Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8"
              >
                Get Started Free
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Get short links in milliseconds" },
              { icon: "🔒", title: "Secure", desc: "Your links are protected and encrypted" },
              { icon: "📊", title: "Analytics", desc: "Track clicks and link performance" },
            ].map((feature, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700 p-6">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </SignedOut>

        <SignedIn>
          {/* Main Input Card */}
          <Card className="bg-slate-800 border-slate-700 mb-8 p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="url"
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 flex-1"
              />
              <Button
                onClick={handleShorten}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 font-semibold"
              >
                {loading ? "Shortening..." : "Shorten"}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {shortenedUrls.length > 0 && (
            <Card className="bg-slate-800 border-slate-700 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-400" />
                  Your Shortened Links ({shortenedUrls.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-300">Short Link</TableHead>
                      <TableHead className="text-slate-300 hidden md:table-cell">Original URL</TableHead>
                      <TableHead className="text-slate-300 text-center">Clicks</TableHead>
                      <TableHead className="text-slate-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortenedUrls.map((url) => (
                      <TableRow key={url.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="font-mono text-blue-400 font-semibold">{url.shortened}</TableCell>
                        <TableCell className="text-slate-300 hidden md:table-cell truncate max-w-xs">
                          {url.original}
                        </TableCell>
                        <TableCell className="text-center text-slate-300">{url.clicks}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(url.shortened)}
                              className="text-slate-400 hover:text-white hover:bg-slate-600"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="text-slate-400 hover:text-white hover:bg-slate-600"
                            >
                              <a href={url.original} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteUrl(url.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950"
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
          )}
        </SignedIn>
      </main>

      {/* Footer - Attribution */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          Built with ❤️ by Muzzaiyyan Hussain
        </div>
      </footer>
    </div>
  );
}
