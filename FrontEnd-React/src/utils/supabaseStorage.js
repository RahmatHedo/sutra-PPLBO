import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Upload foto panen ke Supabase Storage
 * @param {File} file - File objek dari input
 * @param {number} petaniId - ID petani untuk prefix nama file
 * @returns {string} URL publik foto yang bisa langsung dipakai di <img src>
 */
export async function uploadHarvestPhoto(file, petaniId) {
  const ext = file.name.split('.').pop();
  const fileName = `petani_${petaniId}_${Date.now()}.${ext}`;
  const filePath = `harvests/${fileName}`;

  // Upload ke bucket 'harvest-photos'
  const { error: uploadError } = await supabase.storage
    .from('harvest-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Upload gagal: ${uploadError.message}`);
  }

  // Ambil URL publik yang permanen
  const { data } = supabase.storage
    .from('harvest-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Hapus foto dari Supabase Storage (opsional, untuk cleanup)
 * @param {string} publicUrl - URL publik foto yang mau dihapus
 */
export async function deleteHarvestPhoto(publicUrl) {
  // Ekstrak path dari URL
  const url = new URL(publicUrl);
  const pathParts = url.pathname.split('/harvest-photos/');
  if (pathParts.length < 2) return;
  
  const filePath = pathParts[1];
  await supabase.storage.from('harvest-photos').remove([filePath]);
}
