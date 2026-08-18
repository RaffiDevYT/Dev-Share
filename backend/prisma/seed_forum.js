import prisma from '../src/config/db.js';

async function seed() {
  try {
    const users = await prisma.$queryRawUnsafe(`SELECT id, username FROM users LIMIT 1`);
    if (!users || users.length === 0) {
      console.log('No user found in database.');
      process.exit(0);
    }
    const userId = users[0].id;

    // Check existing count
    const countRows = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM forum_topics`);
    const count = Number(countRows[0]?.cnt || 0);

    if (count === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO forum_topics (title, content, category, userId, createdAt, updatedAt)
        VALUES 
        ('Optimizing React Performance with Concurrent Mode', 'How do you effectively use useTransition and useDeferredValue to eliminate input lag in heavy React 19 apps? Here are best practices and benchmarks.', 'Tanya Jawab', ${userId}, NOW(), NOW()),
        ('Introducing Dev-Share UI v2.1!', 'We just rolled out the new Cyber Obsidian & Emerald design system with Prism syntax highlighting, live in-browser code runner, and dedicated community discussions hub.', 'Showcase', ${userId}, NOW(), NOW()),
        ('Best Practices for Docker Deployment in 2026', 'Containerizing Node.js and React Vite apps with multi-stage builds. Reduces production image size by 70% and enables instant zero-downtime rollbacks.', 'Tips & Trik', ${userId}, NOW(), NOW()),
        ('Best Business Architecture & Scaling Backend API', 'Discussion on modular monolithic architectures with Express and Prisma ORM for high throughput vs microservices.', 'Umum', ${userId}, NOW(), NOW()),
        ('Dev-Share Global Developer Meetup & Hackathon', 'Join the upcoming virtual developer hackathon. Build open-source developer tools and win awesome developer prizes!', 'Events', ${userId}, NOW(), NOW())
      `);

      const topicRows = await prisma.$queryRawUnsafe(`SELECT id FROM forum_topics ORDER BY id ASC LIMIT 3`);
      if (topicRows.length > 0) {
        const t1 = topicRows[0].id;
        const t2 = topicRows[1]?.id || t1;
        const t3 = topicRows[2]?.id || t1;

        await prisma.$executeRawUnsafe(`
          INSERT INTO forum_replies (topicId, userId, content, createdAt)
          VALUES
          (${t1}, ${userId}, 'Great question! In React 19, useTransition is much more deterministic. Wrapping heavy state changes in startTransition will keep typing and navigation buttery smooth.', NOW()),
          (${t1}, ${userId}, 'Also make sure not to wrap controlled inputs in startTransition directly, only the filtering or heavy state computation.', NOW()),
          (${t2}, ${userId}, 'The new dark obsidian UI with emerald glow looks stunning! The live code runner and console drawer work like a charm.', NOW()),
          (${t3}, ${userId}, 'Multi-stage Docker builds also keep sensitive devDependencies out of the production container. Highly recommended!', NOW())
        `);
      }

      console.log('Raw SQL forum seed completed successfully!');
    } else {
      console.log(`Forum already has ${count} topics.`);
    }
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seed();
