import { db } from "@/config/db";
import {
  certificatesTable,
  coursesTable,
  enrollmentsTable,
  lessonsTable,
  modulesTable,
  notificationsTable,
  progressTable,
  repliesTable,
  resourcesTable,
  threadsTable,
  usersTable,
} from "@/config/schema";
import { and, asc, desc, eq, ilike, inArray, isNotNull, or, sql, type SQL } from "drizzle-orm";

/**
 * Postgres full-text search điều kiện — match title/description, không phân biệt dấu tiếng Việt
 * (extension `unaccent`, đã bật trên DB thật). `websearch_to_tsquery` chịu được input tự do/ký tự
 * đặc biệt mà không throw (khác `to_tsquery`), an toàn với input người dùng gõ trực tiếp.
 */
function courseSearchCondition(query: string): SQL {
  return sql`to_tsvector('simple', unaccent(coalesce(${coursesTable.title}, '') || ' ' || coalesce(${coursesTable.description}, ''))) @@ websearch_to_tsquery('simple', unaccent(${query}))`;
}

function courseSearchRank(query: string) {
  return sql<number>`ts_rank(to_tsvector('simple', unaccent(coalesce(${coursesTable.title}, '') || ' ' || coalesce(${coursesTable.description}, ''))), websearch_to_tsquery('simple', unaccent(${query})))`;
}

export type CourseCardData = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  level: string | null;
  price: string | null;
  instructorName: string;
  enrollmentCount: number;
};

export async function getTrendingCourses(limit = 3): Promise<CourseCardData[]> {
  return db
    .select({
      id: coursesTable.id,
      slug: coursesTable.slug,
      title: coursesTable.title,
      description: coursesTable.description,
      thumbnailUrl: coursesTable.thumbnailUrl,
      category: coursesTable.category,
      level: coursesTable.level,
      price: coursesTable.price,
      instructorName: usersTable.name,
      enrollmentCount: sql<number>`count(${enrollmentsTable.id})`.mapWith(Number),
    })
    .from(coursesTable)
    .innerJoin(usersTable, eq(coursesTable.instructorId, usersTable.id))
    .leftJoin(enrollmentsTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(coursesTable.published, true))
    .groupBy(coursesTable.id, usersTable.name)
    .orderBy(desc(sql`count(${enrollmentsTable.id})`))
    .limit(limit);
}

export async function getPublishedCourseCount(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(coursesTable)
    .where(eq(coursesTable.published, true));
  return row?.count ?? 0;
}

export async function getCategories(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: coursesTable.category })
    .from(coursesTable)
    .where(eq(coursesTable.published, true));
  return rows.map((r) => r.category).filter((c): c is string => Boolean(c));
}

export async function getLevels(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ level: coursesTable.level })
    .from(coursesTable)
    .where(eq(coursesTable.published, true));
  return rows.map((r) => r.level).filter((l): l is string => Boolean(l));
}

export type CourseListSort = "newest" | "popular" | "price_asc" | "price_desc";

export type CourseListFilters = {
  category?: string;
  level?: string;
  search?: string;
  sort?: CourseListSort;
  page?: number;
  pageSize?: number;
};

export async function getCourseList(
  filters: CourseListFilters = {},
): Promise<{ courses: CourseCardData[]; total: number; page: number; pageSize: number }> {
  const pageSize = filters.pageSize ?? 12;
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [eq(coursesTable.published, true)];
  if (filters.category) conditions.push(eq(coursesTable.category, filters.category));
  if (filters.level) conditions.push(eq(coursesTable.level, filters.level));
  if (filters.search?.trim()) conditions.push(courseSearchCondition(filters.search.trim()));
  const where = and(...conditions);

  const enrollmentCountSql = sql<number>`count(${enrollmentsTable.id})`;
  const orderBy =
    filters.sort === "price_asc"
      ? [asc(coursesTable.price)]
      : filters.sort === "price_desc"
        ? [desc(coursesTable.price)]
        : filters.sort === "popular"
          ? [desc(enrollmentCountSql)]
          : [desc(coursesTable.createdAt)];

  const [courses, [{ count }]] = await Promise.all([
    db
      .select({
        id: coursesTable.id,
        slug: coursesTable.slug,
        title: coursesTable.title,
        description: coursesTable.description,
        thumbnailUrl: coursesTable.thumbnailUrl,
        category: coursesTable.category,
        level: coursesTable.level,
        price: coursesTable.price,
        instructorName: usersTable.name,
        enrollmentCount: enrollmentCountSql.mapWith(Number),
      })
      .from(coursesTable)
      .innerJoin(usersTable, eq(coursesTable.instructorId, usersTable.id))
      .leftJoin(enrollmentsTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .where(where)
      .groupBy(coursesTable.id, usersTable.name)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(coursesTable).where(where),
  ]);

  return { courses, total: count, page, pageSize };
}

export type CourseSearchResult = {
  id: number;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  category: string | null;
  price: string | null;
};

/** Rank-ordered quick search cho dropdown autocomplete ở header — top N khớp nhất, không phân trang. */
export async function searchCourses(query: string, limit = 8): Promise<CourseSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  return db
    .select({
      id: coursesTable.id,
      slug: coursesTable.slug,
      title: coursesTable.title,
      thumbnailUrl: coursesTable.thumbnailUrl,
      category: coursesTable.category,
      price: coursesTable.price,
    })
    .from(coursesTable)
    .where(and(eq(coursesTable.published, true), courseSearchCondition(q)))
    .orderBy(desc(courseSearchRank(q)))
    .limit(limit);
}

export type EnrolledCourse = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  totalLessons: number;
  completedLessons: number;
};

export async function getEnrolledCourses(userId: number): Promise<EnrolledCourse[]> {
  return db
    .select({
      id: coursesTable.id,
      slug: coursesTable.slug,
      title: coursesTable.title,
      description: coursesTable.description,
      thumbnailUrl: coursesTable.thumbnailUrl,
      totalLessons: sql<number>`count(distinct ${lessonsTable.id})`.mapWith(Number),
      completedLessons: sql<number>`count(distinct case when ${progressTable.completed} then ${lessonsTable.id} end)`.mapWith(Number),
    })
    .from(enrollmentsTable)
    .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .leftJoin(modulesTable, eq(modulesTable.courseId, coursesTable.id))
    .leftJoin(lessonsTable, eq(lessonsTable.moduleId, modulesTable.id))
    .leftJoin(
      progressTable,
      and(eq(progressTable.lessonId, lessonsTable.id), eq(progressTable.userId, userId)),
    )
    .where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.status, "paid")))
    .groupBy(coursesTable.id);
}

export type CourseDetail = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  level: string | null;
  price: string | null;
  originalPrice: string | null;
  instructorId: number;
  instructorName: string;
  instructorAvatarUrl: string | null;
  enrollmentCount: number;
  modules: {
    id: number;
    title: string;
    order: number;
    lessons: { id: number; title: string; duration: number | null; order: number }[];
  }[];
};

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const [course] = await db
    .select({
      id: coursesTable.id,
      slug: coursesTable.slug,
      title: coursesTable.title,
      description: coursesTable.description,
      thumbnailUrl: coursesTable.thumbnailUrl,
      category: coursesTable.category,
      level: coursesTable.level,
      price: coursesTable.price,
      originalPrice: coursesTable.originalPrice,
      instructorId: coursesTable.instructorId,
      instructorName: usersTable.name,
      instructorAvatarUrl: usersTable.avatarUrl,
      enrollmentCount: sql<number>`count(${enrollmentsTable.id})`.mapWith(Number),
    })
    .from(coursesTable)
    .innerJoin(usersTable, eq(coursesTable.instructorId, usersTable.id))
    .leftJoin(enrollmentsTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(and(eq(coursesTable.slug, slug), eq(coursesTable.published, true)))
    .groupBy(coursesTable.id, usersTable.name, usersTable.avatarUrl);

  if (!course) return null;

  const modules = await db
    .select()
    .from(modulesTable)
    .where(eq(modulesTable.courseId, course.id))
    .orderBy(asc(modulesTable.order));

  const lessons = modules.length
    ? await db
        .select()
        .from(lessonsTable)
        .where(inArray(lessonsTable.moduleId, modules.map((m) => m.id)))
        .orderBy(asc(lessonsTable.order))
    : [];

  return {
    ...course,
    modules: modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: lessons
        .filter((l) => l.moduleId === m.id)
        .map((l) => ({ id: l.id, title: l.title, duration: l.duration, order: l.order })),
    })),
  };
}

export async function getEnrollmentStatus(userId: number, courseId: number): Promise<string | null> {
  const [row] = await db
    .select({ status: enrollmentsTable.status })
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.courseId, courseId)));
  return row?.status ?? null;
}

export type LearnCurriculumItem = {
  lessonId: number;
  title: string;
  moduleTitle: string;
  completed: boolean;
};

export type LearnPageData = {
  course: { id: number; slug: string; title: string };
  module: { id: number; title: string };
  lesson: {
    id: number;
    title: string;
    content: string | null;
    videoAssetId: string | null;
    youtubeUrl: string | null;
    duration: number | null;
  };
  curriculum: LearnCurriculumItem[];
  prevLessonId: number | null;
  nextLessonId: number | null;
};

export async function getLearnPageData(lessonId: number, userId: number): Promise<LearnPageData | null> {
  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId));
  if (!lesson) return null;

  const [mod] = await db.select().from(modulesTable).where(eq(modulesTable.id, lesson.moduleId));
  if (!mod) return null;

  const [course] = await db
    .select({ id: coursesTable.id, slug: coursesTable.slug, title: coursesTable.title })
    .from(coursesTable)
    .where(eq(coursesTable.id, mod.courseId));
  if (!course) return null;

  const modules = await db
    .select()
    .from(modulesTable)
    .where(eq(modulesTable.courseId, course.id))
    .orderBy(asc(modulesTable.order));

  const allLessons = modules.length
    ? await db
        .select()
        .from(lessonsTable)
        .where(inArray(lessonsTable.moduleId, modules.map((m) => m.id)))
        .orderBy(asc(lessonsTable.order))
    : [];

  const progressRows = allLessons.length
    ? await db
        .select()
        .from(progressTable)
        .where(and(eq(progressTable.userId, userId), inArray(progressTable.lessonId, allLessons.map((l) => l.id))))
    : [];
  const completedSet = new Set(progressRows.filter((p) => p.completed).map((p) => p.lessonId));

  const curriculum: LearnCurriculumItem[] = modules.flatMap((m) =>
    allLessons
      .filter((l) => l.moduleId === m.id)
      .map((l) => ({
        lessonId: l.id,
        title: l.title,
        moduleTitle: m.title,
        completed: completedSet.has(l.id),
      })),
  );

  const idx = curriculum.findIndex((c) => c.lessonId === lessonId);

  return {
    course,
    module: { id: mod.id, title: mod.title },
    lesson: {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      videoAssetId: lesson.videoAssetId,
      youtubeUrl: lesson.youtubeUrl,
      duration: lesson.duration,
    },
    curriculum,
    prevLessonId: idx > 0 ? curriculum[idx - 1].lessonId : null,
    nextLessonId: idx >= 0 && idx < curriculum.length - 1 ? curriculum[idx + 1].lessonId : null,
  };
}

export async function getHoursSpent(userId: number): Promise<number> {
  const [row] = await db
    .select({ minutes: sql<number>`coalesce(sum(${lessonsTable.duration}), 0)`.mapWith(Number) })
    .from(progressTable)
    .innerJoin(lessonsTable, eq(progressTable.lessonId, lessonsTable.id))
    .where(and(eq(progressTable.userId, userId), eq(progressTable.completed, true)));

  return Math.round(((row?.minutes ?? 0) / 60) * 10) / 10;
}

export type ThreadListItem = {
  id: number;
  title: string;
  body: string;
  tag: string | null;
  authorName: string;
  createdAt: Date;
  replyCount: number;
};

export async function getThreads(limit = 20): Promise<ThreadListItem[]> {
  return db
    .select({
      id: threadsTable.id,
      title: threadsTable.title,
      body: threadsTable.body,
      tag: threadsTable.tag,
      authorName: usersTable.name,
      createdAt: threadsTable.createdAt,
      replyCount: sql<number>`count(${repliesTable.id})`.mapWith(Number),
    })
    .from(threadsTable)
    .innerJoin(usersTable, eq(threadsTable.authorId, usersTable.id))
    .leftJoin(repliesTable, eq(repliesTable.threadId, threadsTable.id))
    .groupBy(threadsTable.id, usersTable.name)
    .orderBy(desc(threadsTable.createdAt))
    .limit(limit);
}

export type ThreadReply = {
  id: number;
  body: string;
  authorName: string;
  createdAt: Date;
};

export type ThreadDetail = {
  id: number;
  title: string;
  body: string;
  tag: string | null;
  authorName: string;
  createdAt: Date;
  replies: ThreadReply[];
};

export async function getThreadDetail(threadId: number): Promise<ThreadDetail | null> {
  const [thread] = await db
    .select({
      id: threadsTable.id,
      title: threadsTable.title,
      body: threadsTable.body,
      tag: threadsTable.tag,
      authorName: usersTable.name,
      createdAt: threadsTable.createdAt,
    })
    .from(threadsTable)
    .innerJoin(usersTable, eq(threadsTable.authorId, usersTable.id))
    .where(eq(threadsTable.id, threadId));

  if (!thread) return null;

  const replies = await db
    .select({
      id: repliesTable.id,
      body: repliesTable.body,
      authorName: usersTable.name,
      createdAt: repliesTable.createdAt,
    })
    .from(repliesTable)
    .innerJoin(usersTable, eq(repliesTable.authorId, usersTable.id))
    .where(eq(repliesTable.threadId, threadId))
    .orderBy(asc(repliesTable.createdAt));

  return { ...thread, replies };
}

export type TopContributor = {
  id: number;
  name: string;
  threadCount: number;
  replyCount: number;
};

export async function getTopContributors(limit = 5): Promise<TopContributor[]> {
  const threadCountSql = sql<number>`count(distinct ${threadsTable.id})`;
  const replyCountSql = sql<number>`count(distinct ${repliesTable.id})`;

  return db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      threadCount: threadCountSql.mapWith(Number),
      replyCount: replyCountSql.mapWith(Number),
    })
    .from(usersTable)
    .leftJoin(threadsTable, eq(threadsTable.authorId, usersTable.id))
    .leftJoin(repliesTable, eq(repliesTable.authorId, usersTable.id))
    .groupBy(usersTable.id)
    .having(sql`(count(distinct ${threadsTable.id}) + count(distinct ${repliesTable.id})) > 0`)
    .orderBy(desc(sql`(count(distinct ${threadsTable.id}) + count(distinct ${repliesTable.id}))`))
    .limit(limit);
}

export async function getTrendingTags(limit = 5): Promise<{ tag: string; count: number }[]> {
  const rows = await db
    .select({ tag: threadsTable.tag, count: sql<number>`count(*)`.mapWith(Number) })
    .from(threadsTable)
    .where(isNotNull(threadsTable.tag))
    .groupBy(threadsTable.tag)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
  return rows.filter((r): r is { tag: string; count: number } => r.tag !== null);
}

export type ResourceListItem = {
  id: number;
  title: string;
  fileUrl: string;
  fileType: string | null;
  uploaderName: string;
  courseId: number | null;
  courseTitle: string | null;
  createdAt: Date;
};

export async function getResources(limit = 50): Promise<ResourceListItem[]> {
  return db
    .select({
      id: resourcesTable.id,
      title: resourcesTable.title,
      fileUrl: resourcesTable.fileUrl,
      fileType: resourcesTable.fileType,
      uploaderName: usersTable.name,
      courseId: resourcesTable.courseId,
      courseTitle: coursesTable.title,
      createdAt: resourcesTable.createdAt,
    })
    .from(resourcesTable)
    .innerJoin(usersTable, eq(resourcesTable.uploadedBy, usersTable.id))
    .leftJoin(coursesTable, eq(resourcesTable.courseId, coursesTable.id))
    .orderBy(desc(resourcesTable.createdAt))
    .limit(limit);
}

export async function getUserPaidCourseIds(userId: number): Promise<Set<number>> {
  const rows = await db
    .select({ courseId: enrollmentsTable.courseId })
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.status, "paid")));
  return new Set(rows.map((r) => r.courseId));
}

export type UserCertificate = {
  id: number;
  courseId: number;
  courseTitle: string;
  issuedAt: Date;
};

export async function getUserCertificates(userId: number): Promise<UserCertificate[]> {
  return db
    .select({
      id: certificatesTable.id,
      courseId: certificatesTable.courseId,
      courseTitle: coursesTable.title,
      issuedAt: certificatesTable.issuedAt,
    })
    .from(certificatesTable)
    .innerJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .where(eq(certificatesTable.userId, userId))
    .orderBy(desc(certificatesTable.issuedAt));
}

export type RecentActivityItem = {
  lessonId: number;
  lessonTitle: string;
  courseTitle: string;
  completedAt: Date | null;
};

export async function getRecentActivity(userId: number, limit = 5): Promise<RecentActivityItem[]> {
  return db
    .select({
      lessonId: lessonsTable.id,
      lessonTitle: lessonsTable.title,
      courseTitle: coursesTable.title,
      completedAt: progressTable.completedAt,
    })
    .from(progressTable)
    .innerJoin(lessonsTable, eq(progressTable.lessonId, lessonsTable.id))
    .innerJoin(modulesTable, eq(lessonsTable.moduleId, modulesTable.id))
    .innerJoin(coursesTable, eq(modulesTable.courseId, coursesTable.id))
    .where(and(eq(progressTable.userId, userId), eq(progressTable.completed, true)))
    .orderBy(desc(progressTable.completedAt))
    .limit(limit);
}

export type InstructorCourse = {
  id: number;
  slug: string;
  title: string;
  published: boolean;
  price: string | null;
  moduleCount: number;
  lessonCount: number;
  enrollmentCount: number;
};

export async function getInstructorCourses(instructorId: number): Promise<InstructorCourse[]> {
  return db
    .select({
      id: coursesTable.id,
      slug: coursesTable.slug,
      title: coursesTable.title,
      published: coursesTable.published,
      price: coursesTable.price,
      moduleCount: sql<number>`count(distinct ${modulesTable.id})`.mapWith(Number),
      lessonCount: sql<number>`count(distinct ${lessonsTable.id})`.mapWith(Number),
      enrollmentCount: sql<number>`count(distinct case when ${enrollmentsTable.status} = 'paid' then ${enrollmentsTable.id} end)`.mapWith(
        Number,
      ),
    })
    .from(coursesTable)
    .leftJoin(modulesTable, eq(modulesTable.courseId, coursesTable.id))
    .leftJoin(lessonsTable, eq(lessonsTable.moduleId, modulesTable.id))
    .leftJoin(enrollmentsTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(coursesTable.instructorId, instructorId))
    .groupBy(coursesTable.id)
    .orderBy(desc(coursesTable.createdAt));
}

export type InstructorModule = {
  id: number;
  title: string;
  order: number;
  lessons: {
    id: number;
    title: string;
    order: number;
    videoAssetId: string | null;
    youtubeUrl: string | null;
    duration: number | null;
    content: string | null;
  }[];
};

export async function getInstructorCourseDetail(courseId: number) {
  const modules = await db
    .select()
    .from(modulesTable)
    .where(eq(modulesTable.courseId, courseId))
    .orderBy(asc(modulesTable.order));

  const lessons = modules.length
    ? await db
        .select()
        .from(lessonsTable)
        .where(inArray(lessonsTable.moduleId, modules.map((m) => m.id)))
        .orderBy(asc(lessonsTable.order))
    : [];

  const result: InstructorModule[] = modules.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
    lessons: lessons
      .filter((l) => l.moduleId === m.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        videoAssetId: l.videoAssetId,
        youtubeUrl: l.youtubeUrl,
        duration: l.duration,
        content: l.content,
      })),
  }));

  return result;
}

export type AdminStats = {
  userCount: number;
  courseCount: number;
  publishedCourseCount: number;
  paidEnrollmentCount: number;
  totalRevenue: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [[{ userCount }], [{ courseCount, publishedCourseCount }], enrollmentRows] = await Promise.all([
    db.select({ userCount: sql<number>`count(*)`.mapWith(Number) }).from(usersTable),
    db
      .select({
        courseCount: sql<number>`count(*)`.mapWith(Number),
        publishedCourseCount: sql<number>`count(*) filter (where ${coursesTable.published})`.mapWith(Number),
      })
      .from(coursesTable),
    db
      .select({ price: coursesTable.price })
      .from(enrollmentsTable)
      .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .where(eq(enrollmentsTable.status, "paid")),
  ]);

  const totalRevenue = enrollmentRows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);

  return {
    userCount,
    courseCount,
    publishedCourseCount,
    paidEnrollmentCount: enrollmentRows.length,
    totalRevenue,
  };
}

export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

export async function getAllUsersAdmin(
  search: string | undefined,
  page: number,
  pageSize = 20,
): Promise<{ users: AdminUserRow[]; total: number }> {
  const where = search
    ? or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`))
    : undefined;

  const [users, [{ count }]] = await Promise.all([
    db
      .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, status: usersTable.status })
      .from(usersTable)
      .where(where)
      .orderBy(asc(usersTable.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(usersTable).where(where),
  ]);

  return { users, total: count };
}

export type AdminCourseRow = {
  id: number;
  slug: string;
  title: string;
  published: boolean;
  instructorName: string;
  enrollmentCount: number;
};

export async function getAllCoursesAdmin(
  search: string | undefined,
  page: number,
  pageSize = 20,
): Promise<{ courses: AdminCourseRow[]; total: number }> {
  const where = search ? ilike(coursesTable.title, `%${search}%`) : undefined;

  const [courses, [{ count }]] = await Promise.all([
    db
      .select({
        id: coursesTable.id,
        slug: coursesTable.slug,
        title: coursesTable.title,
        published: coursesTable.published,
        instructorName: usersTable.name,
        enrollmentCount: sql<number>`count(distinct case when ${enrollmentsTable.status} = 'paid' then ${enrollmentsTable.id} end)`.mapWith(
          Number,
        ),
      })
      .from(coursesTable)
      .innerJoin(usersTable, eq(coursesTable.instructorId, usersTable.id))
      .leftJoin(enrollmentsTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .where(where)
      .groupBy(coursesTable.id, usersTable.name)
      .orderBy(desc(coursesTable.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(coursesTable).where(where),
  ]);

  return { courses, total: count };
}

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: Date;
};

export async function getNotifications(userId: number, limit = 10): Promise<NotificationItem[]> {
  return db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));
  return row?.count ?? 0;
}
