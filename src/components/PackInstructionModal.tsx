import React, { useState } from 'react';
import { X, Copy, Check, Info, Sparkles, BookOpen } from 'lucide-react';

interface PackInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lvl1_sentences' | 'lvl2_options' | 'import_full';
}

export const PackInstructionModal: React.FC<PackInstructionModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getInstructions = () => {
    if (type === 'lvl2_options') {
      return {
        title: 'Level II AI Generation Prompt',
        subtitle: 'Copy & Paste into ChatGPT, Gemini, or Claude to get Level II Word Packs',
        promptText: `Please generate a Level II Vocabulary Options Pack for the following words in the exact format below. Do NOT use markdown code blocks, bold headers, or conversational intros. Output 1 word per line:

Format Option A (Semicolon-Separated 5 Options):
ID | Option 1 (Exact Meaning) ; Option 2 (Distractor) ; Option 3 (Distractor) ; Option 4 (Distractor) ; Option 5 (Distractor)

Format Option B (Pipe-Separated 7 Fields):
id|word|definition|distractor1|distractor2|distractor3|distractor4

Rules to prevent word disqualification during load:
1. ID or Word MUST match an existing word ID or Word Name in your deck (e.g. CAT-101 or Ubiquitous).
2. Option 1 / Definition MUST be the exact, accurate meaning of the word.
3. Options 2 to 5 / Distractors 1 to 4 MUST be 4 plausible, close distractor definitions with subtle semantic distortions.
4. Semicolons ';' must separate the options in Option A.

Sample Output (Format A):
CAT-101 | Present, appearing, or found everywhere ; Existing only in rare localized environments ; Existing exclusively in academic literature ; Occurring only during specific seasonal cycles ; Found temporarily in tropical climates
CAT-102 | To become less intense or widespread ; To rapidly escalate under external pressure ; To completely eradicate or eliminate ; To hesitate briefly before acting ; To duplicate precisely in structural form

Sample Output (Format B):
VOC000001|abate|To become less intense or widespread|To intensify rapidly under external pressure|To completely eradicate or annihilate|To hesitate briefly before taking action|To duplicate precisely in structural form`
      };
    }

    if (type === 'lvl1_sentences') {
      return {
        title: 'Level I Sentence Pack AI Prompt',
        subtitle: 'Copy & Paste into ChatGPT, Gemini, or Claude to get 6-Sentence Usage Packs',
        promptText: `Please generate a Level I Vocabulary Sentence Pack in the exact pipe-delimited format below. Do NOT use markdown code blocks, bold headers, or conversational intros. Output 1 word per line:

Header / Format:
id|word|sector|definition|example_usage|s1|s1_true|s2|s2_true|s3|s3_true|s4|s4_true|s5|s5_true|s6|s6_true

Rules to prevent word disqualification during load:
1. Exactly 17 pipe-separated (|) fields per row.
2. id: Unique word identifier (e.g. CAT-101).
3. word: Target vocabulary word.
4. sector: One of High-Frequency, Reading Comprehension, Philosophical, Literary, Tone & Attitude, Legal & Political, or custom sector name.
5. definition: Clear definition of the word.
6. example_usage: Standard example sentence.
7. s1 to s6: 6 practice sentences where the target word or a blank (_) is tested in context.
8. s1_true to s6_true: TRUE if the sentence correctly uses the word in context; FALSE if it uses the word incorrectly or misleadingly.

Sample Output:
CAT-101|Ubiquitous|High-Frequency|Present, appearing, or found everywhere|Smartphones are ubiquitous in modern life.|Smartphones have become ubiquitous across all age groups.|TRUE|The ubiquitous presence of social media influences daily habits.|TRUE|The remote island remained completely ubiquitous to tourists.|FALSE|His ubiquitous refusal to participate surprised everyone.|FALSE|Plastic pollution has become ubiquitous in ocean ecosystems.|TRUE|She enjoyed a quiet, ubiquitous moment of solitude in the garden.|FALSE`
      };
    }

    // Default: full import
    return {
      title: 'Vocabulary Import AI Prompt',
      subtitle: 'Copy & Paste into ChatGPT, Gemini, or Claude to create new Vocabulary Packs',
      promptText: `Please generate a complete vocabulary pack in the exact pipe-delimited format below. Do NOT use markdown code blocks, bold text, or conversational intros. Output 1 word per line:

Header / Format:
id|word|sector|definition|example_usage|s1|s1_true|s2|s2_true|s3|s3_true|s4|s4_true|s5|s5_true|s6|s6_true

Rules to prevent word disqualification during load:
1. Each line must have exactly 17 pipe-separated (|) fields.
2. id must be unique (e.g. CAT-001, VOC000001).
3. sector must be valid (e.g., High-Frequency, Reading Comprehension, Philosophical, Literary).
4. s1_true through s6_true must strictly be TRUE or FALSE.

Sample Output:
VOC000001|abate|Economics|To become less intense|Inflation began to abate.|Inflation began to abate after policy changes.|TRUE|Public anger abated after the inquiry.|TRUE|The abate professor delivered a lecture.|FALSE|Researchers abated the hypothesis.|FALSE|The reforms worsened inflation and thus abated prices.|FALSE|The crisis abated into greater intensity.|FALSE`
    };
  };

  const info = getInstructions();

  const handleCopy = () => {
    navigator.clipboard.writeText(info.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isLvl2 = type === 'lvl2_options';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className={`bg-white dark:bg-slate-900 border-3 border-black dark:border-white max-w-lg w-full p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] space-y-4 max-h-[90vh] flex flex-col ${
        isLvl2 ? 'dark:shadow-[6px_6px_0px_0px_#FF2E93]' : 'dark:shadow-[6px_6px_0px_0px_#A855F7]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b-2.5 border-black dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border-2 border-black text-white ${isLvl2 ? 'bg-[#FF2E93]' : 'bg-[#A855F7]'}`}>
              <Info className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-900 dark:text-slate-200">
                AI Prompt Instructions
              </span>
              <h2 className="text-lg sm:text-xl font-black font-display uppercase text-slate-900 dark:text-white leading-tight">
                {info.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-slate-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
          {info.subtitle}
        </p>

        {/* Copyable Instruction Text Area / Code Box */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          <textarea
            readOnly
            value={info.promptText}
            className="w-full h-64 bg-slate-900 text-emerald-400 border-2 border-black rounded-xl p-3 font-mono text-[11px] leading-relaxed focus:outline-none resize-none font-bold"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-black dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Paste directly into ChatGPT / Gemini
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className={`px-5 py-2.5 font-black font-display text-xs uppercase rounded-xl border-2.5 border-black flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
              copied
                ? 'bg-[#4ADE80] text-black'
                : isLvl2
                ? 'bg-[#FF2E93] hover:bg-[#E0267D] text-white'
                : 'bg-[#A855F7] hover:bg-[#9333EA] text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Copied Prompt!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.5]" />
                Copy AI Instructions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
