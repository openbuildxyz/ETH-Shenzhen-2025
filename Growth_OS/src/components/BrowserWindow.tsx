'use client'

import { ReactNode } from 'react'
import { TitleBar } from './browser/TitleBar'
import { AddressBar } from './browser/AddressBar'

interface BrowserWindowProps {
  children: ReactNode
  title?: string
  url?: string
}

export function BrowserWindow({ children, title = 'Yanbo', url = 'https://yanbo520.com' }: BrowserWindowProps) {
  return (
    <div className="w-full max-w-[1280px] mx-auto bg-bg-glass rounded-[30px_30px_6px_6px] border border-white/60 backdrop-blur-[43px] overflow-hidden">
      <TitleBar title={title} />
      <AddressBar url={url} />
      <div className="bg-bg-blue">
        {children}
      </div>
    </div>
  )
}