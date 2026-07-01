import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("users").select("role, full_name, avatar_url").eq("id", user.id).single()
  if (!["superadmin", "admin", "redaksi"].includes(profile?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { article_id, title, subtitle, content, slug, status, seo_title, meta_description, cover_image, category_id, scheduled_at } = await request.json()

  if (!title?.trim()) return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ error: "Konten wajib diisi" }, { status: 400 })

  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))
  const isPublished = status === "publish"
  const isScheduled = status === "schedule"
  const now = new Date().toISOString()

  // Resolve category
  let catId = category_id
  if (!catId) {
    const { data: defaultCat } = await supabase.from("story_categories").select("id").limit(1).single()
    catId = defaultCat?.id
    if (!catId) return NextResponse.json({ error: "Tidak ada kategori" }, { status: 500 })
  }

  // Generate slug if not provided
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now().toString(36)

  if (article_id) {
    // Update existing
    const update: any = { title, content, slug: finalSlug, reading_time: readingTime, updated_at: now }
    if (subtitle !== undefined) update.subtitle = subtitle
    if (cover_image) update.cover_image = cover_image
    if (seo_title) update.seo_title = seo_title
    if (meta_description) update.meta_description = meta_description
    if (isPublished) { update.is_published = true; update.published_at = now; update.scheduled_at = null }
    if (isScheduled && scheduled_at) { update.is_published = false; update.scheduled_at = scheduled_at }
    if (status === "draft") { update.is_published = false; update.scheduled_at = null }

    const { error } = await supabase.from("stories").update(update).eq("id", article_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: article_id, slug: finalSlug })
  }

  // Create new
  const insert: any = {
    title, content, slug: finalSlug,
    author_id: user.id, author_name: profile?.full_name || "Redaksi", author_avatar: profile?.avatar_url || null,
    category_id: catId, reading_time: readingTime,
    is_published: isPublished, published_at: isPublished ? now : null,
    scheduled_at: isScheduled ? scheduled_at : null,
    created_at: now, updated_at: now,
  }
  if (subtitle) insert.subtitle = subtitle
  if (cover_image) insert.cover_image = cover_image
  if (seo_title) insert.seo_title = seo_title
  if (meta_description) insert.meta_description = meta_description

  const { data: created, error } = await supabase.from("stories").insert(insert).select("id, slug").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: created.id, slug: created.slug })
}
