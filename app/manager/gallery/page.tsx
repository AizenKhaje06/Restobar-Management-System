import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Image as ImageIcon, FolderOpen, TrendingUp } from "lucide-react"
import { GalleryGrid } from "@/components/manager/gallery-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function GalleryPage() {
  const supabase = await createClient()

  // Fetch gallery images
  const { data: gallery, error } = await supabase
    .from("event_gallery")
    .select("*")
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalImages = gallery?.length || 0
  const activeImages = gallery?.filter(g => g.is_active)?.length || 0
  const categories = [...new Set(gallery?.map(g => g.category) || [])].length

  const stats = [
    {
      title: "Total Images",
      value: totalImages,
      icon: ImageIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Active Images",
      value: activeImages,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Categories",
      value: categories,
      icon: FolderOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground">
            Manage event photos and gallery images
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/gallery">
            <Plus className="size-4 mr-2" />
            Upload Images
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`size-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gallery Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Images</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-center text-red-600">Error: {error.message}</p>
          ) : gallery && gallery.length > 0 ? (
            <GalleryGrid images={gallery} />
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images yet</p>
              <Button asChild className="mt-4">
                <Link href="/admin/events/gallery">
                  <Plus className="size-4 mr-2" />
                  Upload Your First Image
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
