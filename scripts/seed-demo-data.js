import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDemoData() {
  try {
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail('estasicki@dev.com');
    
    if (userError || !user?.user) {
      console.error('User estasicki@dev.com not found. Please create the user first.');
      process.exit(1);
    }

    const userId = user.user.id;

    const months = [
      { date: '2024-11-01', notes: 'Listopad 2024' },
      { date: '2024-12-01', notes: 'Grudzień 2024' },
      { date: '2025-01-01', notes: 'Styczeń 2025' }
    ];

    const monthIds = {};

    for (const month of months) {
      const { data, error } = await supabase
        .from('months')
        .upsert({
          user_id: userId,
          date: month.date,
          notes: month.notes
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating month ${month.date}:`, error);
        continue;
      }

      monthIds[month.date] = data.id;
      console.log(`✓ Created month: ${month.date}`);
    }

    const bills = [
      { month: '2024-11-01', name: 'Prąd', amount: 250.00, category_id: 'electricity', comment: 'Rachunek za listopad' },
      { month: '2024-11-01', name: 'Woda', amount: 120.50, category_id: 'water', comment: null },
      { month: '2024-11-01', name: 'Gaz', amount: 180.00, category_id: 'gas', comment: null },
      { month: '2024-11-01', name: 'Internet', amount: 79.99, category_id: 'internet', comment: 'Abonament miesięczny' },
      { month: '2024-11-01', name: 'Śmieci', amount: 45.00, category_id: 'trash', comment: null },
      { month: '2024-12-01', name: 'Prąd', amount: 280.00, category_id: 'electricity', comment: 'Rachunek za grudzień' },
      { month: '2024-12-01', name: 'Woda', amount: 125.00, category_id: 'water', comment: null },
      { month: '2024-12-01', name: 'Gaz', amount: 195.50, category_id: 'gas', comment: null },
      { month: '2024-12-01', name: 'Internet', amount: 79.99, category_id: 'internet', comment: 'Abonament miesięczny' },
      { month: '2024-12-01', name: 'Ogrzewanie', amount: 350.00, category_id: 'heating', comment: 'Sezon grzewczy' },
      { month: '2024-12-01', name: 'Ubezpieczenie', amount: 150.00, category_id: 'insurance', comment: 'Miesięczna rata' },
      { month: '2025-01-01', name: 'Prąd', amount: 265.00, category_id: 'electricity', comment: 'Rachunek za styczeń' },
      { month: '2025-01-01', name: 'Woda', amount: 118.00, category_id: 'water', comment: null },
      { month: '2025-01-01', name: 'Gaz', amount: 175.00, category_id: 'gas', comment: null },
      { month: '2025-01-01', name: 'Internet', amount: 79.99, category_id: 'internet', comment: 'Abonament miesięczny' },
      { month: '2025-01-01', name: 'Ogrzewanie', amount: 320.00, category_id: 'heating', comment: 'Sezon grzewczy' }
    ];

    let inserted = 0;
    for (const bill of bills) {
      const monthId = monthIds[bill.month];
      if (!monthId) {
        console.error(`Month ${bill.month} not found`);
        continue;
      }

      const { error } = await supabase
        .from('bills')
        .insert({
          month_id: monthId,
          name: bill.name,
          amount: bill.amount,
          category_id: bill.category_id,
          comment: bill.comment
        });

      if (error) {
        console.error(`Error inserting bill ${bill.name}:`, error);
        continue;
      }

      inserted++;
    }

    console.log(`\n✓ Successfully inserted ${inserted} bills for user estasicki@dev.com`);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();

