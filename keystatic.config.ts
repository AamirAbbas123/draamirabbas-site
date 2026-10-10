import { config, fields, singleton, collection } from '@keystatic/core';

// Storage: "local" while developing on your computer, "github" once deployed.
// Set PUBLIC_KEYSTATIC_STORAGE=github and PUBLIC_KEYSTATIC_REPO=<owner>/<repo> on Vercel.
const useGithub = import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github';
const repo = (import.meta.env.PUBLIC_KEYSTATIC_REPO || 'owner/draamirabbas-site') as `${string}/${string}`;

const publish = fields.checkbox({
  label: 'Publish',
  description: 'Untick to keep this as a draft that does not appear on the site.',
  defaultValue: true,
});
const order = fields.integer({
  label: 'Display order',
  description: 'Lower numbers appear first.',
  defaultValue: 10,
});

export default config({
  storage: useGithub ? { kind: 'github', repo } : { kind: 'local' },
  ui: {
    brand: { name: 'Site admin' },
    navigation: {
      'Site-wide': ['settings', 'impact', 'home'],
      Pages: ['about', 'challenge'],
      'Work and research': ['roles', 'programmes', 'publications', 'research'],
      'Content and community': ['featured', 'communities', 'talks'],
      Projects: ['projects', 'github'],
    },
  },

  singletons: {
    settings: singleton({
      label: 'Site settings',
      path: 'content/settings/',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Full name', defaultValue: 'Aamir Abbas' }),
        honorific: fields.text({ label: 'Prefix', defaultValue: 'Dr' }),
        headline: fields.text({
          label: 'Headline',
          description: 'One line under your name on the Home page.',
        }),
        intro: fields.text({
          label: 'Short bio (about 25–40 words)',
          multiline: true,
        }),
        photo: fields.image({
          label: 'Headshot',
          directory: 'public/images/profile',
          publicPath: '/images/profile/',
        }),
        cv: fields.file({
          label: 'CV (PDF)',
          directory: 'public/files',
          publicPath: '/files/',
        }),
        email: fields.text({ label: 'Public email' }),
        location: fields.text({ label: 'Location', defaultValue: 'Karachi, Pakistan' }),
        contactFormEndpoint: fields.url({
          label: 'Contact form endpoint (optional)',
          description:
            'A Formspree or Web3Forms URL. Leave empty and the Contact section shows your email instead.',
        }),
        links: fields.object(
          {
            linkedin: fields.url({ label: 'LinkedIn' }),
            substack: fields.url({ label: 'Substack' }),
            youtubeEn: fields.url({ label: 'YouTube (English)' }),
            youtubeUr: fields.url({ label: 'YouTube (Urdu)' }),
            github: fields.url({ label: 'GitHub' }),
            orcid: fields.url({ label: 'ORCID' }),
            scholar: fields.url({ label: 'Google Scholar' }),
            x: fields.url({ label: 'X / Twitter' }),
          },
          { label: 'Profile links' }
        ),
        feeds: fields.object(
          {
            substackFeed: fields.url({
              label: 'Substack feed URL',
              description: 'Your Substack address followed by /feed, e.g. https://name.substack.com/feed',
            }),
            youtubeEnChannelId: fields.text({
              label: 'English YouTube channel ID',
              description: 'Starts with UC… (YouTube Studio → Settings → Channel → Advanced settings).',
            }),
            youtubeUrChannelId: fields.text({ label: 'Urdu YouTube channel ID' }),
            orcidId: fields.text({
              label: 'ORCID iD',
              description: 'Format 0000-0000-0000-0000. Publications on ORCID appear automatically.',
            }),
            githubUsername: fields.text({ label: 'GitHub username' }),
          },
          { label: 'Automatic feeds' }
        ),
        stats: fields.object(
          {
            substackSubscribers: fields.text({ label: 'Substack subscribers (e.g. 20,000+)' }),
            youtubeEnSubscribers: fields.text({ label: 'English channel subscribers' }),
            youtubeUrSubscribers: fields.text({ label: 'Urdu channel subscribers' }),
          },
          { label: 'Audience numbers shown on content pages' }
        ),
      },
    }),

    impact: singleton({
      label: 'Impact numbers',
      path: 'content/impact/',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            value: fields.text({ label: 'Number', description: 'e.g. 20+' }),
            label: fields.text({ label: 'What it counts', description: 'e.g. peer-reviewed publications' }),
          }),
          {
            label: 'Numbers on the Home page',
            itemLabel: (p) => `${p.fields.value.value} ${p.fields.label.value}`,
          }
        ),
      },
    }),

    home: singleton({
      label: 'Home page',
      path: 'content/home/',
      format: { data: 'json' },
      schema: {
        showImpact: fields.checkbox({ label: 'Show impact numbers', defaultValue: true }),
        showWork: fields.checkbox({ label: 'Show "Areas of work" list', defaultValue: true }),
        showLatest: fields.checkbox({ label: 'Show latest writing and videos', defaultValue: true }),
        showChallenge: fields.checkbox({ label: 'Show LinkedIn challenge strip', defaultValue: true }),
        showProjects: fields.checkbox({ label: 'Show projects', defaultValue: true }),
        areas: fields.array(
          fields.object({
            title: fields.text({ label: 'Title' }),
            summary: fields.text({ label: 'One line', multiline: true }),
            href: fields.text({ label: 'Link', description: 'A page on this site (e.g. /work) or a full URL.' }),
          }),
          { label: 'Areas of work', itemLabel: (p) => p.fields.title.value || 'Untitled' }
        ),
      },
    }),

    about: singleton({
      label: 'About page',
      path: 'content/about/',
      format: { data: 'json' },
      schema: {
        story: fields.text({
          label: 'Your story',
          multiline: true,
          description: 'Leave a blank line between paragraphs.',
        }),
        education: fields.array(
          fields.object({
            degree: fields.text({ label: 'Degree' }),
            institution: fields.text({ label: 'Institution' }),
            year: fields.text({ label: 'Year' }),
            note: fields.text({ label: 'Note (optional)', description: 'e.g. Fulbright Scholar' }),
          }),
          { label: 'Education', itemLabel: (p) => `${p.fields.degree.value} — ${p.fields.institution.value}` }
        ),
        honours: fields.array(fields.text({ label: 'Honour or award' }), {
          label: 'Honours and recognition',
          itemLabel: (p) => p.value,
        }),
      },
    }),

    challenge: singleton({
      label: 'LinkedIn 1065-day challenge',
      path: 'content/challenge/',
      format: { data: 'json' },
      schema: {
        startDate: fields.date({
          label: 'Start date',
          description: 'The day count on the site is calculated from this date.',
        }),
        targetDays: fields.integer({ label: 'Target days', defaultValue: 1065 }),
        story: fields.text({
          label: 'Why you started it',
          multiline: true,
          description: 'Leave a blank line between paragraphs.',
        }),
        themes: fields.array(fields.text({ label: 'Theme' }), {
          label: 'Recurring themes',
          itemLabel: (p) => p.value,
        }),
        bestPosts: fields.array(
          fields.object({
            title: fields.text({ label: 'Post title or first line' }),
            day: fields.integer({ label: 'Day number' }),
            url: fields.url({ label: 'Post link' }),
            summary: fields.text({ label: 'One-line summary', multiline: true }),
          }),
          { label: 'Selected posts', itemLabel: (p) => `Day ${p.fields.day.value ?? '?'}: ${p.fields.title.value}` }
        ),
      },
    }),

    github: singleton({
      label: 'GitHub settings',
      path: 'content/github/',
      format: { data: 'json' },
      schema: {
        showRepos: fields.checkbox({ label: 'Show GitHub repositories on Projects page', defaultValue: true }),
        maxRepos: fields.integer({ label: 'Maximum repositories to show', defaultValue: 9 }),
        hiddenRepos: fields.array(fields.text({ label: 'Repository name' }), {
          label: 'Repositories to hide',
          description: 'Practice or private-feeling repos you do not want listed.',
          itemLabel: (p) => p.value,
        }),
      },
    }),
  },

  collections: {
    roles: collection({
      label: 'Roles',
      path: 'content/roles/*',
      slugField: 'title',
      format: { data: 'json' },
      columns: ['title', 'organisation'],
      schema: {
        title: fields.slug({ name: { label: 'Job title' } }),
        organisation: fields.text({ label: 'Organisation' }),
        orgUrl: fields.url({ label: 'Organisation website' }),
        start: fields.text({ label: 'Start (e.g. 2021)' }),
        end: fields.text({ label: 'End', description: 'Leave empty if current.' }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        achievements: fields.array(fields.text({ label: 'Achievement', multiline: true }), {
          label: 'Key achievements',
          itemLabel: (p) => p.value.slice(0, 60),
        }),
        units: fields.array(fields.text({ label: 'Unit or team' }), {
          label: 'Teams you lead (optional)',
          itemLabel: (p) => p.value,
        }),
        order,
        publish,
      },
    }),

    programmes: collection({
      label: 'Programmes and studies',
      path: 'content/programmes/*',
      slugField: 'name',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        funder: fields.text({ label: 'Funder or partner' }),
        role: fields.text({ label: 'Your role', description: 'e.g. Principal Investigator' }),
        summary: fields.text({ label: 'What it is', multiline: true }),
        outcome: fields.text({ label: 'Result or outcome', multiline: true }),
        image: fields.image({ label: 'Image (optional)', directory: 'public/images/programmes', publicPath: '/images/programmes/' }),
        link: fields.url({ label: 'Link (optional)' }),
        order,
        publish,
      },
    }),

    publications: collection({
      label: 'Publications (manual)',
      path: 'content/publications/*',
      slugField: 'title',
      format: { data: 'json' },
      columns: ['title', 'year'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        authors: fields.text({ label: 'Authors', description: 'As cited, e.g. Abbas A, Fatima M, Sarker A.' }),
        journal: fields.text({ label: 'Journal or venue' }),
        year: fields.integer({ label: 'Year' }),
        doi: fields.text({ label: 'DOI', description: 'e.g. 10.1186/s12883-026-01234-5' }),
        url: fields.url({ label: 'Link (if no DOI)' }),
        topic: fields.select({
          label: 'Topic',
          options: [
            { label: 'Health AI and NLP', value: 'health-ai' },
            { label: 'Maternal and child health', value: 'mch' },
            { label: 'Neurology and stroke', value: 'neurology' },
            { label: 'Paediatric oncology', value: 'oncology' },
            { label: 'Epidemiology and methods', value: 'methods' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'health-ai',
        }),
        featured: fields.checkbox({ label: 'Feature at the top of Research', defaultValue: false }),
        publish,
      },
    }),

    research: collection({
      label: 'Ongoing research',
      path: 'content/research/*',
      slugField: 'title',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Working title' } }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Systematic review', value: 'Systematic review' },
            { label: 'Scoping review', value: 'Scoping review' },
            { label: 'Narrative review', value: 'Narrative review' },
            { label: 'Original analysis', value: 'Original analysis' },
            { label: 'Trial or cohort', value: 'Trial or cohort' },
            { label: 'Commentary', value: 'Commentary' },
          ],
          defaultValue: 'Systematic review',
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Protocol', value: 'Protocol' },
            { label: 'In progress', value: 'In progress' },
            { label: 'Under review', value: 'Under review' },
            { label: 'Accepted', value: 'Accepted' },
          ],
          defaultValue: 'In progress',
        }),
        summary: fields.text({ label: 'One-line summary', multiline: true }),
        publish,
      },
    }),

    featured: collection({
      label: 'Featured posts and videos',
      path: 'content/featured/*',
      slugField: 'title',
      format: { data: 'json' },
      columns: ['title', 'platform'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        platform: fields.select({
          label: 'Platform',
          options: [
            { label: 'Substack', value: 'substack' },
            { label: 'YouTube (English)', value: 'youtube-en' },
            { label: 'YouTube (Urdu)', value: 'youtube-ur' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'substack',
        }),
        url: fields.url({ label: 'Link' }),
        date: fields.date({ label: 'Date' }),
        summary: fields.text({ label: 'One-line summary', multiline: true }),
        publish,
      },
    }),

    communities: collection({
      label: 'Communities and networks',
      path: 'content/communities/*',
      slugField: 'name',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Network name' } }),
        role: fields.text({ label: 'Your role', description: 'e.g. Founding admin' }),
        members: fields.text({ label: 'Size (optional)', description: 'e.g. 1,200 members' }),
        purpose: fields.text({ label: 'What it does', multiline: true }),
        highlights: fields.array(fields.text({ label: 'Event or outcome', multiline: true }), {
          label: 'Highlights',
          itemLabel: (p) => p.value.slice(0, 60),
        }),
        joinUrl: fields.url({ label: 'How to join (optional)' }),
        order,
        publish,
      },
    }),

    projects: collection({
      label: 'Projects and initiatives',
      path: 'content/projects/*',
      slugField: 'name',
      format: { data: 'json' },
      columns: ['name', 'status'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Idea', value: 'Idea' },
            { label: 'In development', value: 'In development' },
            { label: 'Launched', value: 'Launched' },
            { label: 'Archived', value: 'Archived' },
          ],
          defaultValue: 'In development',
        }),
        description: fields.text({ label: 'Description', multiline: true }),
        url: fields.url({ label: 'Website (optional)' }),
        repo: fields.url({ label: 'GitHub repository (optional)' }),
        started: fields.text({ label: 'Started (e.g. 2026)' }),
        order,
        publish,
      },
    }),

    talks: collection({
      label: 'Talks and media',
      path: 'content/talks/*',
      slugField: 'title',
      format: { data: 'json' },
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        event: fields.text({ label: 'Event or outlet' }),
        city: fields.text({ label: 'City' }),
        date: fields.date({ label: 'Date' }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Talk', value: 'Talk' },
            { label: 'Keynote', value: 'Keynote' },
            { label: 'Panel', value: 'Panel' },
            { label: 'Poster', value: 'Poster' },
            { label: 'Interview', value: 'Interview' },
            { label: 'Podcast', value: 'Podcast' },
          ],
          defaultValue: 'Talk',
        }),
        link: fields.url({ label: 'Slides, video or article (optional)' }),
        publish,
      },
    }),
  },
});
