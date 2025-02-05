'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { collection, query, where, getDocs, getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/lib/services/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';

interface Podcast {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  createdAt: string;
  script: string;
  audioUrl?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchPodcasts() {
      if (!user?.email) return;

      try {
        const app = initializeFirebase();
        const db = getFirestore(app);
        const podcastsRef = collection(db, 'podcasts');
        const q = query(podcastsRef, where('userEmail', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        const fetchedPodcasts: Podcast[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPodcasts.push({
            id: doc.id,
            ...doc.data()
          } as Podcast);
        });

        // Sort by creation date, newest first
        fetchedPodcasts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setPodcasts(fetchedPodcasts);
      } catch (error) {
        console.error('Error fetching podcasts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPodcasts();
  }, [user]);

  const handlePlay = (podcast: Podcast) => {
    if (!podcast.audioUrl) return;

    if (playingId === podcast.id) {
      // If this podcast is currently playing, pause it
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // If another podcast is playing, stop it
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create new audio element
      const audio = new Audio(podcast.audioUrl);
      audioRef.current = audio;

      // Play the new audio
      audio.play().catch(console.error);
      setPlayingId(podcast.id);

      // Add ended event listener
      audio.addEventListener('ended', () => {
        setPlayingId(null);
      });
    }
  };

  const handleDownload = async (podcast: Podcast) => {
    if (!podcast.audioUrl) return;

    try {
      const response = await fetch(podcast.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${podcast.title || 'podcast'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading podcast:', error);
    }
  };

  const handleDelete = async (podcastId: string) => {
    try {
      const app = initializeFirebase();
      const db = getFirestore(app);
      await deleteDoc(doc(db, 'podcasts', podcastId));
      
      // Update local state
      setPodcasts(podcasts.filter(p => p.id !== podcastId));
      
      toast({
        title: "Success",
        description: "Podcast deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting podcast:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete podcast",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">
              {user?.email?.[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.email}</h1>
            <p className="text-muted-foreground">
              {podcasts.length} Podcast{podcasts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.map((podcast) => (
          <Card key={podcast.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {podcast.thumbnailUrl ? (
                <Image
                  src={podcast.thumbnailUrl}
                  alt={podcast.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <span className="text-2xl font-bold text-primary">
                    {podcast.title[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{podcast.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeletingId(podcast.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {podcast.description}
              </p>
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePlay(podcast)}
                  disabled={!podcast.audioUrl}
                >
                  {playingId === podcast.id ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(podcast)}
                  disabled={!podcast.audioUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {podcasts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No podcasts yet</h3>
          <p className="text-muted-foreground">
            Create your first podcast to get started!
          </p>
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your podcast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}