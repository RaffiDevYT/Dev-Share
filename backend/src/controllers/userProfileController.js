import prisma from '../config/db.js';

// Ambil profil publik pengguna beserta statistik, info lengkap, dan daftar snippet publiknya
export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        location: true,
        skills: true,
        createdAt: true,
        snippets: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
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
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Hitung total stars / bookmarks yang didapatkan dari semua snippet user
    const userSnippets = user.snippets.map(s => ({
      ...s,
      bookmarkCount: s._count?.bookmarks || 0,
      commentCount: s._count?.comments || 0
    }));

    const totalStars = userSnippets.reduce((acc, curr) => acc + curr.bookmarkCount, 0);
    const totalComments = userSnippets.reduce((acc, curr) => acc + curr.commentCount, 0);

    // Kumpulkan bahasa favorit/paling sering dipakai
    const languageCounts = {};
    userSnippets.forEach(s => {
      if (s.language) {
        const lang = s.language.toLowerCase();
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ language: lang, count }));

    // Ambil jumlah total pesan diskusi di profil
    let messageCount = 0;
    try {
      if (prisma.profileMessage) {
        messageCount = await prisma.profileMessage.count({
          where: { profileUserId: user.id }
        });
      } else {
        const countRes = await prisma.$queryRaw`SELECT COUNT(*) as count FROM profile_messages WHERE profileUserId = ${user.id}`;
        messageCount = Number(countRes[0]?.count || 0);
      }
    } catch (e) {
      // fallback jika tabel belum terisi
      messageCount = 0;
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      githubUrl: user.githubUrl,
      websiteUrl: user.websiteUrl,
      location: user.location,
      skills: user.skills,
      createdAt: user.createdAt,
      stats: {
        totalSnippets: userSnippets.length,
        totalStars,
        totalComments,
        totalProfileMessages: messageCount,
        topLanguages
      },
      snippets: userSnippets
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data profil pengguna' });
  }
};

// Update bio / info profil pengguna aktif
export const updateMyProfile = async (req, res) => {
  const userId = req.userId;
  const { bio, githubUrl, websiteUrl, location, skills } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        bio: bio !== undefined ? bio : undefined,
        githubUrl: githubUrl !== undefined ? githubUrl : undefined,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : undefined,
        location: location !== undefined ? location : undefined,
        skills: skills !== undefined ? skills : undefined
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        location: true,
        skills: true,
        createdAt: true
      }
    });

    return res.status(200).json({
      message: 'Profil berhasil diperbarui',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateMyProfile:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui profil' });
  }
};

// Ambil pesan forum diskusi / chat di profil pengguna
export const getProfileMessages = async (req, res) => {
  const { username } = req.params;

  try {
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    let messages = [];
    if (prisma.profileMessage) {
      messages = await prisma.profileMessage.findMany({
        where: {
          profileUserId: targetUser.id,
          parentId: null // Ambil pesan utama
        },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true
            }
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        }
      });
    } else {
      // Raw fallback
      const rawRows = await prisma.$queryRaw`
        SELECT m.id, m.content, m.profileUserId, m.authorId, m.parentId, m.createdAt,
               u.username as authorUsername
        FROM profile_messages m
        JOIN users u ON m.authorId = u.id
        WHERE m.profileUserId = ${targetUser.id}
        ORDER BY m.createdAt DESC
      `;
      
      const rootMap = new Map();
      const allReplies = [];

      for (const row of rawRows) {
        const item = {
          id: row.id,
          content: row.content,
          profileUserId: row.profileUserId,
          authorId: row.authorId,
          parentId: row.parentId,
          createdAt: row.createdAt,
          author: { id: row.authorId, username: row.authorUsername },
          replies: []
        };

        if (!row.parentId) {
          rootMap.set(row.id, item);
        } else {
          allReplies.push(item);
        }
      }

      for (const reply of allReplies) {
        if (rootMap.has(reply.parentId)) {
          rootMap.get(reply.parentId).replies.push(reply);
        }
      }

      messages = Array.from(rootMap.values());
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getProfileMessages:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat memuat diskusi profil' });
  }
};

// Kirim pesan / chatting di forum profil
export const createProfileMessage = async (req, res) => {
  const { username } = req.params;
  const { content, parentId } = req.body;
  const authorId = req.userId;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Konten pesan tidak boleh kosong' });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true }
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'Pengguna tujuan tidak ditemukan' });
    }

    let newMessage;
    if (prisma.profileMessage) {
      newMessage = await prisma.profileMessage.create({
        data: {
          content: content.trim(),
          profileUserId: targetUser.id,
          authorId,
          parentId: parentId ? parseInt(parentId, 10) : null
        },
        include: {
          author: {
            select: {
              id: true,
              username: true
            }
          }
        }
      });
    } else {
      await prisma.$executeRaw`
        INSERT INTO profile_messages (content, profileUserId, authorId, parentId, createdAt)
        VALUES (${content.trim()}, ${targetUser.id}, ${authorId}, ${parentId ? parseInt(parentId, 10) : null}, NOW())
      `;
      const author = await prisma.user.findUnique({ where: { id: authorId }, select: { id: true, username: true } });
      newMessage = {
        content: content.trim(),
        profileUserId: targetUser.id,
        authorId,
        parentId: parentId ? parseInt(parentId, 10) : null,
        createdAt: new Date(),
        author
      };
    }

    return res.status(201).json({
      message: 'Pesan berhasil dikirim ke diskusi profil',
      discussion: newMessage
    });
  } catch (error) {
    console.error('Error in createProfileMessage:', error);
    return res.status(500).json({ message: 'Gagal mengirim pesan ke diskusi profil' });
  }
};

// Hapus pesan diskusi (hanya penulis pesan atau pemilik profil)
export const deleteProfileMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userId;

  try {
    const msgId = parseInt(messageId, 10);
    const existing = await prisma.$queryRaw`
      SELECT id, authorId, profileUserId FROM profile_messages WHERE id = ${msgId} LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan' });
    }

    const message = existing[0];
    if (message.authorId !== userId && message.profileUserId !== userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk menghapus pesan ini' });
    }

    await prisma.$executeRaw`DELETE FROM profile_messages WHERE id = ${msgId} OR parentId = ${msgId}`;

    return res.status(200).json({ message: 'Pesan diskusi berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteProfileMessage:', error);
    return res.status(500).json({ message: 'Gagal menghapus pesan diskusi' });
  }
};
