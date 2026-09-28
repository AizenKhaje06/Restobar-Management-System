import { createClient } from "@/lib/supabase/server"
import { SignatureDishesClient } from "./signature-dishes-client"

export async function SignatureDishes() {
  const supabase = await createClient()
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name, description, price, image_url, category:categories(name)')
    .eq('is_available', true)
    .order('price', { ascending: false })
    .limit(10)

  const dishes = menuItems?.map((item, index) => ({
    id: item.id,
    name: item.name,
    description: item.description || 'Delicious dish',
    price: item.price,
    image: item.image_url || `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80`,
    category: item.category?.name || 'Main Course',
    isBestSeller: index === 0
  })) || []

  return <SignatureDishesClient dishes={dishes} />
}
