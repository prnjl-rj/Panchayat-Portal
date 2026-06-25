import { ServiceStaff, VisitorRecord, Announcement, SocietyRule } from "./types";

export const SOCIETY_NAME = "Greenwood Heights Society";
export const SOCIETY_ADDRESS = "Sector 14, Royal Greens Enclave, Gurgaon, Haryana";

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Urgent: Water Tank Cleaning Scheduled",
    content: "Please note that the main water tanks for Phase 1 (Towers A, B & C) will be cleaned tomorrow. Water supply will be unavailable from 10:00 AM to 2:00 PM. Please store sufficient water in advance.",
    sender: "Management Committee - General Secretary",
    date: "2026-06-22T08:00:00Z",
    priority: "High"
  },
  {
    id: "ann-2",
    title: "Eco-Friendly Dry Waste Collection Drive",
    content: "Greenwood Heights is initiating a special scrap and dry plastic recycling collection drive this Saturday in the club lawn. Bring your old electronics, dry boxes, and unused materials to support our green initiative.",
    sender: "Green Committee",
    date: "2026-06-20T14:30:00Z",
    priority: "Normal"
  },
  {
    id: "ann-3",
    title: "Annual Monsoon Pest Control in Corridors",
    content: "The annual pest control spray in common corridors, shafts, and basement areas is scheduled from June 25th to June 27th. Please keep main doors locked when operations are carried out on your floor.",
    sender: "Facility Manager",
    date: "2026-06-18T10:15:00Z",
    priority: "Normal"
  }
];

export const SERVICE_STAFF_DIRECTORY: ServiceStaff[] = [
  {
    id: "st-1",
    name: "Rahul Sharma",
    category: "Plumber",
    rating: 4.8,
    contactName: "Rahul Sharma (Lead Plumber)",
    phone: "+91 98765 43210",
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop",
    experienceYears: 6,
    baseCharge: "₹199 / Visit"
  },
  {
    id: "st-2",
    name: "Manpreet Singh",
    category: "Plumber",
    rating: 4.5,
    contactName: "Manpreet plumbing",
    phone: "+91 88877 66551",
    isAvailable: false,
    avatar: "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=200&auto=format&fit=crop",
    experienceYears: 4,
    baseCharge: "₹149 / Visit"
  },
  {
    id: "st-3",
    name: "Sunil Verma",
    category: "Electrician",
    rating: 4.9,
    contactName: "Sunil Electro-services",
    phone: "+91 91122 33445",
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop",
    experienceYears: 8,
    baseCharge: "₹249 / Visit"
  },
  {
    id: "st-4",
    name: "Deepak Kumar",
    category: "Electrician",
    rating: 4.2,
    contactName: "Deepak Elec Help",
    phone: "+91 94567 45678",
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
    experienceYears: 3,
    baseCharge: "₹129 / Visit"
  },
  {
    id: "st-5",
    name: "QuickDry Laundry",
    category: "Laundry",
    rating: 4.7,
    contactName: "Rajender Prasad (Manager)",
    phone: "+91 81223 99887",
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1545173168-9f1947eebd01?q=80&w=200&auto=format&fit=crop",
    experienceYears: 10,
    baseCharge: "₹40 / Kg (Wash & Fold)"
  },
  {
    id: "st-6",
    name: "Ramesh House Cleaning Partners",
    category: "Housekeeping",
    rating: 4.6,
    contactName: "Ramesh Chand",
    phone: "+91 70098 76543",
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=200&auto=format&fit=crop",
    experienceYears: 5,
    baseCharge: "₹499 (3-BHK Floor Mopping)"
  },
  {
    id: "st-7",
    name: "Shyam Shiny Car Wash",
    category: "Car Wash",
    rating: 4.8,
    contactName: "Shyam Sunder",
    phone: "+91 98881 22334",
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=200&auto=format&fit=crop",
    experienceYears: 7,
    baseCharge: "₹300 / Month (Daily External)"
  },
  {
    id: "st-8",
    name: "Express Pest Shield",
    category: "Pest Control",
    rating: 4.4,
    contactName: "Vikram Sethi",
    phone: "+91 99990 88880",
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=200&auto=format&fit=crop",
    experienceYears: 4,
    baseCharge: "₹899 Base Pack"
  }
];

export const INITIAL_VISITORS: VisitorRecord[] = [
  {
    id: "vis-1",
    visitorName: "Amit Mishra",
    purpose: "Zomato Delivery Food",
    flatNumber: "Tower B - 1204",
    entryTime: "22:38",
    status: "Waiting at Gate"
  },
  {
    id: "vis-2",
    visitorName: "Arun (Urban Company)",
    purpose: "Sofa Cleaning Specialist",
    flatNumber: "Tower A - 601",
    entryTime: "21:10",
    status: "Approved"
  },
  {
    id: "vis-3",
    visitorName: "Karan Malhotra",
    purpose: "Personal Guest / Friend",
    flatNumber: "Tower C - 402",
    entryTime: "18:30",
    status: "Checked Out"
  }
];

export const RULEBOOK_TEXT = `Greenwood Heights Housing Society Rules and Guidelines

1. AMENITY TIMINGS & GUIDELINES
- Gymnasium: The society gym is open from 6:00 AM to 10:00 PM every day. Residents must wear cleanup sports shoes. Outside trainers must be registered at the maintenance agency. Kids under 14 are not permitted in the gym without an adult.
- Swimming Pool: Open daily from 7:00 AM to 12:00 PM (Morning sessions) and 4:00 PM to 9:00 PM (Evening sessions). The pool is closed on Mondays for chlorination & deep maintenance. Wearing proper nylon / spandex swimwear is mandatory. Any resident with infectious diseases is prohibited. Kids under 12 must be supervised at all times.
- Community Hall & Parties: Community Hall bookings can be reserved up to 90 days in advance via the app. There is a refundable security deposit of ₹15,000 and standard rental of ₹5,000/day. Playing heavy bass music, drums, or using loud audio systems of any kind on the open lawns or within the hall is strictly prohibited after 10:00 PM as per local guidelines. Late-night catering cleanups must be completed by 11:30 PM.
- Inner Pathway & Athletics: Fast bicycling or skateboarding is completely forbidden in common parking bay ramps or standard ground walkways. Roller skate classes are allowed on Saturday & Sunday mornings on tennis courts when empty.

2. PARKING & VEHICLE ACCESS
- Resident Parking: Reserved basement bay parking is allotted on an owner/tenant basis. Only vehicles carrying the Greenwood Heights RFID decal will gain access through the automated boom barrier.
- Visitor Parking: No visitors are permitted to park in basement spaces. Visitors must park inside designated visitor parking bays on the ground-floor level. Visitor parking is free of charge up to 4 hours, and costs ₹50 per hour thereafter.
- Speed Limits: Any vehicle (including motorbikes and delivery scooters) must maintain a strict speed limit of 10 km/h once inside the society main gate. Excessive speeding will invite a fine of ₹1,000.
- Cabs / Uber / Ola: Drivers are permitted entry up to the respective tower main lobby for dropping or picking up passengers, including heavy luggage loading. No standby idling allowed beyond 10 minutes.

3. PETS POLICY
- Corridors and Common Spaces: Pets must remain leashed at all times when outside the flat. 
- Pet Waste Disposal: It is the absolute duty of the pet owner to immediately scoop and dispose of their pet's waste in green bins. If caught on elevator or pathway CCTV violating this, a fine of ₹2,000 will be levied.
- Prohibited Areas: Pets are strictly prohibited inside the club lobbies, gymnasium, badminton courts, clubhouse indoor rooms, and swimming pool enclosures.
- Elevator Courtesy: Inside lifts, residents or tenants with pets must stand aside to respect fellow co-passengers. If any coordinate occupant declines sharing the elevator, the pet handler must wait for the next lift.

4. QUIET HOURS & REPAIR WORK
- Quiet Hours: Quiet hours are strictly maintained from 10:00 PM to 7:00 AM. Any high-volume noise, party shouting, or loud television setting is prohibited.
- Home Renovations & Drills: Heavy masonry breaking, civil works, or drill works inside individual flats are exclusively allowed between 9:00 AM and 6:00 PM, Monday through Saturday. No construction or high-decibel work is allowed on Sundays or gazetted public holidays.
- All renovation builders must take a written NOC (No Objection Certificate) from the management office prior to loading building supplies.

5. WASTE SEGREGATION & SANITATION
- Organic (Wet) Waste: Fruits, food scraps, leaves, and wet organic matters go in the Green Bin.
- Recyclable (Dry) Waste: Cardboards, clean papers, empty plastic bottles, and tins go in the Blue Bin.
- Door-to-Door Collection: Housekeeping staff will visit your entrance for trash collection daily between 8:30 AM and 10:00 AM. Flat owners leaving bags outside corridors overnight will be warned, then fined ₹500 on repeat occurrences.

6. ESTATE MAINTENANCE CHARGES
- Maintenance collections compile by the 5th of each calendar month. Payments made after the 10th are subject to a late charge of 12% annual interest on outstanding balances.
- Non-payment of maintenance continuously for more than 4 months can result in suspension of non-essential club facilities and common power backup links.
`;

export const SOCIETY_RULES: SocietyRule[] = [
  {
    category: "Gym",
    title: "Timings & Access",
    detail: "Open daily from 6:00 AM to 10:00 PM. Access is strictly on a membership/apartment basis. Clean indoor sports shoes are required."
  },
  {
    category: "Swimming Pool",
    title: "Timings & Maintenance",
    detail: "Open daily 7 AM - 12 PM, and 4 PM - 9 PM. Closed on Mondays for chemical chlorination & deep hygiene cleans."
  },
  {
    category: "Parties",
    title: "Community Hall Booking",
    detail: "Parties allowed within the Community Hall from 10 AM to 10:30 PM. Loud heavy bass audio must shut down completely at 10:00 PM."
  },
  {
    category: "Visitors",
    title: "Gate Registration",
    detail: "All guest vehicles dry-register at the security kiosk. Visitor parking bays are layout-spaced on Ground level. Free for the first 4 hours."
  },
  {
    category: "Pets",
    title: "Elevator & Poop scoops",
    detail: "Pets must be leashed. Immediate scoop-up of pet waste mandatory. Penalty of ₹2,000 for littering common walkways or elevator units."
  },
  {
    category: "Renovations",
    title: "Civil Work Hours",
    detail: "Allowed strictly 9:00 AM to 6:00 PM (Monday-Saturday). Drilling or structural hammering is strictly banned on Sundays."
  },
  {
    category: "Refuse",
    title: "Waste Segregation",
    detail: "Trash collection daily 8:30 AM - 10 AM. Mandatory segregation of Wet waste (Green) and Recyclable Dry waste (Blue)."
  }
];
