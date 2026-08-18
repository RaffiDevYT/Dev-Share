import prisma from '../config/db.js';

export const createSnippet = async (req, res) => {
  const { title, description, codeContent, language, tags, folder, isPublic } = req.body;

  if (!title || !codeContent || !language) {
    return res.status(400).json({ message: 'Judul, konten kode, dan bahasa pemrograman wajib diisi' });
  }

  try {
    const newSnippet = await prisma.snippet.create({
      data: {
        title,
        description,
        codeContent,
        language,
        tags: tags || null,
        folder: folder ? folder.trim() : null,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
        userId: req.userId
      }
    });

    return res.status(201).json({
      message: 'Snippet berhasil dibuat',
      snippet: newSnippet
    });
  } catch (error) {
    console.error('Error in createSnippet:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat membuat snippet' });
  }
};

export const getSnippets = async (req, res) => {
  const { search, language, folder, visibility, mine } = req.query;

  try {
    const where = {
      AND: []
    };

    // Filter Hak Akses Visibilitas & Kepemilikan
    if (mine === 'true') {
      if (!req.userId) {
        return res.status(401).json({ message: 'Harap login untuk melihat snippet Anda' });
      }
      where.AND.push({ userId: req.userId });
    } else if (req.userId) {
      // Jika login: Tampilkan semua yang publik ATAU milik user itu sendiri
      where.AND.push({
        OR: [
          { isPublic: true },
          { userId: req.userId }
        ]
      });
    } else {
      // Jika guest: Hanya tampilkan yang publik
      where.AND.push({ isPublic: true });
    }

    // Filter Pencarian
    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { codeContent: { contains: search } },
          { tags: { contains: search } },
          { folder: { contains: search } }
        ]
      });
    }

    // Filter Bahasa Pemrograman
    if (language) {
      where.AND.push({ language: language });
    }

    // Filter Folder / Koleksi
    if (folder) {
      where.AND.push({ folder: folder });
    }

    // Filter Visibilitas Kustom (Public vs Private)
    if (visibility === 'public') {
      where.AND.push({ isPublic: true });
    } else if (visibility === 'private') {
      if (!req.userId) {
        return res.status(401).json({ message: 'Harap login untuk melihat snippet pribadi Anda' });
      }
      where.AND.push({ isPublic: false, userId: req.userId });
    }

    const snippets = await prisma.snippet.findMany({
      where: where.AND.length > 0 ? { AND: where.AND } : {},
      include: {
        user: {
          select: {
            username: true
          }
        },
        _count: {
          select: {
            bookmarks: true,
            comments: true
          }
        },
        bookmarks: req.userId ? {
          where: { userId: req.userId },
          select: { id: true }
        } : false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formatted = snippets.map(s => ({
      ...s,
      bookmarkCount: s._count?.bookmarks || 0,
      commentCount: s._count?.comments || 0,
      isBookmarked: req.userId ? (s.bookmarks && s.bookmarks.length > 0) : false
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in getSnippets:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil snippet' });
  }
};

export const getSnippetById = async (req, res) => {
  const { id } = req.params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            githubUrl: true
          }
        },
        _count: {
          select: {
            bookmarks: true,
            comments: true
          }
        },
        bookmarks: req.userId ? {
          where: { userId: req.userId },
          select: { id: true }
        } : false
      }
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet tidak ditemukan' });
    }

    // Periksa hak akses visibilitas
    if (!snippet.isPublic && snippet.userId !== req.userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk melihat snippet ini' });
    }

    const formatted = {
      ...snippet,
      bookmarkCount: snippet._count?.bookmarks || 0,
      commentCount: snippet._count?.comments || 0,
      isBookmarked: req.userId ? (snippet.bookmarks && snippet.bookmarks.length > 0) : false
    };

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in getSnippetById:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil detail snippet' });
  }
};

// Raw plain text code output
export const getRawSnippet = async (req, res) => {
  const { id } = req.params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: parseInt(id) }
    });

    if (!snippet) {
      return res.status(404).send('Snippet tidak ditemukan');
    }

    if (!snippet.isPublic && snippet.userId !== req.userId) {
      return res.status(403).send('Akses ditolak. Snippet bersifat privat.');
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(snippet.codeContent);
  } catch (error) {
    console.error('Error in getRawSnippet:', error);
    return res.status(500).send('Terjadi kesalahan pada server saat mengambil raw snippet');
  }
};

export const updateSnippet = async (req, res) => {
  const { id } = req.params;
  const { title, description, codeContent, language, tags, folder, isPublic } = req.body;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: parseInt(id) }
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet tidak ditemukan' });
    }

    // Validasi pemilik snippet
    if (snippet.userId !== req.userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk mengubah snippet ini' });
    }

    const updatedSnippet = await prisma.snippet.update({
      where: { id: parseInt(id) },
      data: {
        title: title !== undefined ? title : snippet.title,
        description: description !== undefined ? description : snippet.description,
        codeContent: codeContent !== undefined ? codeContent : snippet.codeContent,
        language: language !== undefined ? language : snippet.language,
        tags: tags !== undefined ? tags : snippet.tags,
        folder: folder !== undefined ? (folder ? folder.trim() : null) : snippet.folder,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : snippet.isPublic
      }
    });

    return res.status(200).json({
      message: 'Snippet berhasil diupdate',
      snippet: updatedSnippet
    });
  } catch (error) {
    console.error('Error in updateSnippet:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengubah snippet' });
  }
};

export const deleteSnippet = async (req, res) => {
  const { id } = req.params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: parseInt(id) }
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet tidak ditemukan' });
    }

    // Validasi pemilik snippet
    if (snippet.userId !== req.userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk menghapus snippet ini' });
    }

    await prisma.snippet.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({ message: 'Snippet berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteSnippet:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat menghapus snippet' });
  }
};

export const forkSnippet = async (req, res) => {
  const { id } = req.params;

  try {
    const originalSnippet = await prisma.snippet.findUnique({
      where: { id: parseInt(id) }
    });

    if (!originalSnippet) {
      return res.status(404).json({ message: 'Snippet yang ingin di-fork tidak ditemukan' });
    }

    // Hanya snippet publik atau milik sendiri yang bisa di-fork
    if (!originalSnippet.isPublic && originalSnippet.userId !== req.userId) {
      return res.status(403).json({ message: 'Snippet privat tidak dapat di-fork' });
    }

    // Buat salinan baru di akun user aktif
    const forkedSnippet = await prisma.snippet.create({
      data: {
        title: `${originalSnippet.title} (Fork)`,
        description: originalSnippet.description,
        codeContent: originalSnippet.codeContent,
        language: originalSnippet.language,
        tags: originalSnippet.tags,
        folder: originalSnippet.folder,
        isPublic: false, // Default ke privat di koleksi user
        userId: req.userId
      }
    });

    return res.status(201).json({
      message: 'Snippet berhasil di-fork ke koleksi Anda!',
      snippet: forkedSnippet
    });
  } catch (error) {
    console.error('Error in forkSnippet:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat melakukan fork snippet' });
  }
};
