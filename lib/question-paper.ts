import { QuestionLevel } from "@/types/question";
import { toBnDigits } from "./helpers";

export const questionTypeMap: Record<
  string,
  { hintBn: string; hintEn: string; marks: number; defaultLang?: "bn" | "en" }
> = {
  mcq: {
    hintBn: "বহুনির্বাচনি অংশ: ",
    hintEn: "Answer the following MCQ questions: ",
    marks: 1,
  },
  short: {
    hintBn: "সংক্ষিপ্ত প্রশ্ন গুলোর উত্তর লিখ:",
    hintEn: "Answer the following short questions: ",
    marks: 2,
  },
  cq: {
    hintBn: "সৃজনশীল অংশ:",
    hintEn: "Answer the following creative questions: ",
    marks: 10,
  },

  // ssc english
  ssc_seen_passage_1st: {
    hintBn: "Read the text and answer the questions 1, 2 & 3.",
    hintEn: "Read the text and answer the questions 1, 2 & 3.",
    marks: 0,
    defaultLang: "en",
  },
  seen_passage_1st: {
    hintBn: "Read the text and answer the questions 1 & 2.",
    hintEn: "Read the text and answer the questions 1 & 2.",
    marks: 0,
    defaultLang: "en",
  },
  mcq_english: {
    hintBn:
      "Choose the correct answer to each question from the alternatives given and write the corresponding number of the answers.",
    hintEn:
      "Choose the correct answer to each question from the alternatives given and write the corresponding number of the answers.",
    marks: 1,
    defaultLang: "en",
  },
  answer_questions: {
    hintEn:
      "Give short answers to the following questions in your answer scirpt :",
    hintBn:
      "Give short answers to the following questions in your answer scirpt. :",
    marks: 2,
    defaultLang: "en",
  },
  seen_passage_2nd: {
    hintBn: "Read the text and answer the questions 3 & 4.",
    hintEn: "Read the text and answer the questions 3 & 4.",
    marks: 0,
    defaultLang: "en",
  },
  gap_filling_1st: {
    hintBn:
      "Read the following text and fill in each gap with a suitable word based on the information provided in the text.",
    hintEn:
      "Read the following text and fill in each gap with a suitable word based on the information provided in the text.",
    marks: 5,
    defaultLang: "en",
  },
  vocabulary: {
    hintBn:
      "Read the above passage again and write the synonyms and antonyms of the words as directed below:",
    hintEn:
      "Read the above passage again and write the synonyms and antonyms of the words as directed below:",
    marks: 10,
    defaultLang: "en",
  },
  unseen_passage: {
    hintBn: "Read the text and answer the questions 5, 6 & 7.",
    hintEn: "Read the text and answer the questions 5, 6 & 7.",
    marks: 0,
    defaultLang: "en",
  },
  ssc_unseen_passage: {
    hintEn: "Read the text and answer the questions 4 & 5.",
    hintBn: "Read the text and answer the questions 4 & 5.",
    marks: 0,
    defaultLang: "en",
  },
  information_transfer: {
    hintBn: "Complete the table below with information from the passage.",
    hintEn: "Complete the table below with information from the passage.",
    marks: 5,
    defaultLang: "en",
  },
  true_false: {
    hintBn:
      "Now read the following statements. Write (T) in your answer script if the statement is true. Write (F) if the statement is false. If false, write the correct answer.",
    hintEn:
      "Now read the following statements. Write (T) in your answer script if the statement is true. Write (F) if the statement is false. If false, write the correct answer.",
    marks: 1,
    defaultLang: "en",
  },
  summary: { hintBn: "Summary Writing", hintEn: "Summary Writing", marks: 10 },
  matching: {
    hintBn:
      "Match the  of sentences given in column 'A' and column 'B' to write five complete sentences.",
    hintEn:
      "Match the  of sentences given in column 'A' and column 'B' to write five complete sentences.",
    marks: 1,
    defaultLang: "en",
  },
  rearrange: {
    hintBn:
      "Rearrange the following sentences in correct order in your answer script. You do not need to reproduce the sentences in your script. Only the corresponding numbers of the sentences need to be wrritten.",
    hintEn:
      "Rearrange the following sentences in correct order in your answer script. You do not need to reproduce the sentences in your script. Only the corresponding numbers of the sentences need to be wrritten.",
    marks: 8,
    defaultLang: "en",
  },

  ssc_gap_filling_1st: {
    hintBn:
      "Read the following text and fill in each gap with a suitable word based on the information provided in the text.",
    hintEn:
      "Read the following text and fill in each gap with a suitable word based on the information provided in the text.",
    marks: 5,
    defaultLang: "en",
  },
  substitution_table: {
    hintBn:
      "Make five sentences using  of sentences from each column of the table below.",
    hintEn:
      "Make five sentences using  of sentences from each column of the table below.",
    marks: 5,
    defaultLang: "en",
  },

  right_form_of_verbs: {
    hintBn:
      "Complete the following text with right forms of the verbs given in the box.",
    hintEn:
      "Complete the following text with right forms of the verbs given in the box.",
    marks: 5,
    defaultLang: "en",
  },
  changing_sentence: {
    hintBn: "Change the sentence according to the directions.",
    hintEn: "Change the sentence according to the directions.",
    marks: 5,
    defaultLang: "en",
  },
  punctuation: {
    hintBn:
      "Use capitals and punctuation marks where necessary in the following text:",
    hintEn:
      "Use capitals and punctuation marks where necessary in the following text:",
    marks: 5,
    defaultLang: "en",
  },
  letter: {
    hintBn: "Letter/Application Writing",
    hintEn: "Letter/Application Writing",
    marks: 8,
    defaultLang: "en",
  },
  short_composition: {
    hintBn: "Composition Writing.",
    hintEn: "Composition Writing.",
    marks: 12,
    defaultLang: "en",
  },
  ssc_changing_sentence: {
    hintBn: "Change the sentence according to the directions.",
    hintEn: "Change the sentence according to the directions.",
    marks: 10,
    defaultLang: "en",
  },
  ssc_punctuation: {
    hintBn:
      "Use capitals and punctuation marks where necessary in the following text:",
    hintEn:
      "Use capitals and punctuation marks where necessary in the following text:",
    marks: 5,
    defaultLang: "en",
  },
  ssc_completing_stories: {
    hintBn:
      "Read the opening of a story below and add at least ten new sentences to complete the story.",
    hintEn:
      "Read the opening of a story below and add at least ten new sentences to complete the story.",
    marks: 15,
    defaultLang: "en",
  },
  potro: {
    hintBn: "পত্র/দরখাস্ত লেখ:",
    hintEn: "Letter Writing",
    marks: 10,
  },

  ssc_matching: {
    hintBn:
      "Match the  of sentences given in column 'A', 'B' and column 'C' to write five complete sentences in your answer script.",
    hintEn:
      "Match the  of sentences given in column 'A', 'B' and column 'C' to write five complete sentences in your answer script.",
    marks: 5,
    defaultLang: "en",
  },

  ssc_right_form_of_verbs: {
    hintBn:
      "Complete the following text with right forms of the verbs given in the box.",
    hintEn:
      "Complete the following text with right forms of the verbs given in the box.",
    marks: 10,
    defaultLang: "en",
  },
  ssc_sarangsho: {
    hintBn: "সারাংশ/সারমর্ম লেখ ",
    hintEn: "সারাংশ/সারমর্ম লেখ ",
    marks: 10,
  },

  bornona_mulok: {
    hintBn: "বর্ণনামূলক প্রশ্নগুলোর উত্তর দাও :",
    hintEn: "বর্ণনামূলক প্রশ্নগুলোর উত্তর দাও :",
    marks: 10,
  },
  ssc_ques_and_ans_from_stories: {
    hintBn: "Read the stories carefully and answer the following questions.",
    hintEn: "Read the stories carefully and answer the following questions.",
    marks: 2,
    defaultLang: "en",
  },

  ssc_preposition: {
    hintBn: "Fill in the blanks with suitable prepositions:",
    hintEn: "Fill in the blanks with suitable prepositions:",
    marks: 5,
    defaultLang: "en",
  },
  ssc_paragraph: {
    hintBn: "Paragraph Writing",
    hintEn: "Paragraph Writing",
    marks: 10,
    defaultLang: "en",
  },

  ssc_short_composition: {
    hintBn: "Composition Writing.",
    hintEn: "Composition Writing.",
    marks: 20,
    defaultLang: "en",
  },
  ssc_letter: {
    hintBn: "Letter/Application Writing",
    hintEn: "Letter/Application Writing",
    marks: 10,
    defaultLang: "en",
  },
  ssc_vabshomprosaron: {
    hintBn: "ভাব-সমপ্রসারণ কর :",
    hintEn: "ভাব-সমপ্রসারণ কর :",
    marks: 10,
  },
  onudcched_rochona: {
    hintBn: "অনুধাবন দক্ষতা / অনুচ্ছেদ রচনা করো :",
    hintEn: "অনুধাবন দক্ষতা / অনুচ্ছেদ রচনা করো :",
    marks: 10,
  },

  ssc_rearrange: {
    hintBn:
      "Put the following  of the story in correct order to rewrite the whole story.",
    hintEn:
      "Put the following  of the story in correct order to rewrite the whole story.",
    marks: 8,
    defaultLang: "en",
  },
  ans_ques_from_poems: {
    hintBn: "Read the poems carefully and answer the following questions.",
    hintEn: "Read the poems carefully and answer the following questions.",
    marks: 2,
    defaultLang: "en",
  },

  completing_stories: {
    hintBn:
      "Read the opening of a story below and add at least ten new sentences to complete the story.",
    hintEn:
      "Read the opening of a story below and add at least ten new sentences to complete the story.",
    marks: 10,
    defaultLang: "en",
  },
  paragraph_writing: {
    hintBn: "Paragraph Writing",
    hintEn: "Paragraph Writing",
    marks: 10,
    defaultLang: "en",
  },
  dialogue: {
    hintBn: "Dialogue Writing.",
    hintEn: "Dialogue Writing.",
    marks: 10,
    defaultLang: "en",
  },
  // english 2nd
  indentifying_parts_of_speech: {
    hintBn:
      "Identify the  of speech of the underlined words in the following passage.",
    hintEn:
      "Identify the  of speech of the underlined words in the following passage.",
    marks: 5,
    defaultLang: "en",
  },
  narration: {
    hintBn: "Change the following passage/sentence into indirect speech.",
    hintEn: "Change the following passage/sentence into indirect speech.",
    marks: 5,
    defaultLang: "en",
  },
  gap_filling: {
    hintEn:
      "Fill in the blanks with the words from the box. You may need to change the forms of some of the words.",
    hintBn:
      "Fill in the blanks with the words from the box. You may need to change the forms of some of the words.",
    marks: 5,
    defaultLang: "en",
  },

  ssc_substitution_table: {
    hintBn:
      "Make five sentences using  of sentences from each column of the table below.",
    hintEn:
      "Make five sentences using  of sentences from each column of the table below.",
    marks: 5,
    defaultLang: "en",
  },
  rochona: {
    hintEn: "নিচের বিষয়ে প্রবন্ধ রচনা কর :",
    hintBn: "নিচের বিষয়ে প্রবন্ধ রচনা কর :",
    marks: 15,
  },

  potro_rochona: {
    hintBn: "পত্র রচনা : ",
    hintEn: "পত্র রচনা : ",
    marks: 5,
  },
  ssc_suffix_prefix: {
    hintEn:
      "Complete the following passage adding suffixes, prefixes or the both to the root words give in the parenthesis:",
    hintBn:
      "Complete the following passage adding suffixes, prefixes or the both to the root words give in the parenthesis:",
    marks: 5,
    defaultLang: "en",
  },
  sarangsho: {
    hintBn: "সারাংশ/সারমর্ম লেখ :",
    hintEn: "সারাংশ/সারমর্ম লেখ :",
    marks: 5,
  },

  ssc_connectors: {
    hintBn: "Complete the passage using suitable connectors.",
    hintEn: "Complete the passage using suitable connectors.",
    marks: 5,
    defaultLang: "en",
  },

  ssc_tag_question: {
    hintBn: "Make tag question of these statements:",
    hintEn: "Make tag question of these statements:",
    marks: 5,
    defaultLang: "en",
  },
  arthik_biboroni: {
    hintBn: "আর্থিক বিবরণী প্রস্তুত কর: ",
    hintEn: "আর্থিক বিবরণী প্রস্তুত কর: ",
    marks: 20,
  },

  ssc_gap_filling: {
    hintBn:
      "Fill in the blanks with the words from the box. You may need to change the forms of some of the words where necessary.",
    hintEn:
      "Fill in the blanks with the words from the box. You may need to change the forms of some of the words where necessary.",
    marks: 10,
    defaultLang: "en",
  },

  ssc_ques_and_ans_from_poems: {
    hintEn: "Read the poems carefully and answer the following questions.",
    hintBn: "Read the poems carefully and answer the following questions.",
    marks: 2,
    defaultLang: "en",
  },
  onudhabonn_dokkhota: {
    hintBn: "অনুধাবন দক্ষতা / অনুচ্ছেদ রচনা করো :",
    hintEn: "অনুধাবন দক্ষতা / অনুচ্ছেদ রচনা করো :",
    marks: 5,
  },
  protibedon: {
    hintBn: "নিচের বিষয়ে প্রতিবেদন রচনা কর :",
    hintEn: "নিচের বিষয়ে প্রতিবেদন রচনা কর :",
    marks: 10,
  },
  onudhabon: {
    hintBn: "অনুধাবন দক্ষতা / অনুচ্ছেদ রচনা করো :",
    hintEn: "অনুধাবন দক্ষতা / অনুচ্ছেদ রচনা করো :",
    marks: 5,
  },

  vabshomprosaron: {
    hintBn: "ভাব-সমপ্রসারণ কর :",
    hintEn: "ভাব-সমপ্রসারণ কর :",
    marks: 5,
  },
  onubad: {
    hintBn: "অনুবাদ কর :",
    hintEn: "অনুবাদ কর :",
    marks: 10,
  },
  ssc_rochona: {
    hintBn: "নিচের বিষয়ে প্রবন্ধ রচনা কর :",
    hintEn: "নিচের বিষয়ে প্রবন্ধ রচনা কর :",
    marks: 20,
  },
};

export function getDefaultQuestionHeading(
  type: string,
  questionCount: number,
  marksPerQuestion: number,
): string {
  const typeInfo = questionTypeMap[type];
  const heading = typeInfo?.hintBn || type.split("_").join(" ");
  if (!typeInfo) {
    console.log("typeInfo", typeInfo, "for type", type);
  }
  const isDefaultEnglish = typeInfo?.defaultLang === "en";

  const totalMarks = questionCount * marksPerQuestion;
  return `
    <p>
      ${heading}
      ${
        totalMarks > 0
          ? `<span style="float: right;">
        ${isDefaultEnglish ? marksPerQuestion : toBnDigits(marksPerQuestion)} × ${isDefaultEnglish ? questionCount : toBnDigits(questionCount)} = ${isDefaultEnglish ? totalMarks : toBnDigits(totalMarks)}
      </span>`
          : ""
      }
    </p>
  `;
}

const ORDERED_QUESTION_TYPES = [
  // general
  "mcq",
  "short",
  "cq",

  // ENGLISH 2ND
  "ssc_gap_filling", //2nd: 1
  "ssc_substitution_table", // 2nd: 2
  "ssc_right_form_of_verbs", // 2nd: 3
  "ssc_changing_sentence", // 2nd: 4
  "ssc_tag_question", // 2nd: 5
  "ssc_suffix_prefix", // 2nd: 6
  "ssc_preposition", // 2nd: 7
  "ssc_connectors", // 2nd: 8
  "ssc_punctuation", // 2nd: 9
  // part-b composition
  "ssc_paragraph", // 2nd: 10
  "ssc_letter", // 2nd: 11
  "ssc_short_composition", // 2nd: 12

  // SSC ENGLISH 1ST
  "ssc_seen_passage_1st",
  "seen_passage_1st",
  "mcq_english", // 1st: 1
  "answer_questions", // 1st: 2
  "ssc_gap_filling_1st", // 1st: 3
  "ssc_unseen_passage", // 1st
  "information_transfer", // 1st: 4
  "seen_passage_2nd",
  "gap_filling_1st",
  "vocabulary",
  "unseen_passage",
  "true_false",
  "summary",
  "matching",
  "rearrange",
  "substitution_table",
  "right_form_of_verbs",
  "changing_sentence",
  "punctuation",
  "letter",
  "short_composition",
  "ssc_completing_stories",
  "ssc_matching",
  "ssc_sarangsho",
  "ssc_ques_and_ans_from_stories",

  "indentifying_parts_of_speech",
  "ssc_rearrange",
  "ans_ques_from_poems",
  "completing_stories",
  "paragraph_writing",
  // bangla 2nd ssc

  "bornona_mulok",
  "ssc_vabshomprosaron",
  "onudcched_rochona",

  "dialogue",
  "narration",
  "gap_filling",
  "rochona",
  "potro",
  "potro_rochona",
  "sarangsho",
  "arthik_biboroni",
  "ssc_ques_and_ans_from_poems",
  "onudhabonn_dokkhota",
  "protibedon",
  "onudhabon",
  "vabshomprosaron",
  "onubad",
  "ssc_rochona",
] as const;

// const ORDERED_QUESTION_TYPES: string[] = [];
export function getDefaultSectionOrder(availableTypes: string[]): string[] {
  const rank = new Map(
    ORDERED_QUESTION_TYPES.map((type, index) => [type, index]),
  );

  return [...availableTypes].sort((a, b) => {
    const rankA = rank.get(a as any) ?? Infinity;
    const rankB = rank.get(b as any) ?? Infinity;

    return rankA - rankB;
  });
}
// export function getDefaultSectionOrder(availableTypes: string[]): string[] {
//   const desiredOrder = Object.keys(questionTypeMap);
//   const rank = new Map(desiredOrder.map((type, i) => [type, i]));
//   return [...availableTypes].sort((a, b) => {
//     const ra = rank.has(a) ? rank.get(a)! : Infinity;
//     const rb = rank.has(b) ? rank.get(b)! : Infinity;
//     return ra - rb;
//   });
// }

export const questionLevelMap: Record<QuestionLevel, string> = {
  knowledge: "জ্ঞান",
  application: "প্রয়োগ",
  skills: "দক্ষতা",
  comprehension: "অনুধাবন",
};
