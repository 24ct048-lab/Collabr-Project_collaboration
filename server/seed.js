/**
 * seed.js — Collabr dummy data seeder
 * Run: node seed.js  (from server/)
 * Creates 6 users (password: user123), 2 projects each with Unsplash images, 2 ideas each.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Idea = require('./models/Idea');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collabr';
const PASSWORD = 'user123';

const users = [
  {
    name: 'Alex Chen',
    email: 'alex@collabr.dev',
    bio: 'Full-stack engineer who loves building developer tools. Open source enthusiast, coffee fueled.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  },
  {
    name: 'Priya Sharma',
    email: 'priya@collabr.dev',
    bio: 'ML engineer with a passion for applied AI, LLMs, and making models actually useful in production.',
    skills: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
  },
  {
    name: 'Marcus Wright',
    email: 'marcus@collabr.dev',
    bio: 'Mobile dev (iOS/Android) and indie hacker. Building apps that solve real problems for real people.',
    skills: ['Swift', 'Kotlin', 'React Native', 'Firebase'],
  },
  {
    name: 'Sofia Reyes',
    email: 'sofia@collabr.dev',
    bio: 'UI/UX designer who codes. Obsessed with design systems, motion, and beautiful data visualization.',
    skills: ['Figma', 'React', 'D3.js', 'CSS'],
  },
  {
    name: 'James Park',
    email: 'james@collabr.dev',
    bio: 'Backend systems architect. Distributed computing, databases, and making things run at scale.',
    skills: ['Go', 'Rust', 'Kubernetes', 'Redis'],
  },
  {
    name: 'Nadia Kovacs',
    email: 'nadia@collabr.dev',
    bio: 'Blockchain developer and Web3 builder. Working at the intersection of DeFi and real-world utility.',
    skills: ['Solidity', 'Ethereum', 'React', 'Hardhat'],
  },
];

/* Using Unsplash source for reliable tech-themed images */
const projectTemplates = [
  /* Alex's projects */
  {
    userIndex: 0,
    title: 'DevPulse — Real-time Code Review Tool',
    description: 'A GitHub-integrated code review platform that uses AI to surface potential bugs, performance issues, and style violations before a human reviewer even looks at the PR. Features real-time collaboration, inline comments, and team analytics dashboards.',
    techStack: ['React', 'Node.js', 'WebSockets', 'OpenAI', 'PostgreSQL'],
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    status: 'open',
  },
  {
    userIndex: 0,
    title: 'Snippix — Smart Code Snippet Manager',
    description: 'VS Code extension + web app for managing, searching, and sharing code snippets across your team. Auto-tags snippets using AI, supports 40+ languages, and has a beautiful dark editor mode.',
    techStack: ['TypeScript', 'VS Code API', 'React', 'SQLite'],
    imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
    status: 'open',
  },
  /* Priya's projects */
  {
    userIndex: 1,
    title: 'NeuralCompose — AI Writing Assistant',
    description: 'An AI writing assistant fine-tuned for technical documentation. Generates README files, API docs, and inline comments from your code. Learns your team\'s style over time. Supports GPT-4 and local Llama models.',
    techStack: ['Python', 'FastAPI', 'LangChain', 'React', 'Docker'],
    imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    status: 'open',
  },
  {
    userIndex: 1,
    title: 'DataLens — ML Model Explainability Dashboard',
    description: 'A visual dashboard for exploring and explaining ML model decisions. Supports LIME, SHAP, attention maps, and custom explanations. Plug-and-play with scikit-learn, PyTorch, and Hugging Face models.',
    techStack: ['Python', 'Streamlit', 'PyTorch', 'SHAP', 'Plotly'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    status: 'open',
  },
  /* Marcus's projects */
  {
    userIndex: 2,
    title: 'FocusMate — Deep Work Session Tracker',
    description: 'A cross-platform productivity app that blocks distracting apps, tracks deep work sessions, and gamifies your focus streaks. Integrates with Apple Health, Google Fit, and Notion. Built for makers and developers.',
    techStack: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
    status: 'open',
  },
  {
    userIndex: 2,
    title: 'LocalLens — Neighborhood Discovery App',
    description: 'Discover hidden gems in your neighborhood curated by locals, not algorithms. Uses AR to overlay reviews and stories on real-world locations. Community-first, no ads, privacy-respecting.',
    techStack: ['React Native', 'ARKit', 'Node.js', 'MongoDB'],
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
    status: 'open',
  },
  /* Sofia's projects */
  {
    userIndex: 3,
    title: 'PaletteAI — Design System Generator',
    description: 'Upload your brand assets and get a complete design system: color palettes, typography scales, component library in Figma and code (React/Tailwind/CSS). AI ensures WCAG accessibility. Export to any format.',
    techStack: ['React', 'Figma API', 'Python', 'OpenAI', 'D3.js'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    status: 'open',
  },
  {
    userIndex: 3,
    title: 'MotionFlow — UI Animation Editor',
    description: 'A visual animation editor for web developers. Draw keyframes, preview animations in real browser context, and export clean CSS/React Spring code. Like After Effects but for UI/UX.',
    techStack: ['React', 'Framer Motion', 'WebGL', 'TypeScript'],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    status: 'open',
  },
  /* James's projects */
  {
    userIndex: 4,
    title: 'Kronos — Distributed Task Scheduler',
    description: 'A fault-tolerant distributed task scheduler inspired by Airflow but lighter. Handles millions of jobs, supports any language via WASM plugins, has a clean web UI, and zero-downtime deploys. Open source core.',
    techStack: ['Go', 'gRPC', 'Redis', 'React', 'Docker'],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    status: 'open',
  },
  {
    userIndex: 4,
    title: 'VaultDB — Encrypted Key-Value Store',
    description: 'An encrypted key-value database for storing sensitive application data. Zero-knowledge architecture — the server never sees plaintext. Client-side encryption with AES-256. REST and gRPC APIs.',
    techStack: ['Rust', 'gRPC', 'AES-256', 'React', 'SQLite'],
    imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&q=80',
    status: 'open',
  },
  /* Nadia's projects */
  {
    userIndex: 5,
    title: 'GrantDAO — Decentralized Grant Platform',
    description: 'A DAO-governed grant funding platform for open source projects. Community members vote on proposals, funds are distributed automatically via smart contracts, and milestone completion is verified on-chain.',
    techStack: ['Solidity', 'Hardhat', 'React', 'ethers.js', 'IPFS'],
    imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
    status: 'open',
  },
  {
    userIndex: 5,
    title: 'ChainVerify — Credential NFT System',
    description: 'Issue tamper-proof credentials (certificates, badges, diplomas) as NFTs on Ethereum. Employers can instantly verify without contacting the issuer. Supports batch minting and has a beautiful public profile page.',
    techStack: ['Solidity', 'ERC-721', 'React', 'Pinata', 'Node.js'],
    imageUrl: 'https://images.unsplash.com/photo-1638913971789-5b3c3b94889c?w=800&q=80',
    status: 'open',
  },
];

const ideaTemplates = [
  /* Alex */
  {
    userIndex: 0,
    title: 'GitHub Copilot for Terminal',
    description: 'An AI assistant that monitors your terminal session and proactively suggests the next command based on what you\'re trying to accomplish. Like autocomplete but for bash workflows. Could be a VS Code extension or standalone CLI daemon.',
    tags: ['AI', 'Developer Tools', 'CLI'],
  },
  {
    userIndex: 0,
    title: 'PR Buddy — PR Review Scheduler',
    description: 'A Slack bot that intelligently routes PR review requests to the right team members based on code ownership, availability, and expertise. No more pinging the whole channel.',
    tags: ['Productivity', 'GitHub', 'Slack'],
  },
  /* Priya */
  {
    userIndex: 1,
    title: 'ModelMarket — Open Source Model Hub',
    description: 'A community marketplace for fine-tuned open-source LLMs. Upload your specialized model, share training details, and let others discover and use it. Like Hugging Face but with social features and revenue sharing.',
    tags: ['AI', 'LLM', 'Open Source', 'Marketplace'],
  },
  {
    userIndex: 1,
    title: 'AutoEval — Automated LLM Benchmarking',
    description: 'A service that continuously benchmarks LLMs on task-specific datasets you define. Get weekly reports on how GPT-4, Claude, Gemini etc. perform on your specific use case. Critical for production ML teams.',
    tags: ['AI', 'Benchmarking', 'LLM', 'SaaS'],
  },
  /* Marcus */
  {
    userIndex: 2,
    title: 'OfflineFirst — PWA Framework Toolkit',
    description: 'A toolkit for building truly offline-first progressive web apps. Automatic conflict resolution, background sync, and a visual editor for defining sync strategies. Abstracts away IndexedDB complexity.',
    tags: ['Mobile', 'PWA', 'Offline', 'Framework'],
  },
  {
    userIndex: 2,
    title: 'AppReviewer — Automated App Store Feedback Analyzer',
    description: 'Scrapes App Store and Play Store reviews and uses NLP to categorize feedback into themes, detect emerging bugs, and generate a weekly digest. Integrates with Linear and Jira.',
    tags: ['Mobile', 'NLP', 'SaaS', 'Analytics'],
  },
  /* Sofia */
  {
    userIndex: 3,
    title: 'ColorScript — Generative Art Color Engine',
    description: 'A creative tool that generates harmonious color palettes from algorithmic art patterns, gradient meshes, and generative noise. Export as CSS, Figma tokens, or Android XML. Beautiful UI is the point.',
    tags: ['Design', 'Generative Art', 'Color', 'Creative'],
  },
  {
    userIndex: 3,
    title: 'AccessAudit — Automated WCAG Checker',
    description: 'A Chrome extension + CI/CD integration that audits your UI for accessibility issues in real-time. Goes beyond basic contrast ratios — checks focus flow, semantic HTML, screen reader compatibility, and provides one-click fixes.',
    tags: ['Accessibility', 'Design', 'Developer Tools'],
  },
  /* James */
  {
    userIndex: 4,
    title: 'QueryTracer — SQL Query Performance Explorer',
    description: 'A visual tool that intercepts slow database queries in development, automatically explains them, suggests indexes, and rewrites inefficient queries. Works with Postgres, MySQL, and SQLite.',
    tags: ['Database', 'Performance', 'Developer Tools'],
  },
  {
    userIndex: 4,
    title: 'ServiceMesh Visualizer',
    description: 'Real-time visualization of microservice communication in Kubernetes. See latency, error rates, and request flows as an animated force graph. Like Jaeger but actually beautiful and easy to read.',
    tags: ['Kubernetes', 'Microservices', 'Observability'],
  },
  /* Nadia */
  {
    userIndex: 5,
    title: 'CryptoTax Simplified',
    description: 'A tool that connects to your crypto wallets and exchanges, auto-calculates cost basis using FIFO/LIFO/HIFO, and generates IRS-ready tax reports. Multi-chain support. Handles NFT trades too.',
    tags: ['Crypto', 'Finance', 'Web3', 'Tax'],
  },
  {
    userIndex: 5,
    title: 'OnchainPortfolio',
    description: 'A beautiful, shareable portfolio page that reads directly from your wallet addresses. Shows NFTs, DeFi positions, historical performance, and lets you add project descriptions. Web3 native LinkedIn for builders.',
    tags: ['Web3', 'Portfolio', 'NFT', 'Ethereum'],
  },
];

async function seed() {
  console.log('🌱 Collabr Seeder starting...\n');
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB\n');

  /* Clear existing seed data (only emails matching our seed list) */
  const seedEmails = users.map(function(u) { return u.email; });
  const existingUsers = await User.find({ email: { $in: seedEmails } });
  const existingIds = existingUsers.map(function(u) { return u._id; });

  if (existingIds.length > 0) {
    await Promise.all([
      Project.deleteMany({ creatorId: { $in: existingIds } }),
      Idea.deleteMany({ authorId: { $in: existingIds } }),
      User.deleteMany({ _id: { $in: existingIds } }),
    ]);
    console.log('✓ Cleared existing seed data\n');
  }

  /* Create users */
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const createdUsers = await User.insertMany(
    users.map(function(u) {
      return {
        name: u.name,
        email: u.email,
        passwordHash: passwordHash,
        bio: u.bio,
        skills: u.skills,
      };
    })
  );
  console.log('✓ Created ' + createdUsers.length + ' users:');
  createdUsers.forEach(function(u) {
    console.log('  · ' + u.name + ' <' + u.email + '>');
  });
  console.log();

  /* Create projects */
  const projectDocs = projectTemplates.map(function(p) {
    return {
      creatorId: createdUsers[p.userIndex]._id,
      title: p.title,
      description: p.description,
      techStack: p.techStack,
      imageUrl: p.imageUrl,
      status: p.status,
    };
  });
  const createdProjects = await Project.insertMany(projectDocs);
  console.log('✓ Created ' + createdProjects.length + ' projects:');
  createdProjects.forEach(function(p) {
    console.log('  · ' + p.title);
  });
  console.log();

  /* Create ideas */
  const ideaDocs = ideaTemplates.map(function(i) {
    return {
      authorId: createdUsers[i.userIndex]._id,
      title: i.title,
      description: i.description,
      tags: i.tags,
    };
  });
  const createdIdeas = await Idea.insertMany(ideaDocs);
  console.log('✓ Created ' + createdIdeas.length + ' ideas:');
  createdIdeas.forEach(function(i) {
    console.log('  · ' + i.title);
  });
  console.log();

  console.log('─────────────────────────────────────────');
  console.log('✅ Seeding complete!\n');
  console.log('Login with any of these accounts:');
  console.log('  Password: user123');
  createdUsers.forEach(function(u) {
    console.log('  · ' + u.email);
  });
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(function(err) {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
