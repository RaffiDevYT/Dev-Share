import prisma from '../config/db.js';

// Ambil daftar semua topik forum diskusi
export const getForumTopics = async (req, res) => {
  const { category, search } = req.query;

  try {
    let topics = [];

    if (prisma.forumTopic) {
      const where = {};
      if (category && category !== 'Semua') {
        where.category = category;
      }
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { content: { contains: search } }
        ];
      }

      topics = await prisma.forumTopic.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          _count: {
            select: { replies: true }
          },
          replies: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              createdAt: true,
              user: {
                select: { username: true }
              }
            }
          }
        }
      });

      topics = topics.map(t => ({
        id: t.id,
        title: t.title,
        content: t.content,
        category: t.category,
        userId: t.userId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        author: t.user,
        replyCount: t._count?.replies || 0,
        lastReply: t.replies?.[0] ? {
          createdAt: t.replies[0].createdAt,
          username: t.replies[0].user.username
        } : null
      }));
    } else {
      // Raw SQL Fallback
      let query = `
        SELECT t.id, t.title, t.content, t.category, t.userId, t.createdAt, t.updatedAt,
               u.username as authorUsername,
               (SELECT COUNT(*) FROM forum_replies r WHERE r.topicId = t.id) as replyCount
        FROM forum_topics t
        JOIN users u ON t.userId = u.id
      `;

      const conditions = [];
      if (category && category !== 'Semua') {
        conditions.push(`t.category = ${JSON.stringify(category)}`);
      }
      if (search) {
        conditions.push(`(t.title LIKE ${JSON.stringify(`%${search}%`)} OR t.content LIKE ${JSON.stringify(`%${search}%`)})`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }

      query += ` ORDER BY t.updatedAt DESC`;

      const rows = await prisma.$queryRawUnsafe(query);
      topics = rows.map(r => ({
        id: r.id,
        title: r.title,
        content: r.content,
        category: r.category,
        userId: r.userId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        author: { id: r.userId, username: r.authorUsername },
        replyCount: Number(r.replyCount || 0),
        lastReply: null
      }));
    }

    return res.status(200).json(topics);
  } catch (error) {
    console.error('Error in getForumTopics:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat memuat topik forum' });
  }
};

// Ambil detail satu topik forum beserta seluruh balasannya
export const getForumTopicDetail = async (req, res) => {
  const { id } = req.params;
  const topicId = parseInt(id, 10);

  try {
    let topic;

    if (prisma.forumTopic) {
      topic = await prisma.forumTopic.findUnique({
        where: { id: topicId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              bio: true
            }
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  bio: true
                }
              }
            }
          }
        }
      });
    } else {
      const topicRows = await prisma.$queryRaw`
        SELECT t.id, t.title, t.content, t.category, t.userId, t.createdAt, t.updatedAt,
               u.username as authorUsername, u.bio as authorBio
        FROM forum_topics t
        JOIN users u ON t.userId = u.id
        WHERE t.id = ${topicId}
        LIMIT 1
      `;

      if (!topicRows || topicRows.length === 0) {
        return res.status(404).json({ message: 'Topik forum tidak ditemukan' });
      }

      const t = topicRows[0];
      const replyRows = await prisma.$queryRaw`
        SELECT r.id, r.content, r.topicId, r.userId, r.createdAt,
               u.username as authorUsername, u.bio as authorBio
        FROM forum_replies r
        JOIN users u ON r.userId = u.id
        WHERE r.topicId = ${topicId}
        ORDER BY r.createdAt ASC
      `;

      topic = {
        id: t.id,
        title: t.title,
        content: t.content,
        category: t.category,
        userId: t.userId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        user: { id: t.userId, username: t.authorUsername, bio: t.authorBio },
        replies: replyRows.map(r => ({
          id: r.id,
          content: r.content,
          topicId: r.topicId,
          userId: r.userId,
          createdAt: r.createdAt,
          user: { id: r.userId, username: r.authorUsername, bio: r.authorBio }
        }))
      };
    }

    if (!topic) {
      return res.status(404).json({ message: 'Topik forum tidak ditemukan' });
    }

    return res.status(200).json(topic);
  } catch (error) {
    console.error('Error in getForumTopicDetail:', error);
    return res.status(500).json({ message: 'Gagal memuat detail topik forum' });
  }
};

// Buat topik forum baru
export const createForumTopic = async (req, res) => {
  const userId = req.userId;
  const { title, content, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Judul topik forum wajib diisi' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Isi pembahasan forum wajib diisi' });
  }

  try {
    let created;

    if (prisma.forumTopic) {
      created = await prisma.forumTopic.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          category: category || 'Umum',
          userId
        },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      });
    } else {
      await prisma.$executeRaw`
        INSERT INTO forum_topics (title, content, category, userId, createdAt, updatedAt)
        VALUES (${title.trim()}, ${content.trim()}, ${category || 'Umum'}, ${userId}, NOW(), NOW())
      `;
      const rows = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id`;
      const newId = Number(rows[0].id);
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } });
      created = {
        id: newId,
        title: title.trim(),
        content: content.trim(),
        category: category || 'Umum',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        user
      };
    }

    return res.status(201).json({
      message: 'Topik forum berhasil dibuat',
      topic: created
    });
  } catch (error) {
    console.error('Error in createForumTopic:', error);
    return res.status(500).json({ message: 'Gagal membuat topik diskusi' });
  }
};

// Balas topik forum
export const replyForumTopic = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const { content } = req.body;
  const topicId = parseInt(id, 10);

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Balasan tidak boleh kosong' });
  }

  try {
    let reply;

    if (prisma.forumReply) {
      reply = await prisma.forumReply.create({
        data: {
          content: content.trim(),
          topicId,
          userId
        },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      });

      // Update timestamp topik agar naik ke atas
      await prisma.forumTopic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() }
      });
    } else {
      await prisma.$executeRaw`
        INSERT INTO forum_replies (content, topicId, userId, createdAt)
        VALUES (${content.trim()}, ${topicId}, ${userId}, NOW())
      `;
      await prisma.$executeRaw`
        UPDATE forum_topics SET updatedAt = NOW() WHERE id = ${topicId}
      `;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } });
      reply = {
        content: content.trim(),
        topicId,
        userId,
        createdAt: new Date(),
        user
      };
    }

    return res.status(201).json({
      message: 'Balasan berhasil dikirim',
      reply
    });
  } catch (error) {
    console.error('Error in replyForumTopic:', error);
    return res.status(500).json({ message: 'Gagal mengirim balasan forum' });
  }
};

// Hapus topik forum
export const deleteForumTopic = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const topicId = parseInt(id, 10);

  try {
    const existing = await prisma.$queryRaw`
      SELECT id, userId FROM forum_topics WHERE id = ${topicId} LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Topik forum tidak ditemukan' });
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus topik ini' });
    }

    await prisma.$executeRaw`DELETE FROM forum_topics WHERE id = ${topicId}`;

    return res.status(200).json({ message: 'Topik forum berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteForumTopic:', error);
    return res.status(500).json({ message: 'Gagal menghapus topik forum' });
  }
};

// Hapus balasan forum
export const deleteForumReply = async (req, res) => {
  const userId = req.userId;
  const { replyId } = req.params;
  const rId = parseInt(replyId, 10);

  try {
    const existing = await prisma.$queryRaw`
      SELECT id, userId FROM forum_replies WHERE id = ${rId} LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Balasan tidak ditemukan' });
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus balasan ini' });
    }

    await prisma.$executeRaw`DELETE FROM forum_replies WHERE id = ${rId}`;

    return res.status(200).json({ message: 'Balasan forum berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteForumReply:', error);
    return res.status(500).json({ message: 'Gagal menghapus balasan' });
  }
};
