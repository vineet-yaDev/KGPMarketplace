'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signIn, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import {
  Search,
  User,
  Menu,
  X,
  Plus,
  ShoppingBag,
  Briefcase,
  MessageSquare,
  Sun,
  Moon,
  Package,
  LogOut,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useSearch } from '@/hooks/useSearch'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false)
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false)
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null)
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null)

  const { search, results, loading, error } = useSearch()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    search(query)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length > 0) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsDesktopSearchFocused(false)
      setIsMobileSearchFocused(false)
      setIsMobileMenuOpen(false) // Close mobile menu if open
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Handle desktop search
      if (desktopSearchContainerRef.current && !desktopSearchContainerRef.current.contains(event.target as Node)) {
        setIsDesktopSearchFocused(false)
      }
      // Handle mobile search
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target as Node)) {
        setIsMobileSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    router.push('/')
  }

  const isActivePath = (path: string) => pathname === path

  const navigationLinks = [
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/services', label: 'Services', icon: Briefcase },
    { href: '/demand', label: 'Demand', icon: MessageSquare },
  ]

  const profileMenuItems = isAuthenticated
    ? [{ href: `/user/${user?.id}`, label: 'My Listings', icon: Package }]
    : []

  const showDesktopDropdown = isDesktopSearchFocused && searchQuery.length > 1
  const showMobileDropdown = isMobileSearchFocused && searchQuery.length > 1
  const hasResults = results && results.total > 0

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header - Responsive */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
      <Link
        href="/"
        className="flex items-center space-x-2 hover:opacity-80 transition-smooth flex-shrink-0"
      >
        {/* Mobile: Full icon only */}
        <div className="block sm:hidden">
          <img
            src="/fullicon.png"
            alt="KGP Marketplace"
            className="h-8 w-auto" // Height constrained, width auto
          />
        </div>

        {/* Desktop: Icon + Text */}
        <div className="hidden sm:flex items-center space-x-2">
          <img
            src="/icon.png"
            alt="KGP Marketplace Icon"
            className="h-8 w-auto" // Height constrained, width auto
          />
          <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            KGP Marketplace
          </span>
        </div>
      </Link>

            {/* Desktop Search Bar */}
            <div
              ref={desktopSearchContainerRef}
              className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8 relative"
            >
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search products, services..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDesktopSearchFocused(true)}
                    className="pl-10 glass-input border-white/20 focus:border-primary/50 bg-white/10 dark:bg-white/5 text-foreground placeholder:text-muted-foreground"
                    autoComplete="off"
                  />
                </div>
              </form>

              {/* Desktop Search dropdown */}
              {showDesktopDropdown && (
                <div className="absolute top-full mt-2 w-full glass-dropdown border border-white/20 bg-white/95 dark:bg-black/80 backdrop-blur-xl rounded-md shadow-lg p-2 z-10">
                  {loading && (
                    <div className="flex items-center justify-center p-2 text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  )}
                  {!loading && error && <div className="p-2 text-center text-destructive">{error}</div>}
                  {!loading && !error && results && (
                    <>
                      {hasResults ? (
                        <div className="space-y-1">
                          {results.products.length > 0 && (
                            <Link
                              href={`/products?search=${encodeURIComponent(searchQuery)}`}
                              onClick={() => setIsDesktopSearchFocused(false)}
                              className="flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                            >
                              <ShoppingBag className="mr-3 h-4 w-4 text-primary" />{' '}
                              <span>
                                {results.products.length} product
                                {results.products.length > 1 ? 's' : ''} found
                              </span>
                            </Link>
                          )}
                          {results.services.length > 0 && (
                            <Link
                              href={`/services?search=${encodeURIComponent(searchQuery)}`}
                              onClick={() => setIsDesktopSearchFocused(false)}
                              className="flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                            >
                              <Briefcase className="mr-3 h-4 w-4 text-primary" />{' '}
                              <span>
                                {results.services.length} service
                                {results.services.length > 1 ? 's' : ''} found
                              </span>
                            </Link>
                          )}
                          {results.demands.length > 0 && (
                            <Link
                              href={`/demand?search=${encodeURIComponent(searchQuery)}`}
                              onClick={() => setIsDesktopSearchFocused(false)}
                              className="flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                            >
                              <MessageSquare className="mr-3 h-4 w-4 text-primary" />{' '}
                              <span>
                                {results.demands.length} demand
                                {results.demands.length > 1 ? 's' : ''} found
                              </span>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="p-2 text-center text-muted-foreground">No results found.</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              {navigationLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActivePath(href)
                      ? 'text-primary'
                      : 'text-foreground hover:text-foreground/80 dark:hover:text-foreground'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* ADD Button */}
              {isAuthenticated ? (
                <Link href="/add">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm sm:text-base px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                    <span className="xs:inline mr-2">Add</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => signIn('google', { callbackUrl: '/add' })}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm sm:text-base px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  <span className="xs:inline mr-2">Add</span>
                </Button>
              )}
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="glass-button dark:hover:bg-white/10 p-2"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full glass-button dark:hover:bg-white/10"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 glass-dropdown border-white/20 bg-white/95 dark:bg-black/80 backdrop-blur-xl"
                    align="end"
                  >
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user?.name && <p className="font-medium text-foreground">{user.name}</p>}
                        {user?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-white/20" />
                    {profileMenuItems.map(({ href, label, icon: Icon }) => (
                      <DropdownMenuItem key={href} asChild className="hover:bg-black/10 dark:hover:bg-white/10">
                        <Link href={href} className="w-full text-foreground">
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="hover:bg-black/10 dark:hover:bg-white/10 text-foreground"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  variant="outline"
                  size="sm"
                  className="glass-button border-white/20 dark:hover:bg-white/10 text-foreground hover:text-foreground"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              )}
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden glass-button dark:hover:bg-white/10 p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Below Navbar */}
        <div ref={mobileSearchContainerRef} className="md:hidden container mx-auto px-4 pt-2 pb-2">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products, services..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsMobileSearchFocused(true)}
              className="pl-10 glass-input border-white/20 focus:border-primary/50 bg-white/10 dark:bg-white/5 text-foreground placeholder:text-muted-foreground"
              autoComplete="off"
            />
            {/* Mobile Search Results Dropdown */}
            {showMobileDropdown && (
              <div className="absolute top-full mt-1 w-full glass-dropdown border border-white/20 bg-white/95 dark:bg-black/80 backdrop-blur-xl rounded-md shadow-lg p-2 z-10">
                {loading && (
                  <div className="flex items-center justify-center p-2 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                )}
                {!loading && error && <div className="p-2 text-center text-destructive">{error}</div>}
                {!loading && !error && results && (
                  <>
                    {hasResults ? (
                      <div className="space-y-1">
                        {results.products.length > 0 && (
                          <Link
                            href={`/products?search=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setIsMobileSearchFocused(false)}
                            className="flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                          >
                            <ShoppingBag className="mr-3 h-4 w-4 text-primary" />{' '}
                            <span>
                              {results.products.length} product
                              {results.products.length > 1 ? 's' : ''} found
                            </span>
                          </Link>
                        )}
                        {results.services.length > 0 && (
                          <Link
                            href={`/services?search=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setIsMobileSearchFocused(false)}
                            className="flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                          >
                            <Briefcase className="mr-3 h-4 w-4 text-primary" />{' '}
                            <span>
                              {results.services.length} service
                              {results.services.length > 1 ? 's' : ''} found
                            </span>
                          </Link>
                        )}
                        {results.demands.length > 0 && (
                          <Link
                            href={`/demand?search=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setIsMobileSearchFocused(false)}
                            className="flex items-center p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                          >
                            <MessageSquare className="mr-3 h-4 w-4 text-primary" />{' '}
                            <span>
                              {results.demands.length} demand
                              {results.demands.length > 1 ? 's' : ''} found
                            </span>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">No results found.</div>
                    )}
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </header>

      {/* Mobile Navigation Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-64 sm:w-72 glass-sidebar border-l border-white/20 p-4 sm:p-6 bg-white/95 dark:bg-black/80 backdrop-blur-xl">
            <nav className="space-y-3 sm:space-y-4 mt-24 sm:mt-28">
              {navigationLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-3 text-sm font-medium transition-colors p-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 ${
                    isActivePath(href)
                      ? 'text-primary bg-black/10 dark:bg-white/10'
                      : 'text-foreground hover:text-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="my-4 border-t border-white/20" />
                  {profileMenuItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center space-x-3 text-sm font-medium text-foreground hover:text-foreground p-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 text-sm font-medium text-foreground hover:text-foreground p-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="my-4 border-t border-white/20" />
                  <button
                    onClick={() => {
                      signIn('google', { callbackUrl: '/' })
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 text-sm font-medium text-foreground hover:text-foreground p-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <User className="w-5 h-5" />
                    <span>Login with Google</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 mt-16 bg-white/10 dark:bg-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                KGP Marketplace
              </span>
            </div>
            <div className="flex justify-center py-2">
              <Link href="/about">
                <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 hover:from-emerald-500 hover:via-purple-500 hover:to-blue-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-500 ease-in-out border border-white/20 backdrop-blur-sm">
                  About Us
                </Button>
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Exclusive marketplace for IIT Kharagpur students
            </p>
            <p className="text-xs text-muted-foreground">© 2024 KGP Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
