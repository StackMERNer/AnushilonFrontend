export const QUESTION_TYPE_LABEL_MAP: Record<string, string> = {
  ssc_gap_filling_1st: "Gap Filling 1st",
  information_transfer: "Information Transfer",
  ssc_substitution_table: "Substitution Table",
  summary: "Summary",
  ssc_seen_passage_1st: "Seen Passage 1st",
  gap_filling_1st: "Gap Filling 1st",
  completing_stories: "Completing Stories",
  ssc_changing_sentence: "Changing Sentence",
  ssc_punctuation: "Punctuation",
  ssc_completing_stories: "Completing Stories",
  potro: "পত্র",
  cq: "সৃজনশীল",
  short: "সংক্ষিপ্ত প্রশ্ন",
  ssc_matching: "SSC Matching",
  paragraph_writing: "Paragraph Writing",
  vocabulary: "Vocabulary",
  ssc_right_form_of_verbs: "Right Form of Verbs",
  ssc_sarangsho: "সারাংশ",
  short_composition: "Short Composition",
  dialogue: "Dialogue",
  narration: "Narration",
  mcq_english: "MCQ",
  bornona_mulok: "বর্ণনামূলক",
  ssc_ques_and_ans_from_stories: "SSC Questions & Answers from Stories",
  mcq: "বহুনির্বাচনি",
  ans_ques_from_poems: "Answers to Questions from Poems",
  ssc_preposition: "Preposition",
  letter: "Letter",
  ssc_short_composition: "Short Composition",
  ssc_letter: "Letter",
  ssc_vabshomprosaron: "ভাবসম্প্রসারণ",
  onudcched_rochona: "অনুচ্ছেদ রচনা",
  answer_questions: "Answer Questions",
  changing_sentence: "Changing Sentence",
  ssc_unseen_passage: "Unseen Passage",
  ssc_rearrange: "Rearrange",
  rochona: "রচনা",
  seen_passage_1st: "Seen Passage 1st",
  punctuation: "Punctuation",
  potro_rochona: "পত্র রচনা",
  ssc_suffix_prefix: "Suffix Prefix",
  sarangsho: "সারাংশ",
  indentifying_parts_of_speech: "Parts of Speech",
  ssc_connectors: "Connectors",
  unseen_passage: "Unseen Passage",
  substitution_table: "Substitution Table",
  right_form_of_verbs: "Right Form of Verbs",
  ssc_tag_question: "Tag Question",
  arthik_biboroni: "আর্থিক বিবরণী",
  true_false: "সত্য/মিথ্যা",
  ssc_gap_filling: "Gap Filling",
  ssc_ques_and_ans_from_poems: "Questions & Answers from Poems",
  onudhabonn_dokkhota: "অনুধাবন দক্ষতা",
  protibedon: "প্রতিবেদন",
  onudhabon: "অনুধাবন",
  rearrange: "Rearrange",
  gap_filling: "Gap Filling",
  matching: "Matching",
  vabshomprosaron: "ভাবসম্প্রসারণ",
  onubad: "অনুবাদ",
  ssc_rochona: "রচনা",
  seen_passage_2nd: "Seen Passage 2nd",
  ssc_paragraph: "Paragraph writng",
};

export type PlanType =
  | "monthly"
  | "six_month"
  | "yearly"
  | "free"
  | "subject_yearly"
  | "custom";

export interface PlanInfo {
  type: PlanType;
  name: string;

  isFree?: boolean;

  price: number;
  originalPrice?: number;

  durationDays: number;
  durationLabel: string;

  features: string[];

  popular?: boolean;
}

export const plansInfo: PlanInfo[] = [
  {
    type: "free",
    name: "ফ্রি",
    isFree: true,
    price: 0,

    durationDays: 0,
    durationLabel: "",

    features: [
      "সর্বোচ্চ ৩ টি প্রশ্নপত্র তৈরী",
      "লিমিটেড প্রশ্নব্যাংক অ্যাকসেস",
    ],
  },

  {
    type: "six_month",
    name: "৬ মাস",

    price: 750,
    originalPrice: 1200,

    durationDays: 180,
    durationLabel: "/ ৬ মাস",

    popular: false,

    features: ["আনলিমিটেড প্রশ্নপত্র", "সকল ক্লাসের (৬ষ্ঠ থেকে ১০ম) অ্যাকসেস"],
  },

  {
    type: "yearly",
    name: "বার্ষিক",

    price: 1200,
    originalPrice: 1750,
    popular: true,
    durationDays: 365,
    durationLabel: "/ বছর",
    features: ["আনলিমিটেড প্রশ্নপত্র", "সকল ক্লাসের (৬ষ্ঠ থেকে ১০ম) অ্যাকসেস"],
  },
];

export const getMaxPrice = () => {
  // find max priced plan and return its price
  return Math.max(...plansInfo.map((plan) => plan.price));
};

export const streamMap = {
  all: "সব",
  generel: "সাধারণ",
  general: "সাধারণ",
  science: "বিজ্ঞান",
  humanities: "মানবিক",
  business: "ব্যবসায় শিক্ষা",
};
export const getStreamNameBn = (stream: string) => {
  return streamMap[stream as keyof typeof streamMap] || stream;
};
