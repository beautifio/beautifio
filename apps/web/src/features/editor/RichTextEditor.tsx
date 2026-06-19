"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-4' },
      }),
      Youtube.configure({
        width: 800,
        HTMLAttributes: { class: 'w-full aspect-video rounded-lg my-4' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: placeholder || 'Mulai menulis konten...' }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    setUploadingImage(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      if (!supabase) throw new Error('No supabase client');

      const ext = file.name.split('.').pop();
      const filename = `inspirasi-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('landing-assets')
        .upload(`artikel/${filename}`, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('landing-assets')
        .getPublicUrl(`artikel/${filename}`);

      editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();
    } catch (err) {
      alert('Upload gambar gagal. Coba lagi.');
    } finally {
      setUploadingImage(false);
    }
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    const url = prompt('Masukkan URL YouTube:');
    if (url) editor?.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  const addLink = useCallback(() => {
    const url = prompt('Masukkan URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer border-0 ${
      active ? 'bg-[#084463] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4,
        padding: '10px 12px',
        borderBottom: '1px solid #E2E8F0',
        background: '#F8FAFC',
      }}>
        <button className={btn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <b>B</b>
        </button>
        <button className={btn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <i>I</i>
        </button>
        <button className={btn(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <u>U</u>
        </button>
        <button className={btn(editor.isActive('strike'))}
          onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <s>S</s>
        </button>

        <span style={{ width: 1, background: '#E2E8F0', margin: '0 4px' }} />

        <button className={btn(editor.isActive('heading', { level: 1 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>
        <button className={btn(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button className={btn(editor.isActive('heading', { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>

        <span style={{ width: 1, background: '#E2E8F0', margin: '0 4px' }} />

        <button className={btn(editor.isActive({ textAlign: 'left' }))}
          onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Left">
          L
        </button>
        <button className={btn(editor.isActive({ textAlign: 'center' }))}
          onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Center">
          C
        </button>
        <button className={btn(editor.isActive({ textAlign: 'right' }))}
          onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Right">
          R
        </button>

        <span style={{ width: 1, background: '#E2E8F0', margin: '0 4px' }} />

        <button className={btn(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button className={btn(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>

        <span style={{ width: 1, background: '#E2E8F0', margin: '0 4px' }} />

        <button className={btn(editor.isActive('blockquote'))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝ Quote
        </button>
        <button className={btn(false)}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          — Divider
        </button>

        <span style={{ width: 1, background: '#E2E8F0', margin: '0 4px' }} />

        <button className={btn(editor.isActive('table'))}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          ⊞ Table
        </button>

        <span style={{ width: 1, background: '#E2E8F0', margin: '0 4px' }} />

        <label style={{
          padding: '4px 8px', borderRadius: 4, fontSize: 14,
          background: '#084463', color: '#fff', cursor: 'pointer',
          fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {uploadingImage ? '⏳...' : '🖼 Gambar'}
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = '';
            }} />
        </label>

        <button className={btn(false)} onClick={addYoutubeVideo}>
          ▶ YouTube
        </button>

        <button className={btn(editor.isActive('link'))} onClick={addLink}>
          🔗 Link
        </button>
        {editor.isActive('link') && (
          <button className={btn(false)}
            onClick={() => editor.chain().focus().unsetLink().run()}>
            ✂ Unlink
          </button>
        )}

        <span style={{ width: 1, background: '#E2E8F0', margin: '0 4px' }} />

        <button className={btn(false)}
          onClick={() => editor.chain().focus().undo().run()}>
          ↩ Undo
        </button>
        <button className={btn(false)}
          onClick={() => editor.chain().focus().redo().run()}>
          ↪ Redo
        </button>
      </div>

      <EditorContent
        editor={editor}
        style={{ minHeight: 400, padding: '16px 20px', fontSize: 15, lineHeight: 1.7 }}
      />

      <style>{`
        .ProseMirror:focus { outline: none; }
        .ProseMirror h1 { font-size: 2em; font-weight: 700; margin: 16px 0 8px; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: 600; margin: 14px 0 8px; }
        .ProseMirror h3 { font-size: 1.2em; font-weight: 600; margin: 12px 0 6px; }
        .ProseMirror p { margin: 0 0 8px; }
        .ProseMirror ul { list-style: disc; padding-left: 24px; margin: 8px 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 24px; margin: 8px 0; }
        .ProseMirror blockquote {
          border-left: 4px solid #084463; padding: 8px 16px; margin: 12px 0;
          color: #647488; font-style: italic; background: #F8FAFC;
          border-radius: 0 8px 8px 0;
        }
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        .ProseMirror td, .ProseMirror th {
          border: 1px solid #E2E8F0; padding: 8px 12px; text-align: left;
        }
        .ProseMirror th { background: #F8FAFC; font-weight: 600; }
        .ProseMirror hr { border: none; border-top: 2px solid #E2E8F0; margin: 24px 0; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); color: #9CA3AF;
          pointer-events: none; height: 0; float: left;
        }
        .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
        .ProseMirror iframe { width: 100%; aspect-ratio: 16/9; border-radius: 8px; margin: 16px 0; }
      `}</style>
    </div>
  );
}
