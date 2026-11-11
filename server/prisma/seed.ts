import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BLOOMORA Database Seeding...');

  // 1. Clean existing records
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.flowerCollection.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.websiteContent.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (Admin & Demo User)
  const hashedAdminPassword = await bcrypt.hash('adminpassword123', 10);
  const hashedUserPassword = await bcrypt.hash('userpassword123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bloomora.in',
      password: hashedAdminPassword,
      name: 'Bloomora Admin',
      phone: '+91 98765 43210',
      role: 'ADMIN',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'user@bloomora.in',
      password: hashedUserPassword,
      name: 'Ananya Sharma',
      phone: '+91 98123 45678',
      role: 'USER',
      addresses: {
        create: [
          {
            fullName: 'Ananya Sharma',
            phone: '+91 98123 45678',
            street: '42 Lotus Heights, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            pinCode: '560038',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('✅ Created Admin (admin@bloomora.in) and Demo User (user@bloomora.in)');

  // 3. Create Categories
  const categoriesData = [
    {
      name: 'Dried Flower Decorations',
      slug: 'dried-flower-decorations',
      description: 'Hand-crafted decorative accent pieces made from upcycled temple & wedding flowers.',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Handmade Floral Art',
      slug: 'handmade-floral-art',
      description: 'Framed pressed botanicals and resin-embedded real floral artwork.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Sustainable Gifts',
      slug: 'sustainable-gifts',
      description: 'Thoughtfully curated eco-friendly artisanal gifts and scented natural botanical hampers.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Eco-Friendly Home Decor',
      slug: 'eco-friendly-home-decor',
      description: 'Aromatic potpourri, floral candles, and organic room diffusers.',
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Upcycled Textile Products',
      slug: 'upcycled-textile-products',
      description: 'Tote bags, cushion covers, and aprons created from donated & repurposed garments.',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Gift Hampers',
      slug: 'gift-hampers',
      description: 'Luxury artisanal hampers blending botanical decor and upcycled luxury fabric keepsakes.',
      image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800',
    },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoriesMap[cat.slug] = created.id;
  }
  console.log('✅ Created Product Categories');

  // 4. Create Products
  const productsData = [
    {
      name: 'Sacred Marigold Potpourri Bowl Set',
      slug: 'sacred-marigold-potpourri-bowl-set',
      description: 'Handcrafted potpourri blend infused with essential oils and dried sacred temple marigold petals collected from Varanasi ghats.',
      details: 'Weight: 250g. Ingredients: Upcycled marigold petals, cinnamon bark, star anise, cedarwood essential oil. Packaging: 100% biodegradable kraft box.',
      price: 649,
      originalPrice: 899,
      stock: 45,
      sustainabilityLabel: 'Made from upcycled temple flowers',
      categorySlug: 'eco-friendly-home-decor',
      isFeatured: true,
      isBestseller: true,
      rating: 4.9,
      reviewCount: 28,
      images: [
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      name: 'Botanical Pressed Rose Wall Frame',
      slug: 'botanical-pressed-rose-wall-frame',
      description: 'Elegant wooden wall frame displaying carefully preserved red and pink rose petals from wedding decor waste.',
      details: 'Dimensions: 10x12 inches. Material: Teak wood frame, glass, upcycled wedding rose blooms. Handmade in small batches.',
      price: 1299,
      originalPrice: 1699,
      stock: 20,
      sustainabilityLabel: 'Made from upcycled wedding flora',
      categorySlug: 'handmade-floral-art',
      isFeatured: true,
      isBestseller: false,
      rating: 4.8,
      reviewCount: 14,
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      name: 'Bloomora Heritage Upcycled Cotton Tote Bag',
      slug: 'bloomora-heritage-upcycled-cotton-tote-bag',
      description: 'Sturdy, spacious tote bag crafted from donated heavy cotton garments featuring hand-printed floral motifs.',
      details: 'Dimensions: 15x17 inches with reinforced handles. Capacity: 15kg. Wash care: Gentle hand wash with cold water.',
      price: 499,
      originalPrice: 699,
      stock: 60,
      sustainabilityLabel: 'Made from 100% donated textiles',
      categorySlug: 'upcycled-textile-products',
      isFeatured: true,
      isBestseller: true,
      rating: 5.0,
      reviewCount: 42,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      name: 'Artisanal Floral Gift Box with Natural Incense Cones',
      slug: 'artisanal-floral-gift-box-with-natural-incense-cones',
      description: 'Zero-waste gift box containing 30 charcoal-free organic incense cones made from temple flower waste and pure sandalwood binder.',
      details: 'Contents: 30 incense cones, ceramic burner tile. Burn time: 35 minutes per cone. Non-toxic and chemical-free.',
      price: 799,
      originalPrice: 999,
      stock: 35,
      sustainabilityLabel: 'Zero-waste & chemical free',
      categorySlug: 'sustainable-gifts',
      isFeatured: false,
      isBestseller: true,
      rating: 4.7,
      reviewCount: 19,
      images: [
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      name: 'Preserved Hydrangea & Jasmine Wreath',
      slug: 'preserved-hydrangea-jasmine-wreath',
      description: 'A charming 12-inch rustic decorative wreath composed of naturally dried hydrangeas, jasmine petals, and jute weave.',
      details: 'Diameter: 12 inches. Material: Upcycled flower petals, bamboo ring, organic jute twines.',
      price: 1599,
      originalPrice: 1999,
      stock: 12,
      sustainabilityLabel: 'Made from upcycled flower waste',
      categorySlug: 'dried-flower-decorations',
      isFeatured: true,
      isBestseller: false,
      rating: 4.9,
      reviewCount: 9,
      images: [
        'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      name: 'Upcycled Denim & Floral Embroidery Cushion Cover Set',
      slug: 'upcycled-denim-floral-embroidery-cushion-cover-set',
      description: 'Set of two 16x16 inch cushion covers tailored from recycled denim denim and embellished with upcycled thread embroidery.',
      details: 'Size: 16x16 inches. Zipper closure. Includes 2 cushion covers (fillers not included). Eco-friendly dry clean recommended.',
      price: 899,
      originalPrice: 1299,
      stock: 25,
      sustainabilityLabel: 'Made from repurposed denim',
      categorySlug: 'upcycled-textile-products',
      isFeatured: false,
      isBestseller: false,
      rating: 4.6,
      reviewCount: 11,
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800',
      ],
    },
    {
      name: 'Bloomora Earth Luxe Celebration Hamper',
      slug: 'bloomora-earth-luxe-celebration-hamper',
      description: 'Premium curated hamper including hand-poured floral soy candle, temple marigold incense set, and upcycled cotton pouch.',
      details: 'Hamper inclusions: 1 Soy Wax Candle (200g), 1 Marigold Incense Box, 1 Handwoven Cotton Pouch, 1 Botanical Greeting Card.',
      price: 2499,
      originalPrice: 2999,
      stock: 15,
      sustainabilityLabel: 'Luxury Sustainable Collection',
      categorySlug: 'gift-hampers',
      isFeatured: true,
      isBestseller: true,
      rating: 5.0,
      reviewCount: 34,
      images: [
        'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800',
      ],
    },
  ];

  for (const prod of productsData) {
    const { categorySlug, images, ...rest } = prod;
    const categoryId = categoriesMap[categorySlug];

    const createdProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId,
        images: {
          create: images.map((url, index) => ({
            url,
            altText: prod.name,
            isPrimary: index === 0,
            displayOrder: index,
          })),
        },
      },
    });

    // Add sample review
    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        userName: 'Meera Iyer',
        rating: 5,
        comment: 'Absolutely stunning quality! The fragrance is subtle and knowing it comes from upcycled temple flowers makes it so special.',
        isApproved: true,
      },
    });
  }

  console.log('✅ Created Sample Products and Reviews');

  // 5. Create Sample Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'BLOOM10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 499,
        isActive: true,
      },
      {
        code: 'WELCOME200',
        discountType: 'FIXED',
        discountValue: 200,
        minOrderValue: 999,
        isActive: true,
      },
    ],
  });
  console.log('✅ Created Active Discount Coupons');

  // 6. Create Sample Clothing Donations & Flower Collections
  await prisma.donation.create({
    data: {
      donationNumber: 'DON-2026-8812',
      userId: demoUser.id,
      fullName: 'Ananya Sharma',
      mobile: '9812345678',
      email: 'user@bloomora.in',
      pickupAddress: '42 Lotus Heights, Indiranagar',
      city: 'Bengaluru',
      pinCode: '560038',
      clothingCategory: 'Gentle Wear & Winterwear',
      itemCount: 8,
      clothingCondition: 'Gently Used',
      preferredPickupDate: '2026-11-15',
      notes: 'Cleaned sarees and cotton shirts ready for donation redistribution.',
      status: 'APPROVED',
      adminNotes: 'Pickup slot scheduled with logistics partner.',
    },
  });

  await prisma.flowerCollection.create({
    data: {
      requestNumber: 'FLW-2026-3490',
      fullName: 'Sri Vinayaka Temple Trust',
      phone: '9876501234',
      email: 'contact@vinayakatemple.org',
      collectionAddress: '108 Temple Street, Malleshwaram',
      city: 'Bengaluru',
      pinCode: '560003',
      flowerSource: 'Temple',
      quantity: '25-50 kg per day',
      flowerType: 'Marigold, Jasmine, Hibiscus',
      preferredDate: 'Daily Morning',
      additionalInfo: 'Daily fresh garland waste after morning pooja.',
      status: 'ACCEPTED',
      adminNotes: 'Daily morning collection route assigned.',
    },
  });

  console.log('✅ Created Sample Donations and Flower Collections');

  // 7. Seed Website CMS Content
  const cmsEntries = [
    {
      key: 'hero_section',
      section: 'homepage',
      title: 'Beauty Beyond Waste.',
      subtitle: 'Giving discarded flowers a new life and unused clothes a new purpose. Discover a more beautiful way to live sustainably.',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=1200',
      content: 'BLOOMORA transforms discarded flowers and unused textiles into handcrafted artisanal home decor, botanical art, and eco-conscious lifestyle goods.',
    },
    {
      key: 'about_mission',
      section: 'about',
      title: 'Our Mission & Story',
      subtitle: 'Transforming waste into value while generating rural employment across India.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200',
      content: 'Over 8,000 tons of flower waste enter Indian rivers every year. Concurrently, thousands of tons of wearable clothing are discarded. BLOOMORA bridges this gap with dignified upcycling and redistribution.',
    },
    {
      key: 'donation_banner',
      section: 'donation',
      title: 'Your Unused Clothes Can Create Someone’s New Beginning.',
      subtitle: 'Donate gently used clothing for direct community donation or upcycling into sustainable accessories.',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200',
      content: 'Every garment donated is inspected, sanitized, and categorized for maximum social impact.',
    },
  ];

  for (const entry of cmsEntries) {
    await prisma.websiteContent.create({ data: entry });
  }

  console.log('✅ Seeded Website CMS Content');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
