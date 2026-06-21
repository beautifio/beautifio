"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"

interface UserSuggestion {
  user_id: string
  full_name: string
  avatar_url: string | null
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onSend?: () => void
  placeholder?: string
  className?: string
  rows?: number
}

export function MentionInput({
  value, onChange, onSend, placeholder, className, rows,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [cursorPos, setCursorPos] = useState(0)
  const [mentionStart, setMentionStart] = useState(-1)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 1 || !supabase) { setSuggestions([]); setShowSuggestions(false); return }
    try {
      const { data } = await supabase.rpc("search_users", { search_query: q, limit_count: 8 })
      const users = (data as UserSuggestion[]) || []
      setSuggestions(users)
      setShowSuggestions(users.length > 0)
      setSelectedIndex(0)
    } catch { setSuggestions([]); setShowSuggestions(false) }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    onChange(val)
    const pos = e.target.selectionStart
    setCursorPos(pos)

    const textBefore = val.slice(0, pos)
    const atIndex = textBefore.lastIndexOf("@")
    if (atIndex >= 0 && (atIndex === 0 || textBefore[atIndex - 1] === " " || textBefore[atIndex - 1] === "\n")) {
      const afterAt = textBefore.slice(atIndex + 1)
      if (!afterAt.includes(" ")) {
        setMentionStart(atIndex)
        setQuery(afterAt)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => searchUsers(afterAt), 150)
        return
      }
    }
    setShowSuggestions(false)
    setMentionStart(-1)
  }

  const insertMention = (user: UserSuggestion) => {
    if (mentionStart < 0) return
    const before = value.slice(0, mentionStart)
    const after = value.slice(cursorPos)
    const newVal = before + "@" + user.full_name + " " + after
    onChange(newVal)
    setShowSuggestions(false)
    setMentionStart(-1)
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = mentionStart + user.full_name.length + 2
        inputRef.current.setSelectionRange(newPos, newPos)
        inputRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault()
          insertMention(suggestions[selectedIndex])
          return
        }
      }
      if (e.key === "Escape") {
        setShowSuggestions(false)
        return
      }
    }
    if (e.key === "Enter" && !e.shiftKey && onSend) {
      e.preventDefault()
      onSend()
    }
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows || 1}
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-bg border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {suggestions.map((user, idx) => (
            <button
              key={user.user_id}
              onMouseDown={(e) => { e.preventDefault(); insertMention(user) }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                idx === selectedIndex ? "bg-surface text-text-primary" : "text-text-secondary hover:bg-surface"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
                {user.full_name.charAt(0)}
              </div>
              <span>{user.full_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export async function notifyMentions(
  text: string,
  source: string,
  sourceId: string,
  sourceUrl: string,
) {
  if (!supabase) return
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.rpc("notify_mentions", {
      p_text: text,
      p_source: source,
      p_source_id: sourceId,
      p_source_url: sourceUrl,
      p_actor_id: user.id,
    })
  } catch { /* silent */ }
}
