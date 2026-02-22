import { Analysis } from '../models/analysis';
import { Mapping, stepEnum as mapType } from '../models/mapping';
import { Proposition, typeEnum as propType } from '../models/proposition';

const createDummyAnalysis = () => {
  const data = {
    file_id: 12345,
    analysis_label: 'a taste of a poison paradise',
    annotator: 'Britney Spears',
    doc_title: 'Toxic',
    doc_reference: 'refrain, line 3',
    project: 'INF',
    text: {
      value: `With a taste of your lips, I'm on a ride
You're toxic, I'm slippin' under
With a taste of a poison paradise
I'm addicted to you
Don't you know that you're toxic?`,
    },
    propositions: [new Proposition({ subject: 'you', value: 'toxic', type: propType.attribute })],
    mappings: [
      new Mapping({
        source: { value: 'toxic', step: mapType.open },
        target: { value: 'harmful', step: mapType.complete },
      }),
    ],
    linkings: [],
  };
  const analysis = new Analysis(data);
  return analysis;
};

/**
 * Fake a network response with a single analysis.
 */
const loadAnalysis = async (_id) => {
  const a = createDummyAnalysis();
  console.log('load an analysis');
  console.log(_id);
  let p = new Promise((resolve) => setTimeout(() => resolve({ analysis: a }), 1000));
  return p;
};

/**
 * Fake a network response with an array containing a single analysis.
 */
const loadAllAnalyses = async () => {
  const a = createDummyAnalysis();
  let p = new Promise((resolve) => setTimeout(() => resolve({ analyses: [a] }), 500));
  return p;
};

export { createDummyAnalysis, loadAnalysis, loadAllAnalyses };
