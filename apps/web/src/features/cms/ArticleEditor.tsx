"use client"

import { useState, useCallback, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import LinkExtension from "@tiptap/extension-link"
import ImageExtension from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Blockquote from "@tiptap/extension-blockquote"
import CodeBlock from "@tiptap/extension-code-block"
import { useCMS } from "./CMSContext"
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Image as ImageIcon, Code, Quote, Minus, Sparkles, Heading1, Heading2, Heading3, Table as TableIcon, Undo, Redo } from "lucide-react"

interface ToolbarBtn {
  icon: typeof Bold
  label: string
  action?: string
  level?: number
}

function ToolbarButton({ icon: Icon, label, onClick, active }: { icon: typeof Bold; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
      style={{ background: active ? "rgba(8,68,99,0.08)" : "transparent", color: active ? "#084463" : "#647488" }}
    >
      <Icon size={15} />
    </button>
  )
}

export function ArticleEditor() {
  const { title, subtitle, setTitle, setSubtitle, setContent, setWordCount, setCharCount, setHeadings, setAICoachOpen } = useCMS()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Mulai menulis artikelmu di sini..." }),
      HorizontalRule, Blockquote, CodeBlock,
    ],
    content: "<p>Editor ini dibangun dengan <strong>TipTap</strong> — rich text editor modern berbasis ProseMirror.</p><p>Kamu bisa:</p><ul><li>Format <strong>bold</strong>, <em>italic</em>, <u>underline</u></li><li>Buat heading, list, checklist</li><li>Sisipkan gambar, tabel, kode</li><li>Drag & drop gambar langsung</li></ul><blockquote><p>Menulis adalah cara terbaik untuk berpikir. — David McCullough</p></blockquote>",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none outline-none min-h-[400px] text-[15px] leading-relaxed",
        style: "color: #1E2938; font-family: Inter, sans-serif; line-height: 1.8;",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText()
      const words = text.split(/\s+/).filter(Boolean)
      setContent(ed.getHTML())
      setWordCount(words.length)
      setCharCount(text.length)
      // Extract headings
      const h = [] as { level: number; text: string }[]
      ed.state.doc.descendants((node: any) => {
        if (node.type.name === "heading") h.push({ level: node.attrs.level, text: node.textContent })
      })
      setHeadings(h)
    },
  })

  const addImage = useCallback(() => {
    const url = window.prompt("URL gambar:")
    if (url && editor) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addLink = useCallback(() => {
    const url = window.prompt("URL link:")
    if (url && editor) editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const toggleHeading = (level: 1 | 2 | 3) => editor?.chain().focus().toggleHeading({ level }).run()

  if (!editor) return null

  const wordCount = editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length
  const charCount = editor.storage.characterCount?.characters?.() ?? editor.getText().length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Judul Artikel..."
        className="w-full text-[40px] font-bold leading-tight outline-none bg-transparent mb-2"
        style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}
      />

      {/* Subtitle */}
      <input
        value={subtitle}
        onChange={e => setSubtitle(e.target.value)}
        placeholder="Subtitle atau deskripsi singkat..."
        className="w-full text-lg outline-none bg-transparent mb-6"
        style={{ color: "#647488" }}
      />

      {/* Toolbar - Sticky */}
      <div className="flex items-center flex-wrap gap-0.5 mb-4 p-1.5 rounded-2xl border sticky top-0 z-10" style={{ background: "#FFFFFF", borderColor: "#E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <ToolbarButton icon={Undo} label="Undo" onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton icon={Redo} label="Redo" onClick={() => editor.chain().focus().redo().run()} />
        <div className="w-px h-5 mx-0.5" style={{ background: "#E2E8F0" }} />
        <ToolbarButton icon={Bold} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
        <ToolbarButton icon={UnderlineIcon} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} />
        <ToolbarButton icon={Strikethrough} label="Strike" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} />
        <div className="w-px h-5 mx-0.5" style={{ background: "#E2E8F0" }} />
        <ToolbarButton icon={Heading1} label="H1" onClick={() => toggleHeading(1)} active={editor.isActive("heading", { level: 1 })} />
        <ToolbarButton icon={Heading2} label="H2" onClick={() => toggleHeading(2)} active={editor.isActive("heading", { level: 2 })} />
        <ToolbarButton icon={Heading3} label="H3" onClick={() => toggleHeading(3)} active={editor.isActive("heading", { level: 3 })} />
        <div className="w-px h-5 mx-0.5" style={{ background: "#E2E8F0" }} />
        <ToolbarButton icon={List} label="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
        <ToolbarButton icon={ListOrdered} label="Numbered" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
        <div className="w-px h-5 mx-0.5" style={{ background: "#E2E8F0" }} />
        <ToolbarButton icon={AlignLeft} label="Left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} />
        <ToolbarButton icon={AlignCenter} label="Center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} />
        <ToolbarButton icon={AlignRight} label="Right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} />
        <div className="w-px h-5 mx-0.5" style={{ background: "#E2E8F0" }} />
        <ToolbarButton icon={TableIcon} label="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()} />
        <ToolbarButton icon={LinkIcon} label="Link" onClick={addLink} active={editor.isActive("link")} />
        <ToolbarButton icon={ImageIcon} label="Image" onClick={addImage} />
        <ToolbarButton icon={Code} label="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} />
        <ToolbarButton icon={Quote} label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} />
        <ToolbarButton icon={Minus} label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <div className="w-px h-5 mx-0.5" style={{ background: "#E2E8F0" }} />
        <button onClick={() => setAICoachOpen(true)} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ml-1" style={{ background: "rgba(8,68,99,0.08)", color: "#084463" }}>
          <Sparkles size={13} /> AI Writing
        </button>
      </div>

      {/* Reading Info */}
      <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: "#647488" }}>
        <span>📖 {readingTime} menit membaca</span>
        <span>📝 {wordCount} kata</span>
        <span>🔤 {charCount} karakter</span>
      </div>

      {/* Rich Text Editor */}
      <div className="rounded-2xl" style={{ background: "#FFFFFF" }}>
        <EditorContent editor={editor} className="px-1" />
      </div>

      {/* Bottom Insight Section */}
      <div className="mt-12 pt-8" style={{ borderTop: "1px solid #E2E8F0" }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>📊 Insight Konten</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Internal Links", value: "3 saran", icon: "🔗" },
            { label: "Related Articles", value: "5 ditemukan", icon: "📄" },
            { label: "FAQ Suggestions", value: "4 pertanyaan", icon: "❓" },
            { label: "Heading Structure", value: "H1 → H2 → H3 ✓", icon: "📑" },
            { label: "Readability", value: "Grade 8 • Mudah", icon: "📖" },
            { label: "Word Count", value: `${wordCount} kata`, icon: "📝" },
          ].map(card => (
            <div key={card.label} className="p-3 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-2">
                <span>{card.icon}</span>
                <span className="text-xs font-semibold" style={{ color: "#1E2938" }}>{card.label}</span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: "#647488" }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
