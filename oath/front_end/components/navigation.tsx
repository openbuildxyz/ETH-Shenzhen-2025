"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Gavel, Trophy, AlertTriangle, User, Menu, X, Sparkles } from "lucide-react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: "/oaths", label: "创建誓言", icon: Shield },
    { href: "/arbitrate", label: "仲裁中心", icon: Gavel },
    { href: "/trust-diamond", label: "信用钻石", icon: Trophy },
    { href: "/diamond-cases", label: "案例库", icon: Sparkles },
    { href: "/reports", label: "举报监督", icon: AlertTriangle },
    { href: "/profile", label: "个人中心", icon: User },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md oath-shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg oath-gradient">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold oath-text-gradient">Oath</span>
              <span className="text-xs text-slate-500">誓言平台</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="outline" className="text-green-700 border-green-200">
              信用分: 0
            </Badge>
            <Button className="oath-gradient text-white hover:opacity-90">连接钱包</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between px-3 py-2">
                  <Badge variant="outline" className="text-green-700 border-green-200">
                    信用分: 0
                  </Badge>
                  <Button size="sm" className="oath-gradient text-white hover:opacity-90">
                    连接钱包
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
