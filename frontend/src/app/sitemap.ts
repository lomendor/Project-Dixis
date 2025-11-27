export default async function sitemap() {
  try {
    // Αν υπάρχει DB, βάλε εδώ μελλοντικά δυναμικά URLs.
    if (process.env.DATABASE_URL) {
      // placeholder για dynamic sitemap (π.χ. products, categories)
      return [
        { url: 'https://dixis.gr/' },
        { url: 'https://dixis.gr/products' }
      ]
    }
  } catch (_) {
    // ignore
  }
  // Safe fallback χωρίς DB
  return [
    { url: 'https://dixis.gr/' },
    { url: 'https://dixis.gr/products' }
  ]
}
