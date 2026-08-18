import prisma from '../config/db.js';

// Toggle Star / Bookmark (Add if not bookmarked, remove if already bookmarked)
export const toggleBookmark = async (req, res) => {
  const { id } = req.params;
  const snippetId = parseInt(id);
  const userId = req.userId;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId }
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet tidak ditemukan' });
    }

    // Snippet privat orang lain tidak bisa dibookmark
    if (!snippet.isPublic && snippet.userId !== userId) {
      return res.status(403).json({ message: 'Snippet privat tidak dapat disimpan/dibookmark' });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_snippetId: {
          userId,
          snippetId
        }
      }
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id }
      });
      return res.status(200).json({
        message: 'Bookmark dihapus',
        isBookmarked: false
      });
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          snippetId
        }
      });
      return res.status(201).json({
        message: 'Snippet berhasil disimpan ke bookmark',
        isBookmarked: true
      });
    }
  } catch (error) {
    console.error('Error in toggleBookmark:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat memproses bookmark' });
  }
};

// Ambil semua snippet yang dibookmark oleh user login
export const getMyBookmarks = async (req, res) => {
  const userId = req.userId;

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        snippet: {
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
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format list snippets
    const snippets = bookmarks
      .map(b => b.snippet)
      .filter(Boolean)
      .map(s => ({
        ...s,
        isBookmarked: true,
        bookmarkCount: s._count?.bookmarks || 0,
        commentCount: s._count?.comments || 0
      }));

    return res.status(200).json(snippets);
  } catch (error) {
    console.error('Error in getMyBookmarks:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil daftar bookmark' });
  }
};
