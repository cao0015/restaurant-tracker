// 高德 Web 服务 API Key，需在 .env.local 中配置 VITE_GAODE_KEY
const KEY = import.meta.env.VITE_GAODE_KEY

export interface GaodePoi {
  id: string
  name: string
  address: string
  cityname: string
}

export async function searchPoi(keywords: string): Promise<GaodePoi[]> {
  if (!keywords.trim()) return []
  // types=050000 是高德 POI 分类码，对应"餐饮服务"大类，缩小搜索范围
  const url = `https://restapi.amap.com/v3/place/text?key=${KEY}&keywords=${encodeURIComponent(keywords)}&types=050000&output=JSON&offset=10`
  try {
    const res = await fetch(url)
    const json = await res.json()
    if (json.status !== '1' || !Array.isArray(json.pois)) return []
    // address 字段偶尔为数组（无地址时高德返回 []），统一转成字符串
    return json.pois.map((p: Record<string, string>) => ({
      id: p.id,
      name: p.name,
      address: typeof p.address === 'string' ? p.address : '',
      cityname: p.cityname,
    }))
  } catch {
    return []
  }
}
