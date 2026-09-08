import { PrismaClient, Role, ActivityCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing tables in dependency order
  await prisma.sharedTrip.deleteMany({});
  await prisma.tripMember.deleteMany({});
  await prisma.savedDestination.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.itineraryItem.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.tripStop.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Default Users (User & Admin)
  const passwordHash = bcrypt.hashSync('password123', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'user@globetrotter.com',
      passwordHash,
      role: Role.USER,
      profile: {
        create: {
          name: 'Elena Rostova',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
          language: 'English',
        },
      },
    },
  });

  const demoAdmin = await prisma.user.create({
    data: {
      email: 'admin@globetrotter.com',
      passwordHash,
      role: Role.ADMIN,
      profile: {
        create: {
          name: 'Chief Administrator',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
          language: 'English',
        },
      },
    },
  });

  console.log('👥 Standard user and Admin user created.');

  // 2. Create 12 International Cities
  const citiesData = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      latitude: 48.8566,
      longitude: 2.3522,
      description: 'The City of Light, famous for its romance, fashion, art, Eiffel Tower, and world-class gastronomy.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
      costIndex: 4,
      popularity: 10,
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      latitude: 41.9028,
      longitude: 12.4964,
      description: 'A cradle of ancient history, home of the Colosseum, Vatican City, and incredible pasta and gelato.',
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800',
      costIndex: 3,
      popularity: 9,
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      latitude: 35.6762,
      longitude: 139.6503,
      description: 'A neon-lit metropolis blending ultra-modern technology with historic temples and culinary perfection.',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
      costIndex: 4,
      popularity: 10,
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'Middle East',
      latitude: 25.2048,
      longitude: 55.2708,
      description: 'Known for luxury shopping, ultramodern architecture, Burj Khalifa, and vibrant desert activities.',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800',
      costIndex: 5,
      popularity: 9,
    },
    {
      name: 'London',
      country: 'United Kingdom',
      region: 'Europe',
      latitude: 51.5074,
      longitude: -0.1278,
      description: 'A global capital rich in history, royal heritage, world-class museums, and diverse neighborhoods.',
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
      costIndex: 4,
      popularity: 9,
    },
    {
      name: 'New York',
      country: 'United States',
      region: 'North America',
      latitude: 40.7128,
      longitude: -74.0060,
      description: 'The Big Apple, featuring iconic sights like Central Park, Broadway shows, and endless culinary variety.',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
      costIndex: 5,
      popularity: 10,
    },
    {
      name: 'Singapore',
      country: 'Singapore',
      region: 'Asia',
      latitude: 1.3521,
      longitude: 103.8198,
      description: 'A garden city offering futuristic architecture, Gardens by the Bay, and rich street food culture.',
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800',
      costIndex: 4,
      popularity: 9,
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      latitude: -8.4095,
      longitude: 115.1889,
      description: 'A tropical paradise offering scenic beaches, lush rice terraces, temples, and spiritual retreats.',
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
      costIndex: 2,
      popularity: 10,
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      latitude: 41.3851,
      longitude: 2.1734,
      description: 'Famed for Gaudi architecture, sunny beaches, delicious tapas, and late-night nightlife.',
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efedd?auto=format&fit=crop&q=80&w=800',
      costIndex: 3,
      popularity: 9,
    },
    {
      name: 'Amsterdam',
      country: 'Netherlands',
      region: 'Europe',
      latitude: 52.3676,
      longitude: 4.9041,
      description: 'Known for its artistic heritage, elaborate canal systems, historic houses, and bicycle culture.',
      imageUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=800',
      costIndex: 3,
      popularity: 8,
    },
    {
      name: 'Florence',
      country: 'Italy',
      region: 'Europe',
      latitude: 43.7696,
      longitude: 11.2558,
      description: 'The birthplace of the Renaissance, containing masterpiece art, the Duomo, and Tuscan culture.',
      imageUrl: 'https://images.unsplash.com/photo-1528114039593-4366cc08227d?auto=format&fit=crop&q=80&w=800',
      costIndex: 3,
      popularity: 8,
    },
    {
      name: 'Venice',
      country: 'Italy',
      region: 'Europe',
      latitude: 45.4408,
      longitude: 12.3155,
      description: 'A magical city built entirely on water, linked by canals, Gondolas, and bridges.',
      imageUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=800',
      costIndex: 4,
      popularity: 9,
    },
  ];

  const dbCities: any = {};
  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c });
    dbCities[c.name] = city;
  }
  console.log('🏙️ 12 International cities seeded.');

  // 3. Create 40+ Activities distributed across cities
  const activitiesData = [
    // Paris
    {
      cityName: 'Paris',
      name: 'Eiffel Tower Summit Access Tour',
      description: 'Ascend to the very top floor of the iconic Eiffel Tower for panoramic views of Paris.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 120,
      estimatedCost: 45.0,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Paris',
      name: 'Louvre Museum Masterpiece Tour',
      description: 'Skip-the-line tour featuring the Mona Lisa, Venus de Milo, and iconic paintings.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 180,
      estimatedCost: 65.0,
      imageUrl: 'https://images.unsplash.com/photo-1597910037310-7dd8ddb93e24?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Paris',
      name: 'Seine River Evening Dinner Cruise',
      description: 'Gourmet 3-course French dinner on a glass-canopy boat sailing past lit landmarks.',
      category: ActivityCategory.FOOD,
      durationMinutes: 150,
      estimatedCost: 95.0,
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Paris',
      name: 'Champs-Élysées Luxury Shopping Tour',
      description: 'A curated shopping excursion through high fashion flagships and local boutiques.',
      category: ActivityCategory.SHOPPING,
      durationMinutes: 240,
      estimatedCost: 20.0,
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400',
    },

    // Rome
    {
      cityName: 'Rome',
      name: 'Colosseum & Ancient Rome Walking Tour',
      description: 'Walk in the footsteps of gladiators through the Colosseum, Roman Forum, and Palatine Hill.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 180,
      estimatedCost: 40.0,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Rome',
      name: 'Trastevere Food Tour & Wine Pairing',
      description: 'Sample real Roman street food, classic pasta dishes, pizza bianca, and fine Italian wines.',
      category: ActivityCategory.FOOD,
      durationMinutes: 210,
      estimatedCost: 75.0,
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Rome',
      name: 'Vatican Museums & Sistine Chapel',
      description: 'Marvel at Michelangelo frescoes inside the Sistine Chapel and tour St. Peter Basilica.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 180,
      estimatedCost: 55.0,
      imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=400',
    },

    // Tokyo
    {
      cityName: 'Tokyo',
      name: 'Shibuya Crossing & Izakaya Night Tour',
      description: 'Traverse the worlds busiest pedestrian crossing and dive into hidden alleys for local beers and yakitori.',
      category: ActivityCategory.NIGHTLIFE,
      durationMinutes: 180,
      estimatedCost: 60.0,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Tokyo',
      name: 'Sushi Making Class in Toyosu Market',
      description: 'Learn the precise art of slicing sashimi and pressing nigiri sushi from a retired master chef.',
      category: ActivityCategory.FOOD,
      durationMinutes: 120,
      estimatedCost: 80.0,
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Tokyo',
      name: 'Mount Fuji Day Hiking Trip',
      description: 'Hike the scenic paths of Mount Fuji 5th station and enjoy stunning views of Lake Kawaguchi.',
      category: ActivityCategory.NATURE,
      durationMinutes: 480,
      estimatedCost: 110.0,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Tokyo',
      name: 'Akihabara Anime & Retro Arcade Hunt',
      description: 'Explore multi-story electronics shops, themed cafes, and treasure hunts for rare collectibles.',
      category: ActivityCategory.SHOPPING,
      durationMinutes: 180,
      estimatedCost: 15.0,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    },

    // Dubai
    {
      cityName: 'Dubai',
      name: 'Red Dunes Desert Safari & BBQ Dinner',
      description: 'Experience high-thrill dune bashing, sandboarding, camel rides, and a traditional buffet under the stars.',
      category: ActivityCategory.ADVENTURE,
      durationMinutes: 360,
      estimatedCost: 70.0,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Dubai',
      name: 'Burj Khalifa 124th Floor Observatory',
      description: 'Stand at the top of the worlds tallest skyscraper and watch the Dubai Fountain show from above.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 90,
      estimatedCost: 50.0,
      imageUrl: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Dubai',
      name: 'Marina Yacht Cruise & Sunset Dining',
      description: 'A luxurious catamaran cruise around Palm Jumeirah with fresh international grill selections.',
      category: ActivityCategory.NIGHTLIFE,
      durationMinutes: 120,
      estimatedCost: 85.0,
      imageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=400',
    },

    // London
    {
      cityName: 'London',
      name: 'Tower of London & Crown Jewels',
      description: 'Discover 1000 years of royal histories, dark prison secrets, and the sparkling Crown Jewels.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 150,
      estimatedCost: 35.0,
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'London',
      name: 'Soho West End Theatre Show',
      description: 'Watch a top award-winning musical show followed by drinks in a historic Soho tavern.',
      category: ActivityCategory.NIGHTLIFE,
      durationMinutes: 180,
      estimatedCost: 75.0,
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'London',
      name: 'British Museum Cultural Exploration',
      description: 'Guided tour highlighting the Rosetta Stone, Parthenon Sculptures, and Egyptian Mummies.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 120,
      estimatedCost: 30.0,
      imageUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&q=80&w=400',
    },

    // New York
    {
      cityName: 'New York',
      name: 'Empire State Building Observatory Access',
      description: 'Panoramic 360-degree views of Manhattan from the famous 86th floor open-air deck.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 90,
      estimatedCost: 48.0,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'New York',
      name: 'Central Park Guided Bike Tour',
      description: 'Ride past Strawberry Fields, Bethesda Fountain, Belvedere Castle, and scenic lake shores.',
      category: ActivityCategory.NATURE,
      durationMinutes: 120,
      estimatedCost: 35.0,
      imageUrl: 'https://images.unsplash.com/photo-1513829096990-4b22557457d9?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'New York',
      name: 'Broadway Musical Ticket',
      description: 'Premium orchestra seating for an iconic Broadway theater production in Times Square.',
      category: ActivityCategory.NIGHTLIFE,
      durationMinutes: 150,
      estimatedCost: 120.0,
      imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=400',
    },

    // Singapore
    {
      cityName: 'Singapore',
      name: 'Gardens by the Bay & Cloud Forest Dome',
      description: 'Stroll the skyway bridges connecting massive Supertrees and view the worlds tallest indoor waterfall.',
      category: ActivityCategory.NATURE,
      durationMinutes: 150,
      estimatedCost: 32.0,
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Singapore',
      name: 'Chinatown Michelin Hawker Food Safari',
      description: 'Tuck into soy sauce chicken noodles, laksa, and chili crab at local food centers.',
      category: ActivityCategory.FOOD,
      durationMinutes: 120,
      estimatedCost: 40.0,
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Singapore',
      name: 'Night Safari Zoo Adventure',
      description: 'Tram ride through nocturnal habitats watching lions, elephants, and leopards in natural lighting.',
      category: ActivityCategory.ADVENTURE,
      durationMinutes: 180,
      estimatedCost: 55.0,
      imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&q=80&w=400',
    },

    // Bali
    {
      cityName: 'Bali',
      name: 'Ubud White Water Rafting',
      description: 'Navigate scenic gorges and waterfalls along the Ayung River with expert guides.',
      category: ActivityCategory.ADVENTURE,
      durationMinutes: 240,
      estimatedCost: 45.0,
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Bali',
      name: 'Mount Batur Sunrise Trekking & Volcano',
      description: 'Early morning hike up an active volcano to watch the sunrise above the clouds.',
      category: ActivityCategory.NATURE,
      durationMinutes: 300,
      estimatedCost: 65.0,
      imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Bali',
      name: 'Seminyak Coastal Beach Club Sunset Lounge',
      description: 'Relax on a daybed with tropical drinks, house music, and scenic beach views.',
      category: ActivityCategory.NIGHTLIFE,
      durationMinutes: 180,
      estimatedCost: 25.0,
      imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=400',
    },

    // Barcelona
    {
      cityName: 'Barcelona',
      name: 'Sagrada Família Inside Out Architecture Tour',
      description: 'Guided architectural exploration inside Antoni Gaudis monumental unfinished cathedral.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 120,
      estimatedCost: 38.0,
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efedd?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Barcelona',
      name: 'Tapas & Gothic Quarter History Pub Crawl',
      description: 'Bar-hop ancient alleys sampling patatas bravas, jamon Iberico, pan con tomate, and sangria.',
      category: ActivityCategory.FOOD,
      durationMinutes: 180,
      estimatedCost: 55.0,
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Barcelona',
      name: 'La Rambla Shopping & La Boqueria Market',
      description: 'Browse fresh fruit stalls, local artisanal cheeses, and high-street fashion brands.',
      category: ActivityCategory.SHOPPING,
      durationMinutes: 150,
      estimatedCost: 10.0,
      imageUrl: 'https://images.unsplash.com/photo-1595954421407-ad5e012b25e5?auto=format&fit=crop&q=80&w=400',
    },

    // Amsterdam
    {
      cityName: 'Amsterdam',
      name: 'Historic Canal Sightseeing Cruise',
      description: 'Scenic cruise past historic houses and historic bridges in Amsterdams canal ring.',
      category: ActivityCategory.NATURE,
      durationMinutes: 75,
      estimatedCost: 22.0,
      imageUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Amsterdam',
      name: 'Van Gogh Museum Skip-The-Line Tour',
      description: 'Guided walk past the worlds largest collection of Vincent Van Gogh paintings and letters.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 120,
      estimatedCost: 45.0,
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Amsterdam',
      name: 'Red Light District Walk & Local Pubs',
      description: 'Historic evening walking tour through Amsterdams controversial and famous streets.',
      category: ActivityCategory.NIGHTLIFE,
      durationMinutes: 120,
      estimatedCost: 30.0,
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=400',
    },

    // Florence
    {
      cityName: 'Florence',
      name: 'Uffizi Gallery Renaissance Art Tour',
      description: 'View Botticellis Birth of Venus and masterpieces by Da Vinci and Michelangelo.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 150,
      estimatedCost: 42.0,
      imageUrl: 'https://images.unsplash.com/photo-1528114039593-4366cc08227d?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Florence',
      name: 'Tuscan Wine Estate Castle Tasting',
      description: 'Travel out to the Chianti hills for a wine tasting class inside a medieval castle.',
      category: ActivityCategory.FOOD,
      durationMinutes: 300,
      estimatedCost: 110.0,
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Florence',
      name: 'Ponte Vecchio Leather Artisan Market Tour',
      description: 'Watch local craftsmen hand-tool bags and jackets, plus gold shop viewing on the historic bridge.',
      category: ActivityCategory.SHOPPING,
      durationMinutes: 120,
      estimatedCost: 15.0,
      imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    },

    // Venice
    {
      cityName: 'Venice',
      name: 'Grand Canal Romantic Gondola Ride',
      description: 'A classic private Gondola cruise down tiny waterways under bridges with a local musician.',
      category: ActivityCategory.ADVENTURE,
      durationMinutes: 45,
      estimatedCost: 80.0,
      imageUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Venice',
      name: 'St. Marks Basilica & Doges Palace',
      description: 'Explore the golden mosaics of the Basilica and cross the famous Bridge of Sighs.',
      category: ActivityCategory.CULTURE,
      durationMinutes: 150,
      estimatedCost: 45.0,
      imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=400',
    },
    {
      cityName: 'Venice',
      name: 'Venetian Cicchetti & Spritz Food Crawl',
      description: 'Tour hidden Bacari wine bars eating small Venetian finger-foods alongside Aperol Spritz cocktails.',
      category: ActivityCategory.FOOD,
      durationMinutes: 120,
      estimatedCost: 50.0,
      imageUrl: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&q=80&w=400',
    },
  ];

  for (const act of activitiesData) {
    const city = dbCities[act.cityName];
    if (city) {
      await prisma.activity.create({
        data: {
          cityId: city.id,
          name: act.name,
          description: act.description,
          category: act.category,
          durationMinutes: act.durationMinutes,
          estimatedCost: act.estimatedCost,
          imageUrl: act.imageUrl,
        },
      });
    }
  }

  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
