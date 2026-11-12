import { PrismaClient, ComplaintStatus, ComplaintPriority, AIReviewState, Role } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  // Ensure citizen user exists
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@example.test' },
    update: {},
    create: {
      email: 'citizen@example.test',
      name: 'Demo Citizen',
      passwordHash: '$2b$12$e0L4a2BqT2QYfXp07E7BmeN6eF2HjH2E6S9oP2r0.G8M3YfP.uM3q',
      role: Role.CITIZEN,
    },
  });

  const complaintsData = [
    {
      title: 'Deep Hazardous Pothole on 100 Feet Road',
      description: 'Severe road depression approximately 8 inches deep in the center lane near the 12th Main junction. Two two-wheelers skidded this morning during peak traffic.',
      category: 'Pothole',
      status: ComplaintStatus.IN_PROGRESS,
      priority: ComplaintPriority.URGENT,
      latitude: 12.9716,
      longitude: 77.6412,
      address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      aiCategory: 'Pothole',
      aiSummary: 'Neural Vision v2.4 identified severe asphalt cavitation with high road hazard index (98.2% confidence). Emergency cold-mix asphalt dispatch recommended.',
      confidence: 0.982,
    },
    {
      title: 'Overflowing Municipal Garbage Bin at 5th Block',
      description: 'Solid waste container has not been cleared for over 4 days. Waste is spilling onto the pedestrian walkway creating severe odor and stray animal gathering.',
      category: 'Waste Management',
      status: ComplaintStatus.SUBMITTED,
      priority: ComplaintPriority.HIGH,
      latitude: 12.9352,
      longitude: 77.6245,
      address: '5th Block, Koramangala, Bengaluru, Karnataka 560095',
      photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      aiCategory: 'Waste Management',
      aiSummary: 'Solid municipal waste overflow detected. Estimated volume > 400kg blocking 2.4m of public sidewalk.',
      confidence: 0.965,
    },
    {
      title: 'High-Pressure Water Supply Main Leakage',
      description: 'Potable water pipe burst under the pavement causing continuous freshwater flooding onto the road. Water pressure in surrounding residential apartments has dropped.',
      category: 'Water Supply',
      status: ComplaintStatus.IN_REVIEW,
      priority: ComplaintPriority.URGENT,
      latitude: 12.9784,
      longitude: 77.6408,
      address: 'Defence Colony, Indiranagar, Bengaluru, Karnataka 560038',
      photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      aiCategory: 'Water Supply',
      aiSummary: 'Sub-surface hydraulic pipeline fracture detected. Continuous flow rate estimated at ~35 liters/min.',
      confidence: 0.974,
    },
    {
      title: 'Non-Functional Streetlight Cluster on 80 Feet Road',
      description: 'A series of 4 consecutive LED streetlights are completely off every night from 7 PM. Pedestrians facing darkness near the bus stop.',
      category: 'Streetlight',
      status: ComplaintStatus.IN_PROGRESS,
      priority: ComplaintPriority.MEDIUM,
      latitude: 12.9698,
      longitude: 77.6499,
      address: '80 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
      photoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
      aiCategory: 'Streetlight',
      aiSummary: 'Cluster luminaire power failure confirmed via dark-sky satellite anomaly and citizen imagery.',
      confidence: 0.951,
    },
    {
      title: 'Collapsed Stormwater Drainage Cover Plate',
      description: 'Precast concrete stormwater drain slab is broken and fallen into the gutter, leaving an open 4-foot deep drop hazard on the pedestrian walkway.',
      category: 'Drainage',
      status: ComplaintStatus.SUBMITTED,
      priority: ComplaintPriority.HIGH,
      latitude: 12.9625,
      longitude: 77.6382,
      address: 'Domlur Layout, Ward 112, Bengaluru, Karnataka 560071',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      aiCategory: 'Drainage',
      aiSummary: 'Structural concrete failure on drainage grate detected. High pedestrian fall risk identified.',
      confidence: 0.989,
    },
    {
      title: 'Broken Footpath & Missing Kerb Stones',
      description: 'Footpath pavers have caved in and kerb stones are dislodged by roots and construction debris. Senior citizens cannot navigate without stepping onto traffic road.',
      category: 'Footpath & Curb',
      status: ComplaintStatus.RESOLVED,
      priority: ComplaintPriority.MEDIUM,
      latitude: 12.9665,
      longitude: 77.6455,
      address: '14th Cross Road, Indiranagar, Bengaluru, Karnataka 560038',
      photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      aiCategory: 'Footpath & Curb',
      aiSummary: 'Pedestrian pavement disruption resolved. Fresh tactile paving installed and verified by ward engineering inspector.',
      confidence: 0.962,
    },
  ];

  for (const item of complaintsData) {
    const existing = await prisma.complaint.findFirst({
      where: { title: item.title },
    });

    if (!existing) {
      const created = await prisma.complaint.create({
        data: {
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status,
          priority: item.priority,
          latitude: item.latitude,
          longitude: item.longitude,
          address: item.address,
          photoUrl: item.photoUrl,
          aiCategory: item.aiCategory,
          aiSummary: item.aiSummary,
          userId: citizen.id,
          statusHistory: {
            create: [
              {
                toStatus: ComplaintStatus.SUBMITTED,
                changedById: citizen.id,
                notes: 'Complaint logged via CivicFix AI mobile app',
              },
              ...(item.status !== ComplaintStatus.SUBMITTED
                ? [
                    {
                      fromStatus: ComplaintStatus.SUBMITTED,
                      toStatus: item.status,
                      notes: `Status transitioned to ${item.status} by Municipal Operations Team`,
                    },
                  ]
                : []),
            ],
          },
          aiAnalyses: {
            create: {
              category: item.aiCategory,
              summary: item.aiSummary,
              priority: item.priority,
              confidence: item.confidence,
              reason: `Automated vision model match for ${item.category}`,
              needsHumanReview: item.status === ComplaintStatus.SUBMITTED,
              provider: 'civicfix-neural-vision',
              model: 'CivicFix AI Vision Model v2.4 (IBM Bobathon)',
              state:
                item.status === ComplaintStatus.RESOLVED
                  ? AIReviewState.APPROVED
                  : AIReviewState.PENDING,
            },
          },
        },
      });
      console.log(`Created realistic complaint: ${created.title} (${created.id})`);
    } else {
      console.log(`Complaint already present: ${existing.title}`);
    }
  }

  console.log('Seeding of realistic civic complaints completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
