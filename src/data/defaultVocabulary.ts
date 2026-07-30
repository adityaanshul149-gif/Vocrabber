import { VocabularyRecord, SectorName } from '../types';

export const DEFAULT_VOCABULARY: VocabularyRecord[] = [
  {
    id: 'VOC000001',
    word: 'abate',
    sector: 'Economics',
    definition: 'To become less intense or widespread',
    exampleUsage: 'Inflation began to abate after policy changes.',
    sentences: [
      { text: 'Inflation began to abate after policy changes.', correct: true },
      { text: 'Public anger abated after the formal inquiry.', correct: true },
      { text: 'The abate professor delivered a lecture on history.', correct: false },
      { text: 'Researchers abated the hypothesis with new data.', correct: false },
      { text: 'The reforms worsened inflation and thus abated prices.', correct: false },
      { text: 'The crisis abated into greater intensity.', correct: false }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'VOC000002',
    word: 'lucid',
    sector: 'Science',
    definition: 'Expressed clearly; easy to understand',
    exampleUsage: 'The paper offered a lucid explanation of quantum mechanics.',
    sentences: [
      { text: 'The paper offered a lucid explanation of the core principles.', correct: true },
      { text: 'Her lecture remained lucid throughout the presentation.', correct: true },
      { text: 'The lucid chaired the committee during the meeting.', correct: false },
      { text: 'Scientists lucid the experiment carefully.', correct: false },
      { text: 'The article became confusing while remaining lucid.', correct: false },
      { text: 'Its complete obscurity made it exceptionally lucid.', correct: false }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'VOC000003',
    word: 'equanimity',
    sector: 'Psychology',
    definition: 'Mental calmness, composure, and evenness of temper',
    exampleUsage: 'She handled the intense criticism with equanimity.',
    sentences: [
      { text: 'She handled the harsh criticism with remarkable equanimity.', correct: true },
      { text: 'His equanimity helped the team stay focused during crisis.', correct: true },
      { text: 'The equanimity objected strongly to the new proposal.', correct: false },
      { text: 'The therapist equanimity the patient response.', correct: false },
      { text: 'Hysterical panic is a classic form of equanimity.', correct: false },
      { text: 'The minor disturbance destroyed his equanimity entirely.', correct: false }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'VOC000004',
    word: 'ephemeral',
    sector: 'Philosophy',
    definition: 'Lasting for a very short time; fleeting',
    exampleUsage: 'Fame in the digital age can be remarkably ephemeral.',
    sentences: [
      { text: 'Fame in the digital age often proves to be ephemeral.', correct: true },
      { text: 'The beauty of spring blossoms is delightfully ephemeral.', correct: true },
      { text: 'An ephemeral stone monument stood unchanged for centuries.', correct: false },
      { text: 'They ephemeral the project after three months.', correct: false },
      { text: 'Permanence is the most ephemeral trait of granite.', correct: false },
      { text: 'The eternal stars are ephemeral bodies in space.', correct: false }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'VOC000005',
    word: 'anomaly',
    sector: 'Research',
    definition: 'Something that deviates from what is standard, normal, or expected',
    exampleUsage: 'The sudden spike in data was flagged as an anomaly.',
    sentences: [
      { text: 'The sudden temperature spike was flagged as a statistical anomaly.', correct: true },
      { text: 'His unorthodox technique was an anomaly in classical ballet.', correct: true },
      { text: 'She anomaly the test results before publication.', correct: false },
      { text: 'The routine outcome was considered a total anomaly.', correct: false },
      { text: 'An anomaly is always strictly compliant with every rule.', correct: false },
      { text: 'The anomaly person decided to walk home.', correct: false }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'VOC000006',
    word: 'pragmatic',
    sector: 'Politics',
    definition: 'Dealing with things sensibly and realistically based on practical considerations',
    exampleUsage: 'They took a pragmatic approach to negotiating the treaty.',
    sentences: [
      { text: 'They took a pragmatic approach to solving the budget deficit.', correct: true },
      { text: 'A pragmatic leader evaluates results rather than pure ideology.', correct: true },
      { text: 'He acted pragmaticly when he threw a tantrum.', correct: false },
      { text: 'The pragmatic refused to listen to practical logic.', correct: false },
      { text: 'Pure fantasy is the foundation of pragmatic thinking.', correct: false },
      { text: 'She pragmaticked the problem away with magical claims.', correct: false }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'VOC000007',
    word: 'fastidious',
    sector: 'Literature',
    definition: 'Very attentive to and concerned about accuracy and detail',
    exampleUsage: 'The editor was fastidious about grammar and historical accuracy.',
    sentences: [
      { text: 'The editor was fastidious regarding historical accuracy.', correct: true },
      { text: 'His fastidious preparation ensured a flawless opening night.', correct: true },
      { text: 'The fastidious worker carelessly tossed files on the floor.', correct: false },
      { text: 'She fastidious the document without reading it.', correct: false },
      { text: 'Messy rooms reflect a fastidious lifestyle.', correct: false },
      { text: 'The fastidious was ignored by everyone in class.', correct: false }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'VOC000008',
    word: 'esoteric',
    sector: 'Ethics',
    definition: 'Intended for or likely to be understood by only a small number of people',
    exampleUsage: 'The seminar covered esoteric concepts in medieval philosophy.',
    sentences: [
      { text: 'The seminar explored esoteric concepts in ancient metaphysics.', correct: true },
      { text: 'He specialized in an esoteric branch of theoretical physics.', correct: true },
      { text: 'The esoteric news anchor broadcasted to millions daily.', correct: false },
      { text: 'Everyone immediately understood the esoteric billboard slogan.', correct: false },
      { text: 'They esotericed the recipe so anyone could cook it.', correct: false },
      { text: 'An esoteric topic is universally known by children.', correct: false }
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  }
];

export const VALID_SECTORS: SectorName[] = [
  'Psychology',
  'Philosophy',
  'Economics',
  'Politics',
  'History',
  'Science',
  'Sociology',
  'Anthropology',
  'Environment',
  'Technology',
  'Research',
  'Linguistics',
  'Literature',
  'Ethics',
  'Evolution',
  'General'
];
