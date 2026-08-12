import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { QuestionType } from '../types';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  Eye,
  Settings,
  Sparkles,
  Star,
  CheckSquare,
  AlignLeft,
  Calendar,
  Hash,
} from 'lucide-react';

interface LocalQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  isRequired: boolean;
  orderIndex: number;
  options: { label: string; value: string; orderIndex: number }[];
}

export const FormBuilderPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('Customer Feedback Survey');
  const [description, setDescription] = useState('We would love your thoughts on our features and experience.');
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [requireAuth, setRequireAuth] = useState(false);
  const [onePerUser, setOnePerUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState<LocalQuestion[]>([
    {
      id: 'q-1',
      type: 'STAR_RATING',
      title: 'How would you rate your overall experience?',
      description: 'Rate from 1 to 5 stars.',
      isRequired: true,
      orderIndex: 0,
      options: [],
    },
    {
      id: 'q-2',
      type: 'SINGLE_CHOICE',
      title: 'What feature do you use most?',
      description: 'Select one option.',
      isRequired: true,
      orderIndex: 1,
      options: [
        { label: 'Form Builder', value: 'builder', orderIndex: 0 },
        { label: 'Real-time Analytics', value: 'analytics', orderIndex: 1 },
        { label: 'Export Responses', value: 'export', orderIndex: 2 },
      ],
    },
    {
      id: 'q-3',
      type: 'LONG_TEXT',
      title: 'Do you have any feature requests or suggestions?',
      description: 'Optional comments.',
      isRequired: false,
      orderIndex: 2,
      options: [],
    },
  ]);

  const addQuestion = (type: QuestionType) => {
    const newQ: LocalQuestion = {
      id: `q-${Date.now()}`,
      type,
      title: `New ${type.replace('_', ' ')} Question`,
      description: '',
      isRequired: false,
      orderIndex: questions.length,
      options: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN'].includes(type)
        ? [
            { label: 'Option 1', value: 'option-1', orderIndex: 0 },
            { label: 'Option 2', value: 'option-2', orderIndex: 1 },
          ]
        : [],
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((q, idx) => (q.orderIndex = idx));
    setQuestions(updated);
  };

  const updateQuestion = (id: string, key: keyof LocalQuestion, val: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [key]: val } : q)));
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const nextOptIdx = q.options.length;
          return {
            ...q,
            options: [
              ...q.options,
              { label: `Option ${nextOptIdx + 1}`, value: `option-${nextOptIdx + 1}`, orderIndex: nextOptIdx },
            ],
          };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optIndex: number, label: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const opts = [...q.options];
          opts[optIndex] = {
            ...opts[optIndex],
            label,
            value: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          };
          return { ...q, options: opts };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, options: q.options.filter((_, idx) => idx !== optIndex) };
        }
        return q;
      })
    );
  };

  const handleSaveForm = async (publish = false) => {
    if (!title.trim()) {
      alert('Please enter a form title.');
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.post('/forms', {
        organizationId: currentOrg?.id,
        title,
        description,
        allowAnonymous,
        requireAuth,
        onePerUser,
        questions,
      });

      if (res.data.success) {
        const formId = res.data.data.id;
        if (publish) {
          await apiClient.post(`/forms/${formId}/publish`);
        }
        navigate('/forms');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save feedback form.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Builder Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100">Feedback Form Builder</h1>
            <p className="text-xs text-slate-400">Design dynamic questions and custom validation rules</p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-3">
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'editor' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'preview' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            onClick={() => handleSaveForm(false)}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSaveForm(true)}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save & Publish</span>
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="space-y-6">
          {/* Form Settings Box */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100">Form Configuration</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Form Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Form Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/60">
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowAnonymous}
                    onChange={(e) => setAllowAnonymous(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-brand-500 focus:ring-brand-500"
                  />
                  <span>Allow Anonymous Submissions</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireAuth}
                    onChange={(e) => setRequireAuth(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-brand-500 focus:ring-brand-500"
                  />
                  <span>Require User Login</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onePerUser}
                    onChange={(e) => setOnePerUser(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-brand-500 focus:ring-brand-500"
                  />
                  <span>Limit 1 Submission Per User</span>
                </label>
              </div>
            </div>
          </div>

          {/* Question List Editor */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-100">Questions ({questions.length})</h2>

            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 relative group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {q.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Move & Delete Toolbar */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveQuestion(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:bg-slate-800 disabled:opacity-30"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveQuestion(idx, 'down')}
                      disabled={idx === questions.length - 1}
                      className="p-1 rounded text-slate-400 hover:bg-slate-800 disabled:opacity-30"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Inputs */}
                <div className="space-y-3">
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => updateQuestion(q.id, 'title', e.target.value)}
                    placeholder="Enter question title..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="text"
                    value={q.description}
                    onChange={(e) => updateQuestion(q.id, 'description', e.target.value)}
                    placeholder="Optional description / instructions..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Question Options Editor for Choice / Dropdown Types */}
                {['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN'].includes(q.type) && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-400">Options</label>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                        />
                        <button
                          onClick={() => removeOption(q.id, optIdx)}
                          className="p-1 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(q.id)}
                      className="text-xs font-medium text-brand-400 hover:underline flex items-center space-x-1 pt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Option</span>
                    </button>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={(e) => updateQuestion(q.id, 'isRequired', e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-brand-500"
                    />
                    <span>Required Field</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button Selector */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Add Question Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Star Rating', type: 'STAR_RATING', icon: Star },
                { label: 'Rating (1-10)', type: 'RATING', icon: Star },
                { label: 'Single Choice', type: 'SINGLE_CHOICE', icon: CheckSquare },
                { label: 'Multiple Choice', type: 'MULTIPLE_CHOICE', icon: CheckSquare },
                { label: 'Dropdown', type: 'DROPDOWN', icon: AlignLeft },
                { label: 'Short Text', type: 'SHORT_TEXT', icon: AlignLeft },
                { label: 'Long Text', type: 'LONG_TEXT', icon: AlignLeft },
                { label: 'Yes / No', type: 'YES_NO', icon: CheckSquare },
                { label: 'Number', type: 'NUMBER', icon: Hash },
                { label: 'Date', type: 'DATE', icon: Calendar },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => addQuestion(item.type as QuestionType)}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all"
                >
                  <item.icon className="w-4 h-4 text-brand-400" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">{title}</h1>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <label className="block text-sm font-semibold text-slate-100">
                  {idx + 1}. {q.title}{' '}
                  {q.isRequired && <span className="text-red-400">*</span>}
                </label>
                {q.description && <p className="text-xs text-slate-400">{q.description}</p>}

                {q.type === 'STAR_RATING' && (
                  <div className="flex space-x-2 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 text-slate-600 hover:text-amber-400 cursor-pointer" />
                    ))}
                  </div>
                )}

                {q.type === 'SINGLE_CHOICE' && (
                  <div className="space-y-2 pt-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                        <input type="radio" name={q.id} className="text-brand-500" />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'LONG_TEXT' && (
                  <textarea rows={3} placeholder="Your answer..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100" readOnly />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
