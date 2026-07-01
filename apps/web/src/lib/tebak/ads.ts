'use server'

import { createClient as createServerClient } from "@/lib/supabase/server"

async function checkAdmin(supabase: Awaited<ReturnType<typeof createServerClient>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'redaksi'
}

export async function getActiveBanner(location: string): Promise<{
  id: string; image_url: string; click_url: string | null
} | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('ad_banners')
    .select('id, image_url, click_url')
    .eq('location', location)
    .eq('is_active', true)
    .or('start_date.is.null,start_date.lte.NOW()')
    .or('end_date.is.null,end_date.gte.NOW()')
    .order('created_at', { ascending: false })
    .limit(1)
  if (error || !data || data.length === 0) return null
  return data[0]
}

export async function recordAdImpression(bannerId: string, sessionId: string): Promise<void> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('ad_impressions').insert({
    banner_id: bannerId, session_id: sessionId, user_id: user.id
  }).select()
}

export async function recordAdClick(bannerId: string, sessionId: string): Promise<void> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('ad_clicks').insert({
    banner_id: bannerId, session_id: sessionId, user_id: user.id
  }).select()
}

export async function listAdBanners(): Promise<any[]> {
  const supabase = await createServerClient()
  if (!(await checkAdmin(supabase))) return []
  const { data, error } = await supabase
    .from('ad_banners')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

export async function createAdBanner(data: {
  name: string; image_url: string; click_url?: string; location: string
}): Promise<boolean> {
  const supabase = await createServerClient()
  if (!(await checkAdmin(supabase))) return false
  const { error } = await supabase.from('ad_banners').insert(data)
  return !error
}

export async function toggleAdBanner(id: string, active: boolean): Promise<boolean> {
  const supabase = await createServerClient()
  if (!(await checkAdmin(supabase))) return false
  const { error } = await supabase.from('ad_banners').update({ is_active: active }).eq('id', id)
  return !error
}

export async function deleteAdBanner(id: string): Promise<boolean> {
  const supabase = await createServerClient()
  if (!(await checkAdmin(supabase))) return false
  const { error } = await supabase.from('ad_banners').delete().eq('id', id)
  return !error
}

export async function updateAdBanner(id: string, data: {
  name?: string; image_url?: string; click_url?: string; location?: string
}): Promise<boolean> {
  const supabase = await createServerClient()
  if (!(await checkAdmin(supabase))) return false
  const { error } = await supabase.from('ad_banners').update(data).eq('id', id)
  return !error
}

export async function getAdStats(): Promise<any[]> {
  const supabase = await createServerClient()
  if (!(await checkAdmin(supabase))) return []
  const { data: banners } = await supabase
    .from('ad_banners')
    .select('*')
    .order('created_at', { ascending: false })
  if (!banners) return []

  // Fetch stats per banner
  const result = await Promise.all(banners.map(async (b) => {
    const [imp, clk] = await Promise.all([
      supabase.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('banner_id', b.id),
      supabase.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('banner_id', b.id),
    ])
    return { ...b, impression_count: imp.count ?? 0, click_count: clk.count ?? 0 }
  }))
  return result
}
