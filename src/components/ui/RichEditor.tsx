"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: "min-height:280px;outline:none;font-family:var(--font-body);font-size:.9rem;line-height:1.8;color:var(--ink);padding:.75rem;",
      },
    },
  });

  useEffect(() => {
    if (editor && value === "") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  if (!editor) return null;

  const btn = (action: () => boolean, label: string, active?: boolean) => (
    <button
      type="button"
      onClick={() => action()}
      style={{
        background: active ? "var(--ink)" : "transparent",
        color: active ? "var(--white)" : "var(--ink)",
        border: "1px solid var(--gray-2)",
        padding: ".2rem .55rem",
        borderRadius: "2px",
        fontFamily: "var(--font-sub)",
        fontSize: ".72rem",
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: ".03em",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: "1px solid var(--gray-2)", borderRadius: "2px" }}>
      <div style={{ display: "flex", gap: ".3rem", flexWrap: "wrap", padding: ".5rem .75rem", borderBottom: "1px solid var(--gray-2)", background: "var(--gray)" }}>
        {btn(() => editor.chain().focus().toggleBold().run(), "B", editor.isActive("bold"))}
        {btn(() => editor.chain().focus().toggleItalic().run(), "I", editor.isActive("italic"))}
        {btn(() => editor.chain().focus().toggleUnderline().run(), "U", editor.isActive("underline"))}
        {btn(() => editor.chain().focus().toggleStrike().run(), "S", editor.isActive("strike"))}
        <div style={{ width: "1px", background: "var(--gray-2)", margin: "0 .2rem" }} />
        {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), "H1", editor.isActive("heading", { level: 1 }))}
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2", editor.isActive("heading", { level: 2 }))}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3", editor.isActive("heading", { level: 3 }))}
        <div style={{ width: "1px", background: "var(--gray-2)", margin: "0 .2rem" }} />
        {btn(() => editor.chain().focus().toggleBulletList().run(), "• List", editor.isActive("bulletList"))}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), "1. List", editor.isActive("orderedList"))}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), "❝", editor.isActive("blockquote"))}
        {btn(() => editor.chain().focus().toggleCodeBlock().run(), "</>", editor.isActive("codeBlock"))}
        <div style={{ width: "1px", background: "var(--gray-2)", margin: "0 .2rem" }} />
        {btn(() => editor.chain().focus().setTextAlign("left").run(), "⬅", editor.isActive({ textAlign: "left" }))}
        {btn(() => editor.chain().focus().setTextAlign("center").run(), "↔", editor.isActive({ textAlign: "center" }))}
        {btn(() => editor.chain().focus().setTextAlign("right").run(), "➡", editor.isActive({ textAlign: "right" }))}
      </div>
      <div style={{ position: "relative" }}>
        {editor.isEmpty && placeholder && (
          <div style={{ position: "absolute", top: ".75rem", left: ".75rem", fontFamily: "var(--font-body)", fontSize: ".9rem", color: "var(--muted)", pointerEvents: "none" }}>
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .tiptap h1 { font-family: var(--font-heading); font-size: 1.8rem; text-transform: uppercase; margin: .75rem 0 .4rem; color: var(--ink); }
        .tiptap h2 { font-family: var(--font-heading); font-size: 1.3rem; text-transform: uppercase; margin: .75rem 0 .4rem; color: var(--ink); }
        .tiptap h3 { font-family: var(--font-sub); font-size: 1rem; font-weight: 700; margin: .75rem 0 .4rem; color: var(--ink); text-transform: uppercase; }
        .tiptap p { margin-bottom: .75rem; }
        .tiptap ul, .tiptap ol { padding-left: 1.5rem; margin-bottom: .75rem; }
        .tiptap li { margin-bottom: .25rem; }
        .tiptap blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; margin: .75rem 0; color: var(--muted); font-style: italic; }
        .tiptap pre { background: var(--gray); padding: .75rem 1rem; border-radius: 2px; font-family: monospace; font-size: .85rem; margin-bottom: .75rem; overflow-x: auto; }
        .tiptap code { background: var(--gray); padding: .1rem .3rem; border-radius: 2px; font-family: monospace; font-size: .85rem; }
        .tiptap strong { font-weight: 700; }
        .tiptap em { font-style: italic; }
        .tiptap u { text-decoration: underline; }
        .tiptap s { text-decoration: line-through; }
      `}</style>
    </div>
  );
}
