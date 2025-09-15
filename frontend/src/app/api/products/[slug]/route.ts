import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/products/[slug]
 * Returns a single product by slug for the product detail page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }

    // Get product by slug
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is active and available
    if (!product.is_active || product.status !== 'available') {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
    });

  } catch (error) {
    console.error('Product detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getProductBySlug(slug: string) {
  // Mock product lookup by slug
  // In real app: SELECT from products WHERE slug = ? AND is_active = true AND status = 'available'

  const mockProducts: Record<string, any> = {
    'biologikes-tomates-kritis': {
      id: 1,
      producer_id: 1,
      name: 'biologikes-tomates',
      title: 'Βιολογικές Ντομάτες Κρήτης',
      slug: 'biologikes-tomates-kritis',
      description: 'Φρέσκες βιολογικές ντομάτες από την Κρήτη, καλλιεργημένες χωρίς χημικά λιπάσματα. Οι ντομάτες μας είναι πλούσιες σε γεύση και θρεπτικά συστατικά, ιδανικές για σαλάτες, σάλτσες και μαγειρική.',
      price: 3.50,
      price_cents: 350,
      currency: 'EUR',
      unit: 'κιλό',
      stock: 25,
      weight_grams: 1000,
      length_cm: 15,
      width_cm: 10,
      height_cm: 8,
      is_active: true,
      is_organic: true,
      discount_price: null,
      is_seasonal: true,
      status: 'available',
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
      // Producer relation with full details
      producer: {
        id: 1,
        user_id: 1,
        name: 'Δημήτρης Παπαδόπουλος',
        business_name: 'Παπαδόπουλος Αγρόκτημα',
        description: 'Οικογενειακή επιχείρηση με 30 χρόνια εμπειρίας στη βιολογική καλλιέργεια.',
        location: 'Ηράκλειο, Κρήτη',
        phone: '+30 2810 123456',
        email: 'info@papadopoulos-farm.gr',
        website: 'https://papadopoulos-farm.gr',
        verified: true,
      },
      // Product images
      images: [
        {
          id: 1,
          product_id: 1,
          url: '/images/products/tomates-1.jpg',
          alt_text: 'Φρέσκες βιολογικές ντομάτες',
          is_primary: true,
        },
        {
          id: 2,
          product_id: 1,
          url: '/images/products/tomates-2.jpg',
          alt_text: 'Ντομάτες σε καλάθι',
          is_primary: false,
        },
      ],
      // Categories
      categories: [
        {
          id: 1,
          name: 'Λαχανικά',
          slug: 'lachanika',
        },
        {
          id: 2,
          name: 'Βιολογικά',
          slug: 'biologika',
        },
      ],
    },
    'elaiólado-extra-partheno': {
      id: 2,
      producer_id: 1,
      name: 'elaiólado-extra-partheno',
      title: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
      slug: 'elaiólado-extra-partheno',
      description: 'Εξαιρετικό παρθένο ελαιόλαδο από Κρητικές ελιές παραδοσιακής παραγωγής. Ψυχρή έκθλιψη και χαμηλή οξύτητα κάτω από 0.3%. Ιδανικό για σαλάτες και μαγειρική.',
      price: 12.80,
      price_cents: 1280,
      currency: 'EUR',
      unit: 'μπουκάλι 500ml',
      stock: 15,
      weight_grams: 500,
      length_cm: 25,
      width_cm: 7,
      height_cm: 7,
      is_active: true,
      is_organic: true,
      discount_price: null,
      is_seasonal: false,
      status: 'available',
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
      // Producer relation
      producer: {
        id: 1,
        user_id: 1,
        name: 'Δημήτρης Παπαδόπουλος',
        business_name: 'Παπαδόπουλος Αγρόκτημα',
        description: 'Οικογενειακή επιχείρηση με 30 χρόνια εμπειρίας στη βιολογική καλλιέργεια.',
        location: 'Ηράκλειο, Κρήτη',
        phone: '+30 2810 123456',
        email: 'info@papadopoulos-farm.gr',
        website: 'https://papadopoulos-farm.gr',
        verified: true,
      },
      // Product images
      images: [
        {
          id: 3,
          product_id: 2,
          url: '/images/products/elaiólado-1.jpg',
          alt_text: 'Εξαιρετικό παρθένο ελαιόλαδο',
          is_primary: true,
        },
      ],
      // Categories
      categories: [
        {
          id: 3,
          name: 'Ελαιόλαδο',
          slug: 'elaiólado',
        },
        {
          id: 2,
          name: 'Βιολογικά',
          slug: 'biologika',
        },
      ],
    },
    'kremmydia-kozanis-pop': {
      id: 3,
      producer_id: 2,
      name: 'kremmydia-kozanis',
      title: 'Κρεμμύδια Κοζάνης ΠΟΠ',
      slug: 'kremmydia-kozanis-pop',
      description: 'Γλυκά κρεμμύδια από την Κοζάνη με ΠΟΠ (Προστατευόμενη Ονομασία Προέλευσης). Η μοναδική γεύση και η υψηλή ποιότητα τα καθιστούν ιδανικά για κάθε χρήση.',
      price: 2.90,
      price_cents: 290,
      currency: 'EUR',
      unit: 'κιλό',
      stock: 40,
      weight_grams: 1000,
      length_cm: 12,
      width_cm: 12,
      height_cm: 10,
      is_active: true,
      is_organic: false,
      discount_price: null,
      is_seasonal: true,
      status: 'available',
      created_at: '2025-09-14T15:30:00.000Z',
      updated_at: '2025-09-15T10:15:00.000Z',
      // Producer relation
      producer: {
        id: 2,
        user_id: 2,
        name: 'Μαρία Γιαννοπούλου',
        business_name: 'Γιαννοπούλου Αγροτικά',
        description: 'Παραδοσιακή καλλιέργεια προϊόντων υψηλής ποιότητας.',
        location: 'Κοζάνη',
        phone: '+30 24610 98765',
        verified: true,
      },
      // Product images
      images: [
        {
          id: 4,
          product_id: 3,
          url: '/images/products/kremmydia-1.jpg',
          alt_text: 'Κρεμμύδια Κοζάνης ΠΟΠ',
          is_primary: true,
        },
      ],
      // Categories
      categories: [
        {
          id: 1,
          name: 'Λαχανικά',
          slug: 'lachanika',
        },
        {
          id: 4,
          name: 'ΠΟΠ Προϊόντα',
          slug: 'pop-proionta',
        },
      ],
    },
    'meli-thymari-kritis': {
      id: 4,
      producer_id: 1,
      name: 'meli-thymari',
      title: 'Μέλι Θυμαρισιό Κρήτης',
      slug: 'meli-thymari-kritis',
      description: 'Άριστης ποιότητας θυμαρίσιο μέλι από τα βουνά της Κρήτης. Πλούσια γεύση και άρωμα, πλούσιο σε αντιοξειδωτικά και θρεπτικά συστατικά.',
      price: 8.50,
      price_cents: 850,
      currency: 'EUR',
      unit: 'βάζο 450γρ',
      stock: 20,
      weight_grams: 450,
      length_cm: 10,
      width_cm: 10,
      height_cm: 12,
      is_active: true,
      is_organic: true,
      discount_price: null,
      is_seasonal: false,
      status: 'available',
      created_at: '2025-09-13T09:00:00.000Z',
      updated_at: '2025-09-15T12:30:00.000Z',
      // Producer relation
      producer: {
        id: 1,
        user_id: 1,
        name: 'Δημήτρης Παπαδόπουλος',
        business_name: 'Παπαδόπουλος Αγρόκτημα',
        description: 'Οικογενειακή επιχείρηση με 30 χρόνια εμπειρίας στη βιολογική καλλιέργεια.',
        location: 'Ηράκλειο, Κρήτη',
        phone: '+30 2810 123456',
        email: 'info@papadopoulos-farm.gr',
        website: 'https://papadopoulos-farm.gr',
        verified: true,
      },
      // Product images
      images: [
        {
          id: 5,
          product_id: 4,
          url: '/images/products/meli-1.jpg',
          alt_text: 'Θυμαρίσιο μέλι Κρήτης',
          is_primary: true,
        },
      ],
      // Categories
      categories: [
        {
          id: 5,
          name: 'Μέλι',
          slug: 'meli',
        },
        {
          id: 2,
          name: 'Βιολογικά',
          slug: 'biologika',
        },
      ],
    },
    'patates-naxou': {
      id: 5,
      producer_id: 2,
      name: 'patates-naxou',
      title: 'Πατάτες Νάξου',
      slug: 'patates-naxou',
      description: 'Μικρές πατάτες από τη Νάξο, ιδανικές για βράσιμο. Φυσική καλλιέργεια χωρίς χημικά, γεμάτες γεύση και θρεπτικά συστατικά.',
      price: 1.80,
      price_cents: 180,
      currency: 'EUR',
      unit: 'κιλό',
      stock: 50,
      weight_grams: 1000,
      length_cm: 20,
      width_cm: 15,
      height_cm: 10,
      is_active: true,
      is_organic: false,
      discount_price: null,
      is_seasonal: true,
      status: 'available',
      created_at: '2025-09-12T14:20:00.000Z',
      updated_at: '2025-09-14T16:45:00.000Z',
      // Producer relation
      producer: {
        id: 2,
        user_id: 2,
        name: 'Μαρία Γιαννοπούλου',
        business_name: 'Γιαννοπούλου Αγροτικά',
        description: 'Παραδοσιακή καλλιέργεια προϊόντων υψηλής ποιότητας.',
        location: 'Νάξος',
        phone: '+30 24610 98765',
        verified: true,
      },
      // Product images
      images: [
        {
          id: 6,
          product_id: 5,
          url: '/images/products/patates-1.jpg',
          alt_text: 'Πατάτες Νάξου',
          is_primary: true,
        },
      ],
      // Categories
      categories: [
        {
          id: 1,
          name: 'Λαχανικά',
          slug: 'lachanika',
        },
      ],
    },
  };

  return mockProducts[slug] || null;
}