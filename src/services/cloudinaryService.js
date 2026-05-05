const CLOUD_NAME = 'dya4zoc93';
const UPLOAD_PRESET = 'ml_default';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('فشل رفع الصورة');
  const data = await res.json();
  return data.secure_url;
};

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('فشل رفع الفيديو');
  const data = await res.json();
  return data.secure_url;
};
