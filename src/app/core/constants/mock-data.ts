import {
  Book,
  BookStatus,
  Genre,
  ImportRecord,
  RecommendationList,
  User
} from '../models/domain.models';

const now = new Date();
const isoDaysAgo = (days: number): string => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const MOCK_USERS: User[] = [
  {
    id: 'u-anna',
    username: 'anna',
    password: 'anna123',
    fullName: 'Anna Petrenko'
  },
  {
    id: 'u-ivan',
    username: 'ivan',
    password: 'ivan123',
    fullName: 'Ivan Smirnov'
  }
];

export const MOCK_GENRES: Genre[] = [
  { id: 'g-classic', name: 'Classics' },
  { id: 'g-scifi', name: 'Sci-Fi' },
  { id: 'g-fantasy', name: 'Fantasy' },
  { id: 'g-nonfiction', name: 'Non-fiction' },
  { id: 'g-business', name: 'Business' },
  { id: 'g-psychology', name: 'Psychology' }
];

const statusFromDays = (days: number): BookStatus => {
  if (days < 20) {
    return 'reading';
  }

  if (days < 40) {
    return 'planned';
  }

  return 'finished';
};

const finishedAtFromStatus = (status: BookStatus, days: number): string | null =>
  status === 'finished' ? isoDaysAgo(days - 5) : null;

const createBook = (
  id: string,
  userId: string,
  title: string,
  author: string,
  year: number,
  publisher: string,
  genres: string[],
  daysAgo: number,
  rating: number | null,
  notes: string,
  quotes: string
): Book => {
  const status = statusFromDays(daysAgo);

  return {
    id,
    userId,
    title,
    author,
    year,
    publisher,
    genres,
    status,
    rating: status === 'finished' ? rating : null,
    notes,
    quotes,
    createdAt: isoDaysAgo(daysAgo + 20),
    updatedAt: isoDaysAgo(daysAgo),
    finishedAt: finishedAtFromStatus(status, daysAgo)
  };
};

export const MOCK_BOOKS: Book[] = [
  createBook(
    'b-1',
    'u-anna',
    'The Pragmatic Programmer',
    'Andrew Hunt',
    1999,
    'Addison-Wesley',
    ['g-nonfiction', 'g-business'],
    45,
    5,
    'Great practical principles for daily engineering decisions.',
    'Care about your craft.'
  ),
  createBook(
    'b-2',
    'u-anna',
    'Dune',
    'Frank Herbert',
    1965,
    'Chilton Books',
    ['g-scifi', 'g-fantasy'],
    8,
    4,
    'Need to revisit political world-building chapters.',
    'Fear is the mind-killer.'
  ),
  createBook(
    'b-3',
    'u-anna',
    'Deep Work',
    'Cal Newport',
    2016,
    'Grand Central Publishing',
    ['g-business', 'g-psychology'],
    25,
    4,
    'Useful model for planning focused sessions.',
    'A deep life is a good life.'
  ),
  createBook(
    'b-4',
    'u-ivan',
    'Clean Code',
    'Robert C. Martin',
    2008,
    'Prentice Hall',
    ['g-nonfiction'],
    60,
    5,
    'High signal-to-noise ratio for refactoring.',
    'Leave the campground cleaner than you found it.'
  ),
  createBook(
    'b-5',
    'u-ivan',
    'Sapiens',
    'Yuval Noah Harari',
    2011,
    'Harvill Secker',
    ['g-nonfiction', 'g-psychology'],
    12,
    4,
    'Interesting framing of social myths.',
    'Culture tends to argue that it forbids only that which is unnatural.'
  )
];

export const MOCK_RECOMMENDATIONS: RecommendationList[] = [
  {
    id: 'r-1',
    userId: 'u-anna',
    name: 'Must Read for Engineers',
    description: 'Books I recommend to junior developers.',
    bookIds: ['b-1', 'b-3'],
    createdAt: isoDaysAgo(70),
    updatedAt: isoDaysAgo(5)
  },
  {
    id: 'r-2',
    userId: 'u-ivan',
    name: 'System Thinking',
    description: 'Books about structured decision making.',
    bookIds: ['b-4', 'b-5'],
    createdAt: isoDaysAgo(35),
    updatedAt: isoDaysAgo(12)
  }
];

export const MOCK_IMPORTS: ImportRecord[] = [
  {
    id: 'imp-1',
    userId: 'u-anna',
    source: 'json',
    importedAt: isoDaysAgo(20),
    importedBooks: 2
  },
  {
    id: 'imp-2',
    userId: 'u-ivan',
    source: 'csv',
    importedAt: isoDaysAgo(15),
    importedBooks: 1
  }
];
