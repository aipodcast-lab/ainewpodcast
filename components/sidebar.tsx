"use client"

import Link from 'next/link';
import { Home, Compass, Mic2, User, Edit } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">AI Podcast</h1>
      </div>
      
      <nav className="space-y-2 px-4">
        <Link href="/" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent">
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        
        <Link href="/discover" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent">
          <Compass className="w-5 h-5" />
          <span>Discover</span>
        </Link>
        
        <Link href="/create" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent">
          <Mic2 className="w-5 h-5" />
          <span>Create Podcast</span>
        </Link>

        <Link href="/edit" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent">
          <Edit className="w-5 h-5" />
          <span>Edit Audio</span>
        </Link>
        
        <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent">
          <User className="w-5 h-5" />
          <span>My Profile</span>
        </Link>
      </nav>
    </div>
  );
}