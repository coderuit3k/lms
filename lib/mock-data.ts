export type Lesson = {
  icon: "play_circle" | "article" | "assignment" | "lock";
  title: string;
  meta: string;
};

export type Module = {
  no: string;
  title: string;
  active?: boolean;
  locked?: boolean;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  progress: number;
  image: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: string;
  students: string;
  duration: string;
  instructor: {
    name: string;
    title: string;
    bio: string;
    avatar: string;
  };
  modules: Module[];
};

export const courses: Course[] = [
  {
    id: "advanced-physics",
    title: "Advanced Physics: Quantum Mechanics to General Relativity",
    subtitle: "Module 4: Quantum Mechanics",
    category: "Physics",
    level: "Advanced Level",
    progress: 45,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBfshENqVlEyaXpfdxgwwbPstRmWcQQxepmrNkTkjFmMkkrsPklxY1bWKr0g7vqZCs4S_dsoeywLxXf36AVUGWyzomdN-TqGnTvimjq8VydAHSw8nfnXCMFmbHiYTjcknrtqBI9Td1lkFdNV3IdQPG2SLyLq4E2Khr1O3vLHu8ftJ5kxOkNSsEmOUVgL9ZV909yySFfCONHbJd6d8ZKIr3csdW3USXqIt-gSiIIT0W8xQQYpLrtH6GYRw",
    description: "Module 4: Wave Functions and Probability.",
    longDescription:
      "Dive deep into the fundamental laws governing our universe. This comprehensive course covers advanced topics in quantum theory, statistical mechanics, and introduces the principles of general relativity. Designed for students seeking a rigorous mathematical and conceptual understanding of modern physics.",
    price: 499,
    originalPrice: 899,
    rating: 4.9,
    reviews: "2,104 reviews",
    students: "15,400+ students",
    duration: "12 weeks",
    instructor: {
      name: "Dr. Aris Thorne",
      title: "Ph.D. in Theoretical Physics, MIT",
      bio: "Dr. Thorne is a leading researcher in quantum field theory with over 15 years of teaching experience. He is dedicated to making complex physical theories accessible and engaging for students worldwide, having published numerous papers in top-tier scientific journals.",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCqvaqJzn5n3RhGznBJMgo51_vH725azc0IvSGALIOCeToVlii2S_wyQNh0g-Oy_drd2bF3tNCyLW6ekcBteq9nUb546z7cAnTRfsIfYYrfZuPAqmqRbBC6jtWeT5gP2zS-Um7wM9zWrS5A6NLF-1U8kKSaNzxnL64VFUcfjCnhzbpbHNPbqK4HzQA1rCmBgsNiBGjX6zgVt_iTGV6niW7B4l99S81ZDKL4et6RygeHMesNdFe1KPo3rA",
    },
    modules: [
      {
        no: "01",
        title: "Foundations of Quantum Theory",
        active: true,
        lessons: [
          { icon: "play_circle", title: "Wave-Particle Duality", meta: "15:20" },
          { icon: "play_circle", title: "Schrödinger Equation", meta: "22:45" },
          { icon: "article", title: "Postulates of Quantum Mechanics", meta: "10 min read" },
          { icon: "assignment", title: "Quiz: Quantum Foundations", meta: "5 questions" },
        ],
      },
      {
        no: "02",
        title: "Angular Momentum and Spin",
        lessons: [{ icon: "play_circle", title: "Orbital Angular Momentum", meta: "18:10" }],
      },
    ],
  },
  {
    id: "classical-antiquity",
    title: "Classical Antiquity: The Fall of the Roman Republic",
    subtitle: "Module 2: The Late Republic",
    category: "Humanities",
    level: "Intermediate Level",
    progress: 32,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC_IMuoIKmU7DtTh9fah7n0RXPgPF4wUQV3BJLi_fAypeM1VuOUSWhC5tISk1IGTlRGUu3V-M2Z9KJ4W8WN_iAwkiP1KaG9pqw9BobMdFKkzkgNlvHPayuVFDpJxmW_n96wdgrh7fZcmk02RmBUMdUbDWexq-TNcaYrhSywF7mcw1vO654YQKCHAcbyTg9NJ_kOzilqW7elDo725sRR3_mfUfwF_s48_fxEOZgaYIAvWZU4NonZEvoadQ",
    description: "The Fall of the Roman Republic.",
    longDescription:
      "Trace the political intrigue, civil wars, and social upheaval that ended the Roman Republic and gave rise to the Empire, through primary sources and modern historiography.",
    price: 149,
    originalPrice: 249,
    rating: 4.7,
    reviews: "980 reviews",
    students: "6,200+ students",
    duration: "8 weeks",
    instructor: {
      name: "Prof. Helena Marsh",
      title: "D.Phil. in Ancient History, Oxford",
      bio: "Prof. Marsh has spent two decades excavating and studying Republican-era Rome, bringing field research directly into the classroom.",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAenxSmqQZPik4QOscbRbTq7abFEk-YgCggOAVL-VhhvEJGqPpShd-nCty4Ts6lwoUjkq94YG501QjmN1v7EIWIGjQaUm2X31VMQGFbq7LcjUDqWuwOYqACk8ZzY3zX4b8O5WcoaX-Ni5SSBcfHIvfK4nShnOMOENuWGadS9AfMpglc2wCsLwdiKIO-Ab-YklMmpYWazA_u58rZ5emk-SAtO9d_s6MNpbv_SCx7VAbUi1KAii3bESRhxQ",
    },
    modules: [
      {
        no: "01",
        title: "The Gracchi Reforms",
        active: true,
        lessons: [
          { icon: "play_circle", title: "Land Reform and Land Reform", meta: "14:05" },
          { icon: "article", title: "Primary Source: Plutarch's Lives", meta: "12 min read" },
        ],
      },
      {
        no: "02",
        title: "Marius, Sulla and Civil War",
        lessons: [{ icon: "play_circle", title: "The First Proscriptions", meta: "19:30" }],
      },
    ],
  },
];

export const trendingCourses = [
  {
    id: "neural-networks",
    title: "Neural Networks & Deep Learning",
    category: "Technology",
    level: "Intermediate",
    description: "Master the fundamentals of AI architecture and build your first deep learning models.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCcZvOTDQCieCjqCT2d-uCfVgV3UNqiIhHOHF-8Xo5tyMAq6rTkRDq5X_KhWBEqQRiLmCvsgVaQuqp8d-449C7H8PmtL1UsssMdL68mO1OxLFHannwg-xQ_zuHmyQbWE6WOilST5boYTh0UfNXLVmIb-W32sbVtiqR88a-oCHMEd3NGSCEX7hDmZ5Uc17llJ9tI1VFAC_oc8oaG7Uho_zo1wcJzToD58DgIsi912Hm_gWzyR6KXvMHhCg",
    rating: 4.8,
    reviews: "1.2k reviews",
    instructor: "Dr. E. Vance",
    instructorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDxFl_wiuEnmaF00xCEXSa5GsNKu1z9gYrb8uuCVAnTBhnAf_zinSJjOdJS5LL0iup6p9qb7Ej7DGR29mxICWGTSNK3nF06FFdO9NkqgagU6TZtyHdT0EREVK6g-h534JpYnOg1tPpBIK8H_5kG4Y3PAsHgjhhIOBiSmTGHg47DdckeWLGawqS3WrSOj74LAIJXXy4AfMtYP-Q3PYReNAvxilvMX23fHjyCBH9qezxkxwYJNmFz86V4pw",
    price: 99,
  },
  {
    id: "ui-architecture",
    title: "Advanced UI Architecture",
    category: "Design",
    level: null,
    description: "Structure scalable design systems for complex enterprise applications.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVtgwEvo7DS3N7TkIB8Ibokt7-kTOqh2yYHoukgNSmd0J-6EV0acay5X_XnXPGDmPRBn540XBk3sxrv7WqOZ2JBmEoQQCIfPVZ9vznDt23DF6w5edvCjfIzH1lVBb9LiCLEVwjijEfLxFLq96nUMT_PVzngPzHl6bmcP6xHgxdVHq-sxnh_hLbv4k3A3Dl5XqzPalVGOLFZldWZoqxaKf1EsKsNf7a8WvPRED9l9DpYaOD3wcSjE6Bog",
    rating: 4.9,
    reviews: "850 reviews",
    instructor: "Prof. A. Chen",
    instructorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkVP55XoWq6SFerkotN3yOpIDiN5pJWBnG8zLo4ynAj35tm8MDOjnCNlEyVHydp3f1dD5MCFHtSufwxiTMD5QZkZFv74oYWO1wKRHeVTs0nqK4nIoZ2C86oaEF6KP_FRTd1QxJ-tOG3Ho7rvA2hJy3g5QvDFRJwHcesFaI0gXxsZemCMKHSEYKUD7mwId7RLSDk0gGxic_fbN8_mUKt8ESjkyX4hO5CzQ3dcYGCf3H_HvVyG-Xa9m82A",
    price: 120,
  },
  {
    id: "quantum-fundamentals",
    title: "Quantum Mechanics Fundamentals",
    category: "Science",
    level: "Advanced",
    description: "A rigorous mathematical approach to the principles of quantum states.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwQpowdFjYi55QiamiNLQu5VvGStELhfRr1L4Qf751b-VpFVhLnIiQGc5KstbbS-DBEToJC2v9TwmkBmaRcPWsFH2Udn5a-W6obhfQvYHejr1BvUMcs61h3S0przJCaXTCriOXZA6x-SPnD9PTMuTt2CNti8czgpaZbXwLmjeF6lVnQiH3BUAZ1R_aZmux0zUDAI8FBv_dK4e7NLMQWQN8LFfaRNoJqXYamFbJw8alEewlJK4tiWc7pQ",
    rating: 4.7,
    reviews: "2.1k reviews",
    instructor: "Dr. M. Rossi",
    instructorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC0rQHdw0O5QL6vFj4IK6x_NmpAV_dYUxtMfCZRWO2b1uj6e3mYCYoZCCp6x1ot5fTcUdx4OS7jV5m45U_aq4wgbUHdxxPWTEp_eYZTdbVcamGhAURB93hb1ENhsd1nwaFmeOTHPhlPQ400U8WhAiJDv8ZmxjIgs-eqfQOYQ8Qp6pukxAU4ozKO6siKm1nDtShTqS5_N-J1zBzVi2hr6hDlI3fuxGmsmGg9F-UDd04YwzED6SqfrRjStQ",
    price: 150,
  },
];

export const categories = [
  {
    name: "Sciences",
    description: "Physics, Chemistry, Biology and advanced mathematics.",
    icon: "science",
    size: "large" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3bicpOD2ExYAKmcKslfk9iCcMGzYagWn2ov9VS4otUCeC9uftPHXOSYcEJreHRzXZNxNqOywSVUvyFtjljWMRqgMdphqpGEA9VMpYFKgr-mjApPciUFKsKH2g0XIhE4JAyvej2Q_ywgmcjwf1M3l9fvE0Oj0oHRNZP0wnU4rscaGKPl96LGE4y1cjJD2MelkCVm9pvwUo_drJFffzVFKwlsweBZXNcFCxcYv1v8_-GqTDV72_LWJ2lw",
  },
  {
    name: "Technology",
    description: "Computer Science & AI",
    icon: "code",
    size: "small" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB_QPakx3Md3cHTIXD1WvVKmOIQWOg47n9Pz9jSzn4_xAX0CGd1d1XCwa_azoeXFSHTdHqOdJI3TT78ZOZXqtK7uGhbz3ECBadey0xtdioUoQpZjwbnYRwf5xDQw2PCM7WmHI14RNQlBx2YUBZgklGydZl3f5kKrtl-QfdNhIwzXRGjxEKLMDEqZs2Yk4C7Oa_UbUW833X7DHDpQNt9bMkirmAYfwyqes3X1Km_YwrTj-RRy2rHdG1h7A",
  },
  {
    name: "Arts & Humanities",
    description: "History, Literature & Design",
    icon: "palette",
    size: "small" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgwI05dE8fPciVYp1GUIO19kGQL4C1FOIlnFOl33deWRznsiasQ3pQgbIsskAHfco8jByBGehJUuRaBJmy7BEKC6RMrG1Vrxv_3NnYfxKuhU2rIQg9Vx7WLSZVt-dIjDupgSFdNz1Z3d9Nnq3uyL91Dl7aU8Fv748BMazJVvEgVrKuuZl03mHEVK05s-9jBudk75wW_t0--rBuQMV0YkctVr_Z8ljfJrvhFiwleCErQMQRNv9yEnDYJQ",
  },
];

export const deadlines = [
  { month: "Oct", day: "12", title: "Wave Function Essay", course: "Quantum Mechanics", time: "11:59 PM", urgent: true },
  { month: "Oct", day: "15", title: "Module 3 Quiz", course: "Classical Antiquity", time: "5:00 PM", urgent: false },
  { month: "Oct", day: "18", title: "Lab Report: Spectrometry", course: "Advanced Physics", time: "11:59 PM", urgent: false },
];

export const learningStats = {
  hoursSpent: "24.5",
  hoursDelta: "+2h this week",
  points: "1,250",
  pointsRank: "Top 15%",
};

export const profile = {
  name: "Alex Mercer",
  location: "San Francisco, CA",
  joined: "Sep 2023",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCsVo8QKeU3bq7Sl6bfnsxg_-IgwqdWhEYzq1jJn9JDfJE4X6cNCoJCw5AvLjBw_DelYp8qOcNcZ9o4pR_SnMzhNSNTPk23CMmCduv9GTXYoxSOTTZI_Gw8oPSk_yEZPTPh-Ejy1I0e7nF_firhf8qtFxuIfpszwJYVN5EOgqDVOSeY7XIj6YzS8I6GElpOHO3v8mbvjuNe9-05SGzRKUUXI8miwgcUjgBopkQ_IyuZtU5xQGIpisrrQA",
  bio: "Lifelong learner passionate about data science and behavioral economics. Currently focusing on machine learning applications in public health. Always looking to connect with fellow researchers.",
  stats: { completed: 12, certificates: 4, hours: 184 },
  certificates: [
    {
      title: "Advanced Data Structures",
      issued: "Issued: Jan 2024",
      verified: true,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAShr3BogUsjp3sUJfs002m1zzU1B8CpBuTuLfX_yDX0bnIe8lKwplJPHu3ieGahy-WcmYTr2uCYhMTKojT0ZDsdRKeuVDbkoQ2C7lHNQ7eY4XM_rqqUkLfZzGPK1gQNUprLewPxRXDAIytU3FN8Accl_P6d2fJLTPWeMb-uQsXc1CwReZCqII43GAzDlBa7VJbKtlyvIrIPtxP5U7OUl7EGTmYL_hTBqlyghX7-Y3q_pnX8j8tGurPDA",
    },
    {
      title: "Applied Machine Learning",
      issued: "Issued: Nov 2023",
      verified: false,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAwLxalbCkwYNwc26TMKCHDnvgsiKhqoGM5bbDlgQPWh-eLpt-Tl7142ksmVcsXQBcqcHAoWWpJOhFCTn41A2xp_kscssNQuA3P__klnEYQtynASCFY3m7WdTNfNEB8zJSgxFXLVFJLuqxVfpWtRpMS5mFEYt7-dO4n42LiHjbkssMEVV9XALyAOmN-cA7sxnpvdhctK1kJbkeGe5J3jz8gUwTxCKiby8Ku5Z2jEMcZlJndz0NeuBtkpQ",
    },
  ],
  badges: [
    { icon: "psychology", label: "Cognitive Psych", tone: "secondary" as const },
    { icon: "code", label: "Python", tone: "primary" as const },
    { icon: "analytics", label: "Data Viz", tone: "secondary" as const },
    { icon: "functions", label: "Statistics", tone: "primary" as const },
  ],
  focus: { icon: "neurology", title: "Neural Networks", meta: "Level 2 in progress" },
  history: [
    { icon: "menu_book", title: "Ethics in AI", meta: "Completed Module 4 • 2 days ago", right: "Score", value: "94%", valueTone: "primary" as const, action: "Review" },
    { icon: "assignment", title: "Data Visualization Capstone", meta: "Submitted Project • 1 week ago", right: "Status", value: "Graded", valueTone: "secondary" as const, action: "View Feedback" },
  ],
};

export type Thread = {
  title: string;
  excerpt: string;
  author: string;
  avatar?: string;
  avatarLetter?: string;
  tag: string;
  time: string;
  replies: number;
  views: number;
  badge: "hot" | "pinned" | null;
  verified: boolean;
};

export const threads: Thread[] = [
  {
    title: "Clarification needed on Quantum Entanglement equations in Module 4",
    excerpt:
      "I'm having trouble understanding the state vector collapse in the second set of practice problems. Specifically, how does the measurement basis affect the probability amplitudes in equation 4.2? Any insights would be hugely appreciated.",
    author: "Sarah J.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwOmpMFcuVJ96NxOfw8xJpFFVInBRmiVqEXC3l9hYRjEq7DaqGHAmqp9j3_tazmk5YIaU7ewdJd6sgwU0iHPcwZi1Ie1N-tw0TYUqZKX4BTqnApdtcTTJoZXUzez03v4Flj-DAz1NCxva2gkf17BYETWoFdXZzs9BbWbv7QczwR6gE36vfEmjX8rH9O7-59l9Hzi-3jaKGEGywzXSWILMDNQaxDAhoQgvtMYUK-oYjA97FwLbziaak9g",
    tag: "Physics",
    time: "2 hours ago",
    replies: 24,
    views: 156,
    badge: "hot" as const,
    verified: false,
  },
  {
    title: "Study group for upcoming Midterms - looking for partners",
    excerpt:
      "Setting up a virtual study group this weekend to review chapters 1-5. We will be using the shared whiteboard tool. Looking for 3-4 more people who are comfortable discussing the theoretical concepts.",
    author: "Marcus T.",
    avatarLetter: "M",
    tag: "Peer Support",
    time: "5 hours ago",
    replies: 8,
    views: 42,
    badge: null,
    verified: false,
  },
  {
    title: "Welcome to the new semester! Guidelines & Expectations",
    excerpt:
      "Please read through these updated community guidelines before posting. We expect all discourse to remain respectful, academically rigorous, and supportive of all learning levels.",
    author: "Prof. Anderson",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8Zz_hTJPr7rq7h1xryBttIbSvgKagOu8PUX8VKIeeDcZIFwYcslfgEjMYaDK0OmuGUnaJvPL3cI-_aBK-CD99L9QbxbnKlDEVHgrus8P38OfvWyXpS0k1SrUZbb9SFE9J3FqygZv__n8zYL6XYKyDy_ZtuM7y34LwmvO6MnooLwY-xj9DC1MaS_137BnEi2BbwmwHaP5XTzPsrM9E9sNFW4iFhSkhJUojdKF5n_RLKT2ZAlgXc3vFEg",
    tag: "General",
    time: "2 days ago",
    replies: 12,
    views: 304,
    badge: "pinned" as const,
    verified: true,
  },
];

export type Contributor = {
  name: string;
  meta: string;
  avatar?: string;
  avatarLetter?: string;
};

export const topContributors: Contributor[] = [
  {
    name: "Alex R.",
    meta: "452 posts • 120 solutions",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOsoAVz8ywrrcHCWKKAheKUmkTRn7lqsM-ZjNOJpzgokh8EUUZp_pH1WVbFkxTZcrVK3YmzIolR-n6WuLW8Pq2GyWVIb4vDqvCbHCflEssRZRsqruYzFnXLqw31shWNsXKkfMLOAuZIq6vbwh33pbRzO1Hk4Ba4FRkBp_DfTEco4kXwYEtOjqw1r_T825sXZEQh9xiPyY6aTn_H7ZfJb1GUGzpkxn_0xeGXYT4ZX5_vlo2U82eGVvIUg",
  },
  {
    name: "Elena K.",
    meta: "389 posts • 95 solutions",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClYcSlmdo-cjAKjt0JjDUelF4dIFkN9-2HCaScsx4nVgccWC9M4gT2wxupPdhRtZzsgSXvkgOgk4t1eREdLyaTOJcGE1uY4e0_WY-K62tX3hSVHlMFrRK2egvzPfFVcm2mDIWYQ4SJeaZS2retawC3RVXfme9QissXffGfK4qISeZzD_Zx3Xkhz32AZyTWNf1gLLNfXfol2pNhBlvU-wjVreNIntGKxztRqRup-FMq8hKX6M3m3lwL2g",
  },
  { name: "David M.", meta: "210 posts • 40 solutions", avatarLetter: "D" },
];

export const lessonPlayer = {
  courseTitle: "Advanced Physics",
  progress: 45,
  videoImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDw7yAsVj1S_III5lBJU5RPUaU3BjN7bDViuL7wKJ8Y0L1_Hj_PuR-sDAPzAHFjD0qeFjvGWN1yqFgB_PPvC2lHXM4o_mo_Wo9_TJX1A15xDtemIPkVQ1Ahz7Mpd39358CExTyrfMCTBz2bbDW0dqszveCWoPDz4pNtXK4HYDdHfkBiwrR1gYA72ZcWSoRU1uEJzhYkncKZJ7hTm0TpA6E58BZIfbsC4BQPpplRJ-PxhajVymEvC4a4uw",
  moduleLabel: "Module 4",
  lessonTitle: "Introduction to Quantum Superposition",
  lessonDescription:
    "In this lesson, we explore the fundamental principles of superposition and how quantum states exist simultaneously until observed. We will look at the mathematical framework behind these states.",
  time: "12:45 / 45:00",
  transcript: [
    { time: "12:45", text: "When we talk about a particle being in two places at once, we are referring to its probability distribution...", active: false },
    { time: "12:55", text: "...this is mathematically described by the wave function, commonly denoted by the Greek letter Psi.", active: true },
    { time: "13:10", text: "Notice how the equation balances out when we apply the Born rule to calculate the actual probability of finding the particle in state A versus state B.", active: false },
  ],
  resources: [
    { icon: "description", title: "Reading Material", meta: "Chapter 4 Notes (PDF)", action: "download", tone: "primary" as const },
    { icon: "science", title: "Lab Simulation", meta: "Double Slit Experiment", action: "open_in_new", tone: "secondary" as const },
  ],
  sidebar: [
    {
      label: "Module 4: Quantum Mechanics",
      items: [
        { icon: "play_circle", title: "1. Intro to Superposition", meta: "45 mins", state: "active" },
        { icon: "play_circle", title: "2. Wave Function Collapse", meta: "32 mins", state: "default" },
        { icon: "assignment", title: "Quiz: Superposition", meta: "15 Questions", state: "default" },
      ],
    },
    {
      label: "Module 5: Entanglement",
      items: [{ icon: "lock", title: "1. Spooky Action", meta: "Locked", state: "locked" }],
    },
  ] as { label: string; items: { icon: string; title: string; meta: string; state: "active" | "default" | "locked" }[] }[],
  aiMessages: [
    { from: "ai", text: "I noticed you paused the video. Do you need help understanding the mathematical formulation of the wave function?" },
    { from: "user", text: "Yes, what does the Greek letter Psi specifically represent here?" },
    { from: "ai", text: "Psi (Ψ) represents the probability amplitude. To find the actual probability (P) of the particle being in a specific place, you take the square of its absolute value:", code: "P = |Ψ(x,t)|²" },
  ] as { from: "ai" | "user"; text: string; code?: string }[],
};

export function getCourse(id: string): Course {
  return courses.find((c) => c.id === id) ?? courses[0];
}

export const recentDownloads = [
  { icon: "picture_as_pdf", title: "Advanced Quantum Mechanics Syllabus", meta: "Downloaded 2 hours ago", tone: "error" as const },
  { icon: "description", title: "Cognitive Psychology Case Study", meta: "Downloaded yesterday", tone: "secondary" as const },
];

export const courseHandouts = [
  { icon: "article", title: "Lecture 4: Wave Functions", meta: "PDF • 2.4 MB" },
  { icon: "slideshow", title: "Seminar Presentation Deck", meta: "PPTX • 5.1 MB" },
  { icon: "article", title: "Lab Safety Guidelines", meta: "PDF • 1.1 MB" },
];

export const recommendedRead = {
  badge: "Peer Reviewed",
  title: "Neural Correlates of Memory Consolidation During Sleep",
  meta: "Journal of Neuroscience • 2023",
};

export const accountSettings = {
  fullName: "Alex Mercer",
  email: "alex.mercer@example.com",
  username: "alexmercer",
  bio: "Lifelong learner passionate about data science and behavioral economics.",
  notifications: [
    { label: "Course updates & new lessons", enabled: true },
    { label: "Community replies & mentions", enabled: true },
    { label: "Weekly progress digest", enabled: false },
    { label: "Product announcements", enabled: false },
  ],
  plan: { name: "Scholar Free", meta: "Upgrade for offline downloads & certificates" },
};
