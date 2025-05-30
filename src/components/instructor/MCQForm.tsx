import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

type MCQOption = {
  text: string;
  isCorrect: boolean;
};

type MCQ = {
  question: string;
  options: MCQOption[];
};

interface MCQFormProps {
  mcqs: MCQ[];
  onMCQChange: (mcqs: MCQ[]) => void;
  dayIndex: number;
}

const MCQForm: React.FC<MCQFormProps> = ({ mcqs, onMCQChange, dayIndex }) => {
  const handleQuestionChange = (questionIndex: number, newQuestion: string) => {
    const updatedMCQs = [...mcqs];
    updatedMCQs[questionIndex] = {
      ...updatedMCQs[questionIndex],
      question: newQuestion,
    };
    onMCQChange(updatedMCQs);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, newText: string) => {
    const updatedMCQs = [...mcqs];
    updatedMCQs[questionIndex].options[optionIndex].text = newText;
    onMCQChange(updatedMCQs);
  };

  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
    const updatedMCQs = [...mcqs];
    updatedMCQs[questionIndex].options = updatedMCQs[questionIndex].options.map((option, idx) => ({
      ...option,
      isCorrect: idx === optionIndex,
    }));
    onMCQChange(updatedMCQs);
  };

  const handleAddQuestion = () => {
    const newMCQ: MCQ = {
      question: '',
      options: Array(4).fill(null).map(() => ({ text: '', isCorrect: false })),
    };
    onMCQChange([...mcqs, newMCQ]);
  };

  const handleDeleteQuestion = (questionIndex: number) => {
    const updatedMCQs = mcqs.filter((_, index) => index !== questionIndex);
    onMCQChange(updatedMCQs);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">MCQ Questions</Label>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddQuestion}
        >
          Add Question
        </Button>
      </div>

      {mcqs.map((mcq, questionIndex) => (
        <div key={questionIndex} className="p-4 border rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Question {questionIndex + 1}</Label>
              <Input
                value={mcq.question}
                onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                placeholder="Enter your question"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteQuestion(questionIndex)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="block">Options</Label>
            {mcq.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-3">
                <Checkbox
                  checked={option.isCorrect}
                  onCheckedChange={() => handleCorrectOptionChange(questionIndex, optionIndex)}
                />
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {mcqs.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No questions added yet. Click "Add Question" to start.
        </div>
      )}
    </div>
  );
};

export default MCQForm; 