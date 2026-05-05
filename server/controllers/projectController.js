const Project = require('../models/Project');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

const generateSlug = async (title) => {
  let base = slugify(title, { lower: true, strict: true });
  if (!base) base = 'project-' + Date.now();

  let slug = base;
  let counter = 1;
  while (await Project.findOne({ slug })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};

const getProjects = async (req, res) => {
  try {
    const { category, status, featured } = req.query;
    const filter = { isPublic: true };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (featured === 'true') filter.featured = true;

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم.', error: error.message });
  }
};

const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      return res.status(404).json({ message: 'المشروع غير موجود.' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم.', error: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم.', error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, location, category, status, featured, isPublic, videoLinks } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'العنوان والوصف مطلوبان.' });
    }

    const slug = await generateSlug(title);
    const images = [];
    const videos = [];

    if (req.files) {
      (req.files['images'] || []).forEach((file) => {
        images.push({ url: `/uploads/images/${file.filename}`, filename: file.filename });
      });
      (req.files['videos'] || []).forEach((file) => {
        videos.push({ type: 'upload', url: `/uploads/videos/${file.filename}`, filename: file.filename, title: file.originalname });
      });
    }

    if (videoLinks) {
      const links = JSON.parse(videoLinks);
      links.forEach((link) => {
        if (link.url && link.url.trim()) {
          videos.push({ type: 'link', url: link.url.trim(), title: link.title || 'فيديو' });
        }
      });
    }

    const project = await Project.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      location: location ? location.trim() : '',
      category: category || 'عقارات',
      status: status || 'متاح',
      images,
      videos,
      featured: featured === 'true' || featured === true,
      isPublic: isPublic !== 'false' && isPublic !== false,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم.', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'المشروع غير موجود.' });
    }

    const { title, description, location, category, status, featured, isPublic, videoLinks, removeImages, removeVideos } = req.body;

    if (title && title.trim() !== project.title) {
      project.title = title.trim();
      project.slug = await generateSlug(title);
    }
    if (description) project.description = description.trim();
    if (location !== undefined) project.location = location.trim();
    if (category) project.category = category;
    if (status) project.status = status;
    if (featured !== undefined) project.featured = featured === 'true' || featured === true;
    if (isPublic !== undefined) project.isPublic = isPublic !== 'false' && isPublic !== false;

    if (removeImages) {
      const toRemove = JSON.parse(removeImages);
      toRemove.forEach((filename) => {
        const filePath = path.join(__dirname, '../uploads/images', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      project.images = project.images.filter((img) => !toRemove.includes(img.filename));
    }

    if (removeVideos) {
      const toRemove = JSON.parse(removeVideos);
      const removeIds = toRemove.map((r) => r.toString());
      project.videos.forEach((v) => {
        if (removeIds.includes(v._id.toString()) && v.type === 'upload' && v.filename) {
          const filePath = path.join(__dirname, '../uploads/videos', v.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
      project.videos = project.videos.filter((v) => !removeIds.includes(v._id.toString()));
    }

    if (req.files) {
      (req.files['images'] || []).forEach((file) => {
        project.images.push({ url: `/uploads/images/${file.filename}`, filename: file.filename });
      });
      (req.files['videos'] || []).forEach((file) => {
        project.videos.push({ type: 'upload', url: `/uploads/videos/${file.filename}`, filename: file.filename, title: file.originalname });
      });
    }

    if (videoLinks) {
      const links = JSON.parse(videoLinks);
      links.forEach((link) => {
        if (link.url && link.url.trim()) {
          project.videos.push({ type: 'link', url: link.url.trim(), title: link.title || 'فيديو' });
        }
      });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم.', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'المشروع غير موجود.' });
    }

    project.images.forEach((img) => {
      const filePath = path.join(__dirname, '../uploads/images', img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    project.videos
      .filter((v) => v.type === 'upload' && v.filename)
      .forEach((v) => {
        const filePath = path.join(__dirname, '../uploads/videos', v.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف المشروع بنجاح.' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم.', error: error.message });
  }
};

module.exports = { getProjects, getProjectBySlug, getAllProjects, createProject, updateProject, deleteProject };
