import axios from 'axios';
import html2pdf from 'html2pdf.js';
import {
  BookOpen,
  Brain,
  Clock,
  Code,
  Download,
  MessageSquare,
  Target,
  PenTool as Tool,
} from 'lucide-react';
import { useRef, useState } from 'react';

const Roadmap = () => {
  const [step, setStep] = useState(1);
  const roadmapRef = useRef(null);
  const [formData, setFormData] = useState({
    course: '',
    goals: {
      primaryGoal: '',
      specificArea: '',
    },
    experience: {
      description: '',
      coursesCompleted: 0,
    },
    timeCommitment: {
      hoursPerWeek: '2-5',
      pace: 'relaxed',
    },
    preferences: {
      learningStyle: 'interactive',
      difficulty: 'fundamentals',
    },
    tools: '',
    feedback: '',
  });

  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/roadmap/generate',
        {
          userId: 'anonymous',
          ...formData,
        },
      );
      setGeneratedRoadmap(response.data.roadmap.generatedContent);
      setSuccessMessage('Your learning roadmap has been successfully created!');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = roadmapRef.current;
    const opt = {
      margin: 1,
      filename: 'my-learning-roadmap.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  const StepIcon = ({ step }) => {
    const icons = {
      1: <Target className="w-6 h-6" />,
      2: <BookOpen className="w-6 h-6" />,
      3: <Clock className="w-6 h-6" />,
      4: <Brain className="w-6 h-6" />,
      5: <Code className="w-6 h-6" />,
      6: <Tool className="w-6 h-6" />,
      7: <MessageSquare className="w-6 h-6" />,
    };
    return icons[step] || null;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#FFFDF7] to-[#FFF9E6]">
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: '0px' }}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFFDF7] border-b border-amber-100 py-8 px-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-amber-900 mb-3">
              University Course Excellence Roadmap
            </h1>
            <p className="text-amber-800 leading-relaxed">
              Create a personalized learning plan to master your chosen
              university course
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {successMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-lg text-center shadow-sm">
              <p className="font-semibold text-xl">{successMessage}</p>
            </div>
          )}

          {generatedRoadmap ? (
            <div className="bg-white rounded-lg shadow-sm p-8" ref={roadmapRef}>
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">
                Generated Roadmap
              </h2>
              <div style={{ whiteSpace: 'pre-line' }}>{generatedRoadmap}</div>
              <div className="mt-6">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Download className="w-6 h-6 mr-2" /> Download as PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(number => (
                      <div
                        key={number}
                        className={`flex flex-col items-center ${
                          number <= step ? 'text-amber-600' : 'text-gray-400'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                            number <= step ? 'bg-amber-100' : 'bg-gray-100'
                          }`}
                        >
                          <StepIcon step={number} />
                        </div>
                        <span className="text-sm">Step {number}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 bg-amber-100 rounded-full">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${(step / 7) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Step Forms */}
                {/* Step 1: Course Selection */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Target className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-amber-900">
                        Select Your Course
                      </h2>
                      <select
                        value={formData.course}
                        onChange={e =>
                          setFormData({ ...formData, course: e.target.value })
                        }
                        className="w-full p-3 border border-amber-200 rounded-lg mt-1 focus:ring-amber-500 focus:border-amber-500"
                        required
                      >
                        <option value="">Choose your university course</option>
                        <option value="Artificial Intelligence">
                          Artificial Intelligence
                        </option>
                        <option value="Business Management">
                          Business Management
                        </option>
                        <option value="Data Science">Data Science</option>
                        <option value="Software Engineering">
                          Software Engineering
                        </option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ... (Include all the other steps as you already have them) ... */}

                {/* Navigation Controls */}
                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="flex items-center px-6 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      ← Previous
                    </button>
                  )}

                  {/* Step 2: Learning Goals */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <BookOpen className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-amber-900">
                          Learning Objectives
                        </h2>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-amber-800">
                              Primary Goal:
                            </span>
                            <select
                              value={formData.goals.primaryGoal}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  goals: {
                                    ...formData.goals,
                                    primaryGoal: e.target.value,
                                  },
                                })
                              }
                              className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                              required
                            >
                              <option value="">Select main objective</option>
                              <option value="Academic Excellence">
                                Academic Excellence
                              </option>
                              <option value="Career Preparation">
                                Career Preparation
                              </option>
                              <option value="Research Focus">
                                Research Focus
                              </option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-amber-800">
                              Specific Focus Area:
                            </span>
                            <input
                              type="text"
                              value={formData.goals.specificArea}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  goals: {
                                    ...formData.goals,
                                    specificArea: e.target.value,
                                  },
                                })
                              }
                              className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                              placeholder="e.g., Neural Networks, Financial Analysis"
                              required
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Current Experience */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Clock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-amber-900">
                          Current Knowledge Level
                        </h2>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-amber-800">
                              Experience Level:
                            </span>
                            <select
                              value={formData.experience.description}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  experience: {
                                    ...formData.experience,
                                    description: e.target.value,
                                  },
                                })
                              }
                              className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                              required
                            >
                              <option value="">
                                Select your current level
                              </option>
                              <option value="Beginner">
                                Beginner (0-1 courses completed)
                              </option>
                              <option value="Intermediate">
                                Intermediate (2-3 courses completed)
                              </option>
                              <option value="Advanced">
                                Advanced (4+ courses completed)
                              </option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-amber-800">
                              Related Courses Completed:
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={formData.experience.coursesCompleted}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  experience: {
                                    ...formData.experience,
                                    coursesCompleted: e.target.value,
                                  },
                                })
                              }
                              className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                              placeholder="Number of relevant courses taken"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Time Commitment */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Brain className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-amber-900">
                          Study Plan Configuration
                        </h2>
                        <div className="grid grid-cols-2 gap-6 mt-6">
                          <div className="space-y-2">
                            <label className="block">
                              <span className="text-amber-800">
                                Weekly Study Hours:
                              </span>
                              <select
                                value={formData.timeCommitment.hoursPerWeek}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    timeCommitment: {
                                      ...formData.timeCommitment,
                                      hoursPerWeek: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                                required
                              >
                                <option value="2-5">2-5 hours</option>
                                <option value="5-10">5-10 hours</option>
                                <option value="10-15">10-15 hours</option>
                                <option value="15+">15+ hours</option>
                              </select>
                            </label>
                          </div>
                          <div className="space-y-2">
                            <label className="block">
                              <span className="text-amber-800">
                                Learning Pace:
                              </span>
                              <select
                                value={formData.timeCommitment.pace}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    timeCommitment: {
                                      ...formData.timeCommitment,
                                      pace: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                                required
                              >
                                <option value="relaxed">
                                  Relaxed (Long-term focus)
                                </option>
                                <option value="moderate">
                                  Moderate (Balanced pace)
                                </option>
                                <option value="intensive">
                                  Intensive (Fast-track learning)
                                </option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Learning Preferences */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Code className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-amber-900">
                          Learning Preferences
                        </h2>
                        <div className="grid grid-cols-2 gap-6 mt-6">
                          <div className="space-y-2">
                            <label className="block">
                              <span className="text-amber-800">
                                Learning Style:
                              </span>
                              <select
                                value={formData.preferences.learningStyle}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    preferences: {
                                      ...formData.preferences,
                                      learningStyle: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                                required
                              >
                                <option value="interactive">
                                  Interactive (Labs/Projects)
                                </option>
                                <option value="theoretical">
                                  Theoretical (Lectures/Reading)
                                </option>
                                <option value="mixed">Mixed Approach</option>
                              </select>
                            </label>
                          </div>
                          <div className="space-y-2">
                            <label className="block">
                              <span className="text-amber-800">
                                Difficulty Level:
                              </span>
                              <select
                                value={formData.preferences.difficulty}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    preferences: {
                                      ...formData.preferences,
                                      difficulty: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                                required
                              >
                                <option value="fundamentals">
                                  Core Fundamentals
                                </option>
                                <option value="intermediate">
                                  Intermediate Concepts
                                </option>
                                <option value="advanced">
                                  Advanced Topics
                                </option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Tools & Resources */}
                  {step === 6 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Tool className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-amber-900">
                          Tools & Resources
                        </h2>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-amber-800">
                              Preferred Tools/Software:
                            </span>
                            <input
                              type="text"
                              value={formData.tools}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  tools: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                              placeholder="e.g., Python, Tableau, TensorFlow"
                            />
                          </label>
                          <label className="block">
                            <span className="text-amber-800">
                              University Resources Available:
                            </span>
                            <select
                              className="w-full p-3 border border-amber-200 rounded-lg mt-1"
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  universityResources: e.target.value,
                                })
                              }
                            >
                              <option value="standard">
                                Standard Library Access
                              </option>
                              <option value="premium">
                                Premium Software Licenses
                              </option>
                              <option value="research">
                                Research Lab Access
                              </option>
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {step < 7 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors ml-auto"
                      disabled={
                        (step === 1 && !formData.course) ||
                        (step === 2 && !formData.goals.primaryGoal) ||
                        (step === 3 && !formData.experience.description)
                      }
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex items-center px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors ml-auto"
                      disabled={loading}
                    >
                      {loading
                        ? 'Generating Roadmap...'
                        : 'Create My Learning Plan'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
