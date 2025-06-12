'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers/auth-provider';
import { Settings, BookOpen, Award, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MainNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">Suivi de Lecture</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <BookOpen className="h-4 w-4" />
                Tableau de bord
              </Link>
              <Link 
                href="/badges" 
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <Award className="h-4 w-4" />
                Badges
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Réglages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}