export class MissingMRWError extends Error {
  constructor(mrwURI) {
    const uri = decodeURIComponent(decodeURIComponent(mrwURI));
    const msg = ```An MRW used by this analysis is missing or has been deleted.\n
    If this has happened by accident, please contact a developer and mention the following annotation ID:\n"${uri}"```;
    super(msg);
    this.name = 'MissingMRWError';
  }
}

export class MissingMetaphorError extends Error {
  constructor(metaphorURI) {
    const uri = decodeURIComponent(decodeURIComponent(metaphorURI));
    const msg = `The requested metaphor analysis can not be found. It might have been deleted.\n
    If this has happened by accident, please contact a developer and mention the following metaphor ID:\n"${uri}"`;
    super(msg);
    this.name = 'MissingMetaphorError';
  }
}

export class MissingConceptError extends Error {
  constructor(conceptURI) {
    const uri = decodeURIComponent(decodeURIComponent(conceptURI));
    const msg = `The linked concept "${uri}" can not be found. Please update your analysis.`;
    super(msg);
    this.name = 'MissingConceptError';
  }
}
