import prisma from '../config/db.js';

// Ambil daftar komentar untuk snippet tertentu
export const getComments = async (req, res) => {
  const { id } = req.params;
  const snippetId = parseInt(id);

  try {
    const comments = await prisma.comment.findMany({
      where: { snippetId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error('Error in getComments:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil komentar' });
  }
};

// Tambah komentar baru pada snippet
export const createComment = async (req, res) => {
  const { id } = req.params;
  const snippetId = parseInt(id);
  const { content } = req.body;
  const userId = req.userId;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Isi komentar tidak boleh kosong' });
  }

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId }
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet tidak ditemukan' });
    }

    if (!snippet.isPublic && snippet.userId !== userId) {
      return res.status(403).json({ message: 'Tidak dapat mengomentari snippet privat orang lain' });
    }

    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        snippetId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Komentar berhasil ditambahkan',
      comment: newComment
    });
  } catch (error) {
    console.error('Error in createComment:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan komentar' });
  }
};

// Hapus komentar
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus komentar ini' });
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    return res.status(200).json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat menghapus komentar' });
  }
};
