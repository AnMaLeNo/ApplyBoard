const variantBlockSchema = {
  type: 'object',
  required: ['variants'],
  additionalProperties: false,
  properties: {
    variants: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

const entrySchema = {
  type: 'object',
  required: ['title', 'description'],
  additionalProperties: false,
  properties: {
    title: variantBlockSchema,
    description: variantBlockSchema,
  },
};

const listSectionSchema = {
  type: 'object',
  required: ['items'],
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

const cvDocumentSchema = {
  type: 'object',
  required: ['cv'],
  additionalProperties: false,
  properties: {
    cv: {
      type: 'object',
      required: [
        'title',
        'summary',
        'projects',
        'education',
        'hackathons',
        'skills',
        'interests',
      ],
      additionalProperties: false,
      properties: {
        title: variantBlockSchema,
        summary: variantBlockSchema,
        projects: { type: 'object', additionalProperties: entrySchema },
        education: { type: 'object', additionalProperties: entrySchema },
        hackathons: { type: 'object', additionalProperties: entrySchema },
        skills: listSectionSchema,
        interests: listSectionSchema,
      },
    },
  },
};

export const emptyCvDocument = {
  cv: {
    title: { variants: [] },
    summary: { variants: [] },
    projects: {},
    education: {},
    hackathons: {},
    skills: { items: [] },
    interests: { items: [] },
  },
};

export default cvDocumentSchema;
