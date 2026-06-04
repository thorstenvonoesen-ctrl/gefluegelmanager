import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abfjemmizsabqmcxxzsg.supabase.co';

const supabaseKey = 'sb_publishable_cEYnPZoezYNrSksIwQOEiw_UDf-XS8H';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
