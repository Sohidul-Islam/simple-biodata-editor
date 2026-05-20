'use server';

import { db } from '@/db';
import { biodatas } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { getSessionUser } from '@/lib/auth';

export interface SectionItem {
  id: string;
  label?: string;
  value?: string;
  tag?: string;
  title?: string;
  sub?: string;
}

export interface BiodataSection {
  id: string;
  title: string;
  layout: 'grid' | 'simple' | 'academic' | 'text';
  description?: string;
  items: SectionItem[];
}

export interface BiodataData {
  id: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  titleObjective: string;
  objectiveContent: string;
  theme: string;
  sections: BiodataSection[];
}

const DEFAULT_SECTIONS: BiodataSection[] = [
  {
    id: 'personal',
    title: 'Personal Details',
    layout: 'simple',
    items: [
      { id: 'p1', label: 'Full Name', value: 'MD Mubtashim Fuad Fahim' },
      { id: 'p2', label: 'Date of Birth', value: '20 October 1998' },
      { id: 'p3', label: 'Place of Birth', value: 'Chittagong, Bangladesh' },
      { id: 'p4', label: 'Marital Status', value: 'Unmarried' },
      { id: 'p5', label: 'Religion', value: 'Islam (Sunni)' },
      { id: 'p6', label: 'Blood Group', value: 'B+ (Positive)' },
      { id: 'p7', label: 'Nationality', value: 'Bangladeshi' },
      { id: 'p8', label: 'National ID No.', value: '1234567890123' },
    ],
  },
  {
    id: 'physical',
    title: 'Physical Attributes',
    layout: 'grid',
    items: [
      { id: 'ph1', label: 'Height', value: '5 feet 8 inches' },
      { id: 'ph2', label: 'Weight', value: '68 kg (approx.)' },
      { id: 'ph3', label: 'Complexion', value: 'Fair (Shyamla)' },
      { id: 'ph4', label: 'Body Type', value: 'Slim & Athletic' },
    ],
  },
  {
    id: 'education',
    title: 'Educational Qualification',
    layout: 'academic',
    items: [
      { id: 'ed1', tag: 'BBS', title: 'Bachelor of Business Studies (Hons)', sub: 'Government Commerce College, Chittagong — CGPA 3.20 (2022)' },
      { id: 'ed2', tag: 'HSC', title: 'Higher Secondary Certificate', sub: 'Govt. City College, Chittagong — GPA 4.50 (2018)' },
      { id: 'ed3', tag: 'SSC', title: 'Secondary School Certificate', sub: 'Nasirabad Govt. High School, Chittagong — GPA 4.83 (2016)' },
    ],
  },
  {
    id: 'work',
    title: 'Occupation & Financial Status',
    layout: 'grid',
    items: [
      { id: 'w1', label: 'Occupation', value: 'Graphic Designer' },
      { id: 'w2', label: 'Employer', value: 'FashionGlory Design Studio' },
      { id: 'w3', label: 'Monthly Income', value: 'BDT 35,000 – 40,000' },
      { id: 'w4', label: 'Property', value: 'Family-owned land & residential house' },
    ],
  },
  {
    id: 'family',
    title: 'Family Details',
    layout: 'grid',
    description: 'Details about your family background',
    items: [
      { id: 'f1', label: 'Siblings', value: 'Total 3 Brothers & 1 Sister' },
      { id: 'f2', label: 'Marital Status', value: 'Unmarried' },
    ],
  },
  {
    id: 'interests',
    title: 'Interests & Skills',
    layout: 'grid',
    description: 'Core competencies, hobbies, and other interests',
    items: [
      { id: 'i1', label: 'Main Language', value: 'Bengali & English' },
      { id: 'i2', label: 'Key Skills', value: 'Adobe Photoshop, Illustrator' },
      { id: 'i3', label: 'Main Hobbies', value: 'Traveling, Photography' },
      { id: 'i4', label: 'Nationality', value: 'Bangladeshi' },
    ],
  },
];

export async function getBiodatas() {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');
    const data = await db
      .select()
      .from(biodatas)
      .where(eq(biodatas.userId, user.id))
      .orderBy(desc(biodatas.createdAt));
    return data as BiodataData[];
  } catch (error) {
    console.error('Error fetching biodatas:', error);
    return [];
  }
}

export async function getBiodata(id: string) {
  try {
    // We allow fetching a biodata publicly (without session check) because of public sharing page /share/[id]
    // And Puppeteer needs to load it for PDF export.
    const data = await db.select().from(biodatas).where(eq(biodatas.id, id)).limit(1);
    if (data.length === 0) return null;
    return data[0] as BiodataData;
  } catch (error) {
    console.error('Error fetching biodata:', error);
    return null;
  }
}

export async function createDefaultBiodata(name: string = 'MD Mubtashim Fuad Fahim') {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    const id = crypto.randomUUID();
    const newBiodata = {
      id,
      userId: user.id,
      name,
      email: 'mdmubtashimfuadfahim@gmail.com',
      phone: '+88 01879386301',
      photo: null,
      titleObjective: 'About the Groom',
      objectiveContent: 'I am a sincere, God-fearing, and family-oriented young man from Chittagong. I am seeking a life partner who shares similar values, is kind-hearted, and is committed to building a peaceful and happy home together. My family is supportive of this proposal and looks forward to welcoming a new member with open arms.',
      theme: 'maroon',
      sections: DEFAULT_SECTIONS,
    };

    await db.insert(biodatas).values(newBiodata);
    revalidatePath('/');
    return id;
  } catch (error) {
    console.error('Error creating biodata:', error);
    throw new Error('Failed to create default biodata');
  }
}

export async function saveBiodata(id: string, data: Partial<BiodataData>) {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    const [existing] = await db
      .select()
      .from(biodatas)
      .where(and(eq(biodatas.id, id), eq(biodatas.userId, user.id)))
      .limit(1);

    if (!existing) {
      throw new Error('Unauthorized access or biodata not found');
    }

    // Omit primary key and database-managed timestamp fields from the update payload
    const updatePayload = { ...data };
    delete updatePayload.id;
    delete updatePayload.userId;
    
    const cleanPayload = updatePayload as Record<string, unknown>;
    delete cleanPayload.createdAt;
    delete cleanPayload.updatedAt;

    await db.update(biodatas).set(cleanPayload as Partial<typeof biodatas.$inferInsert>).where(eq(biodatas.id, id));
    revalidatePath(`/editor/${id}`);
    revalidatePath(`/share/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error saving biodata:', error);
    throw new Error('Failed to save biodata');
  }
}

export async function deleteBiodata(id: string) {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error('Unauthorized');

    const [existing] = await db
      .select()
      .from(biodatas)
      .where(and(eq(biodatas.id, id), eq(biodatas.userId, user.id)))
      .limit(1);

    if (!existing) {
      throw new Error('Unauthorized access or biodata not found');
    }

    await db.delete(biodatas).where(eq(biodatas.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting biodata:', error);
    throw new Error('Failed to delete biodata');
  }
}
