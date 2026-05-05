import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import slugify from 'slugify';

const PROJECTS = 'projects';
const GALLERY  = 'gallery';

const docToProject = (d) => {
  const data = d.data();
  return {
    ...data,
    id: d.id,
    _id: d.id,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
};

const docToItem = docToProject;

async function generateSlug(title, excludeId = null) {
  let base = slugify(title, { lower: true, strict: true });
  if (!base) base = 'project-' + Date.now();

  let slug = base;
  let counter = 1;

  while (true) {
    const snap = await getDocs(query(collection(db, PROJECTS), where('slug', '==', slug)));
    const conflicts = snap.docs.filter((d) => d.id !== excludeId);
    if (conflicts.length === 0) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return {
      data: {
        message: 'تم تسجيل الدخول بنجاح.',
        admin: { id: cred.user.uid, email: cred.user.email },
      },
    };
  },

  verify: () =>
    new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        if (user) resolve({ data: { valid: true, admin: { id: user.uid, email: user.email } } });
        else reject(new Error('غير مصادق'));
      });
    }),

  logout: () => signOut(auth),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
// NOTE: No orderBy in Firestore queries to avoid composite index requirements.
//       Sorting is done client-side instead.

export const projectsAPI = {
  getAll: async (params = {}) => {
    const snap = await getDocs(
      query(collection(db, PROJECTS), where('isPublic', '==', true))
    );
    let projects = snap.docs
      .map(docToProject)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (params.category) projects = projects.filter((p) => p.category === params.category);
    if (params.status)   projects = projects.filter((p) => p.status === params.status);
    if (params.featured === true || params.featured === 'true')
      projects = projects.filter((p) => p.featured);

    return { data: projects };
  },

  getBySlug: async (slug) => {
    const snap = await getDocs(
      query(collection(db, PROJECTS), where('slug', '==', slug), where('isPublic', '==', true))
    );
    if (snap.empty) {
      const err = new Error('المشروع غير موجود.');
      err.response = { status: 404, data: { message: 'المشروع غير موجود.' } };
      throw err;
    }
    return { data: docToProject(snap.docs[0]) };
  },

  adminGetAll: async () => {
    const snap = await getDocs(collection(db, PROJECTS));
    const projects = snap.docs
      .map(docToProject)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { data: projects };
  },

  // images: [{ url, filename }]
  // videos: [{ type, url, filename?, title }]
  // coverImage: string (Cloudinary URL, optional)
  create: async ({ form, images = [], videos = [], coverImage = '' }) => {
    const slug = await generateSlug(form.title);
    const docRef = await addDoc(collection(db, PROJECTS), {
      title: form.title.trim(),
      slug,
      description: form.description.trim(),
      location: form.location?.trim() || '',
      category: form.category || 'عقارات',
      status: form.status || 'متاح',
      featured: Boolean(form.featured),
      isPublic: form.isPublic !== false,
      coverImage: coverImage || '',
      images,
      videos,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const updated = await getDoc(docRef);
    return { data: docToProject(updated) };
  },

  update: async (id, { form, images, videos, coverImage }) => {
    const docRef = doc(db, PROJECTS, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const err = new Error('المشروع غير موجود.');
      err.response = { status: 404, data: { message: 'المشروع غير موجود.' } };
      throw err;
    }

    const project = snap.data();
    const updates = { updatedAt: serverTimestamp() };

    if (form.title?.trim() && form.title.trim() !== project.title) {
      updates.title = form.title.trim();
      updates.slug  = await generateSlug(form.title, id);
    } else if (form.title?.trim()) {
      updates.title = form.title.trim();
    }
    if (form.description)        updates.description = form.description.trim();
    if (form.location !== undefined) updates.location = form.location?.trim() || '';
    if (form.category)           updates.category  = form.category;
    if (form.status)             updates.status    = form.status;
    if (form.featured !== undefined) updates.featured = Boolean(form.featured);
    if (form.isPublic !== undefined) updates.isPublic = form.isPublic !== false;
    if (coverImage  !== undefined)   updates.coverImage = coverImage || '';
    if (images      !== undefined)   updates.images  = images;
    if (videos      !== undefined)   updates.videos  = videos;

    await updateDoc(docRef, updates);
    const updated = await getDoc(docRef);
    return { data: docToProject(updated) };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, PROJECTS, id));
    return { data: { message: 'تم حذف المشروع بنجاح.' } };
  },
};

// ─── Gallery (أعمال الشركة) ───────────────────────────────────────────────────

export const galleryAPI = {
  getAll: async () => {
    const snap = await getDocs(collection(db, GALLERY));
    const items = snap.docs
      .map(docToItem)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { data: items };
  },

  // title, description, mediaUrls: [{ type:'image'|'video', url }]
  create: async ({ title = '', description = '', mediaUrls = [] }) => {
    const docRef = await addDoc(collection(db, GALLERY), {
      title:       title.trim(),
      description: description.trim(),
      mediaUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const updated = await getDoc(docRef);
    return { data: docToItem(updated) };
  },

  update: async (id, { title, description, mediaUrls }) => {
    const docRef = doc(db, GALLERY, id);
    const updates = { updatedAt: serverTimestamp() };
    if (title       !== undefined) updates.title       = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (mediaUrls   !== undefined) updates.mediaUrls   = mediaUrls;
    await updateDoc(docRef, updates);
    const updated = await getDoc(docRef);
    return { data: docToItem(updated) };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, GALLERY, id));
    return { data: { message: 'تم الحذف بنجاح.' } };
  },
};

export default { authAPI, projectsAPI, galleryAPI };
