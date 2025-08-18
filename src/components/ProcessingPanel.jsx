// import React, { useState, useEffect } from 'react';
// import { Brain, Users, Lightbulb, Mic, Play, Loader, Search, Volume2, Settings, Download } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { process1A as process1AApi, process1B as process1BApi, generateInsights as generateInsightsApi, generatePodcast as generatePodcastApi, searchPDFs as searchPDFsApi, searchRelatedWithInsights as searchRelatedWithInsightsApi, getAvailableVoices as getAvailableVoicesApi, configureTTS as configureTTSApi } from '../services/api';

// const ProcessingPanel = ({ selectedFiles, processingMode, setProcessingMode, onNavigateToPage, searchQuery, setSearchQuery }) => {
//   const [results, setResults] = useState(null);
//   const [insights, setInsights] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [persona, setPersona] = useState('');
//   const [objective, setObjective] = useState('');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [searchInsights, setSearchInsights] = useState(null);
//   const [searchPodcast, setSearchPodcast] = useState(null);
//   const [insightsLoading, setInsightsLoading] = useState(false);
//   const [podcastLoading, setPodcastLoading] = useState(false);
//   const [availableVoices, setAvailableVoices] = useState([]);
//   const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
//   const [speakingRate, setSpeakingRate] = useState(1.0);
//   const [showTTSSettings, setShowTTSSettings] = useState(false);

//   const process1A = async () => {
//     if (selectedFiles.length === 0) {
//       toast.error('Please select a file first');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Call the real backend API
//       const response = await process1AApi(selectedFiles[0].id);

//       if (response.data) {
//         setResults(response.data);
//         toast.success('Heading extraction completed');
//       } else {
//         throw new Error('No data received from server');
//       }
//     } catch (error) {
//       console.error('Error processing document:', error);
//       toast.error(error.response?.data?.error || 'Error processing document');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const process1B = async () => {
//     if (selectedFiles.length === 0 || !persona || !objective) {
//       toast.error('Please select files and fill in persona and objective');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Call the real backend API
//       const fileIds = selectedFiles.map(file => file.id);
//       const response = await process1BApi(fileIds, persona, objective);

//       if (response.data) {
//         setResults(response.data);
//         toast.success('Document intelligence analysis completed');
//       } else {
//         throw new Error('No data received from server');
//       }
//     } catch (error) {
//       console.error('Error processing documents:', error);
//       toast.error(error.response?.data?.error || 'Error processing documents');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateInsights = async () => {
//     if (!results) {
//       toast.error('Process a document first');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Prepare content for insights generation
//       let content = '';
//       if (processingMode === '1a' && results.outline) {
//         content = results.outline.map(item => `${item.level}: ${item.text}`).join('\n');
//       } else if (processingMode === '1b' && Array.isArray(results)) {
//         content = results.map(result => result.best_section).join('\n\n');
//       }

//       // Call the real backend API
//       const response = await generateInsightsApi(content);

//       if (response.data) {
//         setInsights(response.data);
//         toast.success('Insights generated');
//       } else {
//         throw new Error('No insights data received');
//       }
//     } catch (error) {
//       console.error('Error generating insights:', error);
//       toast.error(error.response?.data?.error || 'Error generating insights');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generatePodcast = async () => {
//     if (!results) {
//       toast.error('Process a document first');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Prepare content for podcast generation
//       let content = '';
//       if (processingMode === '1a' && results.outline) {
//         content = results.outline.map(item => `${item.level}: ${item.text}`).join('\n');
//       } else if (processingMode === '1b' && Array.isArray(results)) {
//         content = results.map(result => result.best_section).join('\n\n');
//       }

//       // Call the real backend API
//       const response = await generatePodcastApi(content, insights);

//       if (response.data) {
//         // Create download link for the podcast file
//         const blob = new Blob([response.data], { type: 'text/plain' });
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', 'podcast_script.txt');
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         window.URL.revokeObjectURL(url);

//         toast.success('Podcast script downloaded successfully!');
//       } else {
//         throw new Error('No podcast data received');
//       }
//     } catch (error) {
//       console.error('Error generating podcast:', error);
//       toast.error(error.response?.data?.error || 'Error generating podcast');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const performSearch = async () => {
//     if (selectedFiles.length === 0) {
//       toast.error('Please select files first');
//       return;
//     }

//     if (!searchQuery.trim()) {
//       toast.error('Please enter a search query');
//       return;
//     }

//     setSearchLoading(true);
//     try {
//       const fileIds = selectedFiles.map(file => file.id);

//       // Check if this is a special command for insights or podcast
//       let query = searchQuery;
//       let isInsightsCommand = false;
//       let isPodcastCommand = false;

//       if (searchQuery.includes('[INSIGHTS]')) {
//         query = searchQuery.replace('[INSIGHTS]', '').trim();
//         isInsightsCommand = true;
//       } else if (searchQuery.includes('[PODCAST]')) {
//         query = searchQuery.replace('[PODCAST]', '').trim();
//         isPodcastCommand = true;
//       }

//       if (isInsightsCommand || isPodcastCommand) {
//         // Use the new search-related endpoint for insights and podcast
//         const response = await searchRelatedWithInsightsApi(query, fileIds);

//         if (response.data && response.data.success) {
//           setSearchResults(response.data.related);
//           setSearchInsights(response.data.insight);
//           setSearchPodcast(response.data.podcast);

//           if (isInsightsCommand) {
//             toast.success('Insights generated successfully!');
//           } else if (isPodcastCommand) {
//             toast.success('Podcast script generated successfully!');
//           }
//         } else {
//           throw new Error('No data received');
//         }
//       } else {
//         // Regular search
//         const response = await searchPDFsApi(query, fileIds);

//         if (response.data && response.data.success) {
//           setSearchResults(response.data.results);
//           // Clear previous insights and podcast data
//           setSearchInsights(null);
//           setSearchPodcast(null);
//           toast.success(`Found ${response.data.results.length} related results`);
//         } else {
//           throw new Error('No search results received');
//         }
//       }
//     } catch (error) {
//       console.error('Error performing search:', error);
//       toast.error(error.response?.data?.error || 'Error performing search');
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const generateSearchInsights = async () => {
//     if (!searchResults || !searchQuery.trim()) {
//       toast.error('Please perform a search first');
//       return;
//     }

//     setInsightsLoading(true);
//     try {
//       const fileIds = selectedFiles.map(file => file.id);
//       const response = await searchRelatedWithInsightsApi(searchQuery, fileIds);

//       if (response.data && response.data.success) {
//         setSearchInsights(response.data.insight);
//         toast.success('Insights generated successfully!');
//       } else {
//         throw new Error('No insights data received');
//       }
//     } catch (error) {
//       console.error('Error generating insights:', error);
//       toast.error(error.response?.data?.error || 'Error generating insights');
//     } finally {
//       setInsightsLoading(false);
//     }
//   };

//   const generateSearchPodcast = async () => {
//     if (!searchResults || !searchQuery.trim()) {
//       toast.error('Please perform a search first');
//       return;
//     }

//     setPodcastLoading(true);
//     try {
//       const fileIds = selectedFiles.map(file => file.id);
//       const response = await searchRelatedWithInsightsApi(searchQuery, fileIds);

//       if (response.data && response.data.success) {
//         setSearchPodcast(response.data.podcast);
//         toast.success('Podcast script generated successfully!');
//       } else {
//         throw new Error('No podcast data received');
//       }
//     } catch (error) {
//       console.error('Error generating podcast:', error);
//       toast.error(error.response?.data?.error || 'Error generating podcast');
//     } finally {
//       setPodcastLoading(false);
//     }
//   };

//   // Load available voices on component mount
//   useEffect(() => {
//     const loadVoices = async () => {
//       try {
//         const response = await getAvailableVoicesApi();
//         if (response.data && response.data.success) {
//           setAvailableVoices(response.data.voices);
//         }
//       } catch (error) {
//         console.error('Error loading voices:', error);
//       }
//     };

//     loadVoices();
//   }, []);

//   const handleVoiceChange = async (voice) => {
//     try {
//       setSelectedVoice(voice);
//       await configureTTSApi(voice, speakingRate);
//       toast.success(`Voice changed to ${voice}`);
//     } catch (error) {
//       console.error('Error changing voice:', error);
//       toast.error('Failed to change voice');
//     }
//   };

//   const handleSpeakingRateChange = async (rate) => {
//     try {
//       setSpeakingRate(rate);
//       await configureTTSApi(selectedVoice, rate);
//       toast.success(`Speaking rate changed to ${rate}x`);
//     } catch (error) {
//       console.error('Error changing speaking rate:', error);
//       toast.error('Failed to change speaking rate');
//     }
//   };

//   const downloadAudio = (audioUrl, filename) => {
//     if (audioUrl) {
//       const link = document.createElement('a');
//       link.href = audioUrl;
//       link.download = filename || 'podcast.wav';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       toast.success('Audio download started!');
//     }
//   };

//   const handlePageClick = (pageNumber, fileId = null) => {
//     if (onNavigateToPage) {
//       onNavigateToPage(pageNumber, fileId);
//       if (fileId) {
//         const targetFile = selectedFiles.find(f => f.id === fileId);
//         toast.success(`Navigating to page ${pageNumber} in ${targetFile?.name || 'document'}`);
//       } else {
//         toast.success(`Navigating to page ${pageNumber}`);
//       }
//     }
//   };

//   return (
//     <div className="w-96 bg-white shadow-lg border-l flex flex-col">
//       <div className="p-4 border-b">
//         <h3 className="text-lg font-bold text-gray-800 mb-4">WORKSPACE</h3>

//         <div className="flex gap-2 mb-4">
//           <button
//             onClick={() => setProcessingMode('1a')}
//             className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//               processingMode === '1a'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <Brain size={16} className="inline mr-1" />
//             Extract Headings
//           </button>
//           <button
//             onClick={() => setProcessingMode('1b')}
//             className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//               processingMode === '1b'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <Users size={16} className="inline mr-1" />
//             Persona-based
//           </button>
//         </div>

//         {processingMode === '1b' && (
//           <div className="space-y-3 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Persona
//               </label>
//               <input
//                 type="text"
//                 value={persona}
//                 onChange={(e) => setPersona(e.target.value)}
//                 placeholder="e.g., Software Engineer"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Job to be Done
//               </label>
//               <input
//                 type="text"
//                 value={objective}
//                 onChange={(e) => setObjective(e.target.value)}
//                 placeholder="e.g., Learn about API design"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//               />
//             </div>
//           </div>
//         )}

//         <button
//           onClick={processingMode === '1a' ? process1A : process1B}
//           disabled={loading}
//           className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//         >
//           {loading ? (
//             <>
//               <Loader size={16} className="animate-spin" />
//               Processing...
//             </>
//           ) : (
//             `Run ${processingMode.toUpperCase()}`
//           )}
//         </button>

//         {/* TTS Settings Section */}
//         <div className="mt-6 pt-4 border-t border-gray-200">
//           <div className="flex items-center justify-between mb-3">
//             <h4 className="text-md font-medium text-gray-800 flex items-center gap-2">
//               <Volume2 size={16} className="text-blue-600" />
//               TTS Settings
//             </h4>
//             <button
//               onClick={() => setShowTTSSettings(!showTTSSettings)}
//               className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
//               title="Toggle TTS settings"
//             >
//               <Settings size={14} />
//             </button>
//           </div>

//           {showTTSSettings && (
//             <div className="space-y-3 mb-4 p-3 bg-blue-50 rounded-lg">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Voice
//                 </label>
//                 <select
//                   value={selectedVoice}
//                   onChange={(e) => handleVoiceChange(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                 >
//                   {availableVoices.map((voice) => (
//                     <option key={voice} value={voice}>
//                       {voice.replace('en-US-', '').replace('en-GB-', '').replace('Neural', '')}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Speaking Rate: {speakingRate}x
//                 </label>
//                 <input
//                   type="range"
//                   min="0.5"
//                   max="2.0"
//                   step="0.1"
//                   value={speakingRate}
//                   onChange={(e) => handleSpeakingRateChange(parseFloat(e.target.value))}
//                   className="w-full"
//                 />
//                 <div className="flex justify-between text-xs text-gray-500 mt-1">
//                   <span>Slow</span>
//                   <span>Normal</span>
//                   <span>Fast</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Gemini Search Section */}
//         <div className="mt-6 pt-4 border-t border-gray-200">
//           <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
//             <Search size={16} className="text-purple-600" />
//             Gemini Search
//           </h4>

//           {selectedFiles.length === 0 ? (
//             <div className="text-center py-4 text-gray-500">
//               <Search size={24} className="mx-auto mb-2 text-gray-300" />
//               <p className="text-sm">Select PDF files to enable search</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {searchQuery && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
//                   <p className="text-xs text-blue-600 mb-1">Selected text from PDF:</p>
//                   <p className="text-sm text-blue-800 font-medium truncate" title={searchQuery}>
//                     "{searchQuery.length > 50 ? searchQuery.substring(0, 50) + '...' : searchQuery}"
//                   </p>
//                 </div>
//               )}

//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Search Query
//                   </label>
//                   {searchQuery && (
//                     <button
//                       onClick={() => setSearchQuery('')}
//                       className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
//                       title="Clear search query"
//                     >
//                       Clear
//                     </button>
//                   )}
//                 </div>
//                 <textarea
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Enter text to search for in your PDFs..."
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
//                   rows={3}
//                 />
//               </div>

//               <button
//                 onClick={performSearch}
//                 disabled={searchLoading || !searchQuery.trim()}
//                 className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//               >
//                 {searchLoading ? (
//                   <>
//                     <Loader size={16} className="animate-spin" />
//                     Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Search size={16} />
//                     Search PDFs
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4">
//         {results && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">Results</h4>
//             <div className="bg-gray-50 rounded-lg p-3 text-sm max-h-64 overflow-y-auto">
//               {processingMode === '1a' ? (
//                 <div>
//                   <h5 className="font-medium mb-2 text-gray-900">{results.title}</h5>
//                   <div className="space-y-1">
//                     {results.outline?.map((item, index) => (
//                       <div key={index} className={`${
//                         item.level === 'H1' ? 'pl-0 font-medium' :
//                         item.level === 'H2' ? 'pl-4' : 'pl-8'
//                       } text-gray-900`}>
//                         <span className="text-gray-600">{item.level}:</span> {item.text}
//                         <button
//                           onClick={() => handlePageClick(item.page + 1)}
//                           className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2 transition-colors"
//                           title={`Go to page ${item.page + 1}`}
//                         >
//                           (Page {item.page + 1})
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {results.map((result, index) => (
//                     <div key={index} className="border-l-4 border-blue-500 pl-3">
//                       <div className="font-medium text-gray-900">{result.file}</div>
//                       <div className="text-gray-600 text-xs mb-1">Relevance: {(result.score * 100).toFixed(0)}%</div>
//                       <div className="text-sm text-gray-900">{result.best_section}</div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {results && (
//           <div className="space-y-3 mb-6">
//             <button
//               onClick={generateInsights}
//               disabled={loading}
//               className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
//             >
//               {loading ? <Loader size={16} className="animate-spin" /> : <Lightbulb size={16} />}
//               Generate Insights
//             </button>

//             <button
//               onClick={generatePodcast}
//               disabled={loading}
//               className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
//             >
//               {loading ? <Loader size={16} className="animate-spin" /> : <Mic size={16} />}
//               Generate Podcast
//             </button>
//           </div>
//         )}

//         {insights && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">AI Insights</h4>
//             <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-3 max-h-64 overflow-y-auto">
//               {insights.key_insights && (
//                 <div>
//                   <h5 className="font-medium text-blue-600 mb-2">💡 Key Insights</h5>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     {insights.key_insights.map((insight, index) => (
//                       <li key={index}>{insight}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {insights.did_you_know && (
//                 <div>
//                   <h5 className="font-medium text-green-600 mb-2">🤔 Did You Know?</h5>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     {insights.did_you_know.map((fact, index) => (
//                       <li key={index}>{fact}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {insights.connections && (
//                 <div>
//                   <h5 className="font-medium text-purple-600 mb-2">🔗 Connections</h5>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     {insights.connections.map((connection, index) => (
//                       <li key={index}>{connection}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Search Results */}
//         {searchResults && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">🔍 Search Results</h4>
//             <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-3 max-h-64 overflow-y-auto">
//               {searchResults.map((result, index) => (
//                 <div key={index} className="border-l-4 border-purple-500 pl-3">
//                   <div className="font-medium text-gray-900">{result.pdf}</div>
//                   <div className="text-gray-600 text-xs mb-1">
//                     Page {result.page} • Score: {(result.score * 100).toFixed(1)}%
//                   </div>
//                   <div className="text-sm text-gray-700 mb-2">{result.snippet}</div>
//                   <button
//                     onClick={() => handlePageClick(result.page, result.file_id)}
//                     className="text-xs text-purple-600 hover:text-purple-800 hover:underline transition-colors"
//                     title={`Go to page ${result.page} in ${result.file_name || result.pdf}`}
//                   >
//                     📄 Go to Page {result.page} in {result.file_name || result.pdf}
//                   </button>
//                 </div>
//               ))}
//             </div>

//             {/* Search Action Buttons */}
//             <div className="mt-4 space-y-2">
//               <button
//                 onClick={generateSearchInsights}
//                 disabled={insightsLoading}
//                 className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
//               >
//                 {insightsLoading ? (
//                   <>
//                     <Loader size={16} className="animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Lightbulb size={16} />
//                     Generate Insights
//                   </>
//                 )}
//               </button>

//               <button
//                 onClick={generateSearchPodcast}
//                 disabled={podcastLoading}
//                 className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
//               >
//                 {podcastLoading ? (
//                   <>
//                     <Loader size={16} className="animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Mic size={16} />
//                     Generate Podcast
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Search Insights */}
//         {searchInsights && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">💡 Search Insights</h4>
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
//               <div className="text-yellow-800">
//                 {searchInsights}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Search Podcast */}
//         {searchPodcast && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">🎙️ Podcast Script</h4>
//             <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
//               <div className="text-green-800 mb-3 whitespace-pre-wrap">
//                 {searchPodcast.script}
//               </div>

//               {/* Audio Controls */}
//               {searchPodcast.audio_url ? (
//                 <div className="mt-3 space-y-3">
//                   <div className="bg-white rounded-lg p-3 border">
//                     <audio controls className="w-full">
//                       <source src={searchPodcast.audio_url} type="audio/wav" />
//                       Your browser does not support the audio element.
//                     </audio>
//                   </div>

//                   {/* Audio Metadata */}
//                   <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
//                     <div>
//                       <span className="font-medium">Duration:</span> {searchPodcast.duration_estimate} min
//                     </div>
//                     <div>
//                       <span className="font-medium">File Size:</span> {(searchPodcast.file_size / 1024).toFixed(1)} KB
//                     </div>
//                     <div>
//                       <span className="font-medium">Script Length:</span> {searchPodcast.script_length} chars
//                     </div>
//                     <div>
//                       <span className="font-medium">Voice:</span> {selectedVoice.replace('en-US-', '').replace('en-GB-', '').replace('Neural', '')}
//                     </div>
//                   </div>

//                   {/* Download Button */}
//                   <button
//                     onClick={() => downloadAudio(searchPodcast.audio_url, searchPodcast.audio_filename)}
//                     className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
//                   >
//                     <Download size={14} />
//                     Download Audio
//                   </button>
//                 </div>
//               ) : (
//                 <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
//                   🎵 Audio generation failed. Please try again.
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {selectedFiles.length > 0 && (
//           <div className="bg-blue-50 rounded-lg p-3">
//             <h5 className="font-medium text-blue-800 mb-2">Selected Files</h5>
//             <div className="space-y-1">
//               {selectedFiles.map((file, index) => (
//                 <div key={index} className="text-sm text-blue-700">
//                   📄 {file.name}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProcessingPanel;

/////////////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect } from 'react';
// import { Brain, Users, Lightbulb, Mic, Play, Loader, Search, Volume2, Settings, Download } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { process1A as process1AApi, process1B as process1BApi, generateInsights as generateInsightsApi, generatePodcast as generatePodcastApi, searchPDFs as searchPDFsApi, searchRelatedWithInsights as searchRelatedWithInsightsApi, getAvailableVoices as getAvailableVoicesApi, configureTTS as configureTTSApi } from '../services/api';
// import { motion, AnimatePresence } from "framer-motion";

// const ProcessingPanel = ({ selectedFiles, processingMode, setProcessingMode, onNavigateToPage, searchQuery, setSearchQuery }) => {

//   const [results, setResults] = useState(null);
//   const [insights, setInsights] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [persona, setPersona] = useState('');
//   const [objective, setObjective] = useState('');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [searchInsights, setSearchInsights] = useState(null);
//   const [searchPodcast, setSearchPodcast] = useState(null);
//   const [insightsLoading, setInsightsLoading] = useState(false);
//   const [podcastLoading, setPodcastLoading] = useState(false);
//   const [availableVoices, setAvailableVoices] = useState([]);
//   const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
//   const [speakingRate, setSpeakingRate] = useState(1.0);
//   const [showTTSSettings, setShowTTSSettings] = useState(false);

//   const process1A = async () => {
//     if (selectedFiles.length === 0) {
//       toast.error('Please select a file first');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Call the real backend API
//       const response = await process1AApi(selectedFiles[0].id);

//       if (response.data) {
//         setResults(response.data);
//         toast.success('Heading extraction completed');
//       } else {
//         throw new Error('No data received from server');
//       }
//     } catch (error) {
//       console.error('Error processing document:', error);
//       toast.error(error.response?.data?.error || 'Error processing document');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const process1B = async () => {
//     if (selectedFiles.length === 0 || !persona || !objective) {
//       toast.error('Please select files and fill in persona and objective');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Call the real backend API
//       const fileIds = selectedFiles.map(file => file.id);
//       const response = await process1BApi(fileIds, persona, objective);

//       if (response.data) {
//         setResults(response.data);
//         toast.success('Document intelligence analysis completed');
//       } else {
//         throw new Error('No data received from server');
//       }
//     } catch (error) {
//       console.error('Error processing documents:', error);
//       toast.error(error.response?.data?.error || 'Error processing documents');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateInsights = async () => {
//     if (!results) {
//       toast.error('Process a document first');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Prepare content for insights generation
//       let content = '';
//       if (processingMode === '1a' && results.outline) {
//         content = results.outline.map(item => `${item.level}: ${item.text}`).join('\n');
//       } else if (processingMode === '1b' && Array.isArray(results)) {
//         content = results.map(result => result.best_section).join('\n\n');
//       }

//       // Call the real backend API
//       const response = await generateInsightsApi(content);

//       if (response.data) {
//         setInsights(response.data);
//         toast.success('Insights generated');
//       } else {
//         throw new Error('No insights data received');
//       }
//     } catch (error) {
//       console.error('Error generating insights:', error);
//       toast.error(error.response?.data?.error || 'Error generating insights');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generatePodcast = async () => {
//     if (!results) {
//       toast.error('Process a document first');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Prepare content for podcast generation
//       let content = '';
//       if (processingMode === '1a' && results.outline) {
//         content = results.outline.map(item => `${item.level}: ${item.text}`).join('\n');
//       } else if (processingMode === '1b' && Array.isArray(results)) {
//         content = results.map(result => result.best_section).join('\n\n');
//       }

//       // Call the real backend API
//       const response = await generatePodcastApi(content, insights);

//       if (response.data) {
//         // Create download link for the podcast file
//         const blob = new Blob([response.data], { type: 'text/plain' });
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', 'podcast_script.txt');
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         window.URL.revokeObjectURL(url);

//         toast.success('Podcast script downloaded successfully!');
//       } else {
//         throw new Error('No podcast data received');
//       }
//     } catch (error) {
//       console.error('Error generating podcast:', error);
//       toast.error(error.response?.data?.error || 'Error generating podcast');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const performSearch = async () => {
//     if (selectedFiles.length === 0) {
//       toast.error('Please select files first');
//       return;
//     }

//     if (!searchQuery.trim()) {
//       toast.error('Please enter a search query');
//       return;
//     }

//     setSearchLoading(true);
//     try {
//       const fileIds = selectedFiles.map(file => file.id);

//       // Check if this is a special command for insights or podcast
//       let query = searchQuery;
//       let isInsightsCommand = false;
//       let isPodcastCommand = false;

//       if (searchQuery.includes('[INSIGHTS]')) {
//         query = searchQuery.replace('[INSIGHTS]', '').trim();
//         isInsightsCommand = true;
//       } else if (searchQuery.includes('[PODCAST]')) {
//         query = searchQuery.replace('[PODCAST]', '').trim();
//         isPodcastCommand = true;
//       }

//       if (isInsightsCommand || isPodcastCommand) {
//         // Use the new search-related endpoint for insights and podcast
//         const response = await searchRelatedWithInsightsApi(query, fileIds);

//         if (response.data && response.data.success) {
//           setSearchResults(response.data.related);
//           setSearchInsights(response.data.insight);
//           setSearchPodcast(response.data.podcast);

//           if (isInsightsCommand) {
//             toast.success('Insights generated successfully!');
//           } else if (isPodcastCommand) {
//             toast.success('Podcast script generated successfully!');
//           }
//         } else {
//           throw new Error('No data received');
//         }
//       } else {
//         // Regular search
//         const response = await searchPDFsApi(query, fileIds);

//         if (response.data && response.data.success) {
//           setSearchResults(response.data.results);
//           // Clear previous insights and podcast data
//           setSearchInsights(null);
//           setSearchPodcast(null);
//           toast.success(`Found ${response.data.results.length} related results`);
//         } else {
//           throw new Error('No search results received');
//         }
//       }
//     } catch (error) {
//       console.error('Error performing search:', error);
//       toast.error(error.response?.data?.error || 'Error performing search');
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const generateSearchInsights = async () => {
//     if (!searchResults || !searchQuery.trim()) {
//       toast.error('Please perform a search first');
//       return;
//     }

//     setInsightsLoading(true);
//     try {
//       const fileIds = selectedFiles.map(file => file.id);
//       const response = await searchRelatedWithInsightsApi(searchQuery, fileIds);

//       if (response.data && response.data.success) {
//         setSearchInsights(response.data.insight);
//         toast.success('Insights generated successfully!');
//       } else {
//         throw new Error('No insights data received');
//       }
//     } catch (error) {
//       console.error('Error generating insights:', error);
//       toast.error(error.response?.data?.error || 'Error generating insights');
//     } finally {
//       setInsightsLoading(false);
//     }
//   };

//   const generateSearchPodcast = async () => {
//     if (!searchResults || !searchQuery.trim()) {
//       toast.error('Please perform a search first');
//       return;
//     }

//     setPodcastLoading(true);
//     try {
//       const fileIds = selectedFiles.map(file => file.id);
//       const response = await searchRelatedWithInsightsApi(searchQuery, fileIds);

//       if (response.data && response.data.success) {
//         setSearchPodcast(response.data.podcast);
//         toast.success('Podcast script generated successfully!');
//       } else {
//         throw new Error('No podcast data received');
//       }
//     } catch (error) {
//       console.error('Error generating podcast:', error);
//       toast.error(error.response?.data?.error || 'Error generating podcast');
//     } finally {
//       setPodcastLoading(false);
//     }
//   };

//   // Load available voices on component mount
//   useEffect(() => {
//     const loadVoices = async () => {
//       try {
//         const response = await getAvailableVoicesApi();
//         if (response.data && response.data.success) {
//           setAvailableVoices(response.data.voices);
//         }
//       } catch (error) {
//         console.error('Error loading voices:', error);
//       }
//     };

//     loadVoices();
//   }, []);

//   const handleVoiceChange = async (voice) => {
//     try {
//       setSelectedVoice(voice);
//       await configureTTSApi(voice, speakingRate);
//       toast.success(`Voice changed to ${voice}`);
//     } catch (error) {
//       console.error('Error changing voice:', error);
//       toast.error('Failed to change voice');
//     }
//   };

//   const handleSpeakingRateChange = async (rate) => {
//     try {
//       setSpeakingRate(rate);
//       await configureTTSApi(selectedVoice, rate);
//       toast.success(`Speaking rate changed to ${rate}x`);
//     } catch (error) {
//       console.error('Error changing speaking rate:', error);
//       toast.error('Failed to change speaking rate');
//     }
//   };

//   const downloadAudio = (audioUrl, filename) => {
//     if (audioUrl) {
//       const link = document.createElement('a');
//       link.href = audioUrl;
//       link.download = filename || 'podcast.wav';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       toast.success('Audio download started!');
//     }
//   };

//   const handlePageClick = (pageNumber, fileId = null) => {
//     if (onNavigateToPage) {
//       onNavigateToPage(pageNumber, fileId);
//       if (fileId) {
//         const targetFile = selectedFiles.find(f => f.id === fileId);
//         toast.success(`Navigating to page ${pageNumber} in ${targetFile?.name || 'document'}`);
//       } else {
//         toast.success(`Navigating to page ${pageNumber}`);
//       }
//     }
//   };

//   return (
//     <div className="w-96 bg-white shadow-lg border-l flex flex-col">
//       <div className="p-4 border-b">
//         <h3 className="text-lg font-bold text-gray-800 mb-4">WORKSPACE</h3>

//         <div className="flex gap-2 mb-4">
//           <button
//             onClick={() => setProcessingMode('1a')}
//             className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//               processingMode === '1a'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <Brain size={16} className="inline mr-1" />
//             Extract Headings
//           </button>
//           <button
//             onClick={() => setProcessingMode('1b')}
//             className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//               processingMode === '1b'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <Users size={16} className="inline mr-1" />
//             Persona-based
//           </button>
//         </div>

//         {processingMode === '1b' && (
//           <div className="space-y-3 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Persona
//               </label>
//               <input
//                 type="text"
//                 value={persona}
//                 onChange={(e) => setPersona(e.target.value)}
//                 placeholder="e.g., Software Engineer"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Job to be Done
//               </label>
//               <input
//                 type="text"
//                 value={objective}
//                 onChange={(e) => setObjective(e.target.value)}
//                 placeholder="e.g., Learn about API design"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//               />
//             </div>
//           </div>
//         )}

//         <button
//           onClick={processingMode === '1a' ? process1A : process1B}
//           disabled={loading}
//           className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//         >
//           {loading ? (
//             <>
//               <Loader size={16} className="animate-spin" />
//               Processing...
//             </>
//           ) : (
//             `Run ${processingMode.toUpperCase()}`
//           )}
//         </button>

//         {/* 🔊 TTS Settings Section */}
//         <div className="mt-6 pt-4 border-t border-gray-200">
//           <div className="flex items-center justify-between mb-3">
//             <h4 className="text-md font-medium text-gray-800 flex items-center gap-2">
//               <Volume2 size={16} className="text-blue-600" />
//               TTS Settings
//             </h4>
//             <button
//               onClick={() => setShowTTSSettings(!showTTSSettings)}
//               className="p-2 rounded-full text-gray-500 hover:text-blue-600 transition-colors"
//               title="Toggle TTS settings"
//             >
//               <motion.div
//                 animate={{ rotate: showTTSSettings ? 180 : 0 }}
//                 transition={{ duration: 0.4, ease: "easeInOut" }}
//               >
//                 <Settings size={16} />
//               </motion.div>
//             </button>
//           </div>

//           <AnimatePresence initial={false}>
//             {showTTSSettings && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 transition={{ duration: 0.4, ease: "easeInOut" }}
//                 className="overflow-hidden"
//               >
//                 <div className="space-y-4 mb-4 p-4 bg-blue-50 rounded-lg shadow-inner">

//                   {/* Voice Selection */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Voice
//                     </label>
//                     <select
//                       value={selectedVoice}
//                       onChange={(e) => setSelectedVoice(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg
//                                 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     >
//                       {availableVoices.map((voice) => (
//                         <option key={voice} value={voice}>
//                           {voice.replace("en-US-", "").replace("en-GB-", "").replace("Neural", "")}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Speaking Rate */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Speaking Rate: {speakingRate}x
//                     </label>
//                     <input
//                       type="range"
//                       min="0.5"
//                       max="2.0"
//                       step="0.1"
//                       value={speakingRate}
//                       onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
//                       className="w-full accent-blue-600"
//                     />
//                     <div className="flex justify-between text-xs text-gray-500 mt-1">
//                       <span>Slow</span>
//                       <span>Normal</span>
//                       <span>Fast</span>
//                     </div>
//                   </div>

//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//         {/* Gemini Search Section */}
//         <div className="mt-6 pt-4 border-t border-gray-200">
//           <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
//             <Search size={16} className="text-purple-600" />
//             Gemini Search
//           </h4>

//           {selectedFiles.length === 0 ? (
//             <div className="text-center py-4 text-gray-500">
//               <Search size={24} className="mx-auto mb-2 text-gray-300" />
//               <p className="text-sm">Select PDF files to enable search</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {searchQuery && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
//                   <p className="text-xs text-blue-600 mb-1">Selected text from PDF:</p>
//                   <p className="text-sm text-blue-800 font-medium truncate" title={searchQuery}>
//                     "{searchQuery.length > 50 ? searchQuery.substring(0, 50) + '...' : searchQuery}"
//                   </p>
//                 </div>
//               )}

//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Search Query
//                   </label>
//                   {searchQuery && (
//                     <button
//                       onClick={() => setSearchQuery('')}
//                       className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
//                       title="Clear search query"
//                     >
//                       Clear
//                     </button>
//                   )}
//                 </div>
//                 <textarea
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Enter text to search for in your PDFs..."
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
//                   rows={3}
//                 />
//               </div>

//               <button
//                 onClick={performSearch}
//                 disabled={searchLoading || !searchQuery.trim()}
//                 className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//               >
//                 {searchLoading ? (
//                   <>
//                     <Loader size={16} className="animate-spin" />
//                     Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Search size={16} />
//                     Search PDFs
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4">
//         {results && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">Results</h4>
//             <div className="bg-gray-50 rounded-lg p-3 text-sm max-h-64 overflow-y-auto">
//               {processingMode === '1a' ? (
//                 <div>
//                   <h5 className="font-medium mb-2 text-gray-900">{results.title}</h5>
//                   <div className="space-y-1">
//                     {results.outline?.map((item, index) => (
//                       <div key={index} className={`${
//                         item.level === 'H1' ? 'pl-0 font-medium' :
//                         item.level === 'H2' ? 'pl-4' : 'pl-8'
//                       } text-gray-900`}>
//                         <span className="text-gray-600">{item.level}:</span> {item.text}
//                         <button
//                           onClick={() => handlePageClick(item.page + 1)}
//                           className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2 transition-colors"
//                           title={`Go to page ${item.page + 1}`}
//                         >
//                           (Page {item.page + 1})
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {results.map((result, index) => (
//                     <div key={index} className="border-l-4 border-blue-500 pl-3">
//                       <div className="font-medium text-gray-900">{result.file}</div>
//                       <div className="text-gray-600 text-xs mb-1">Relevance: {(result.score * 100).toFixed(0)}%</div>
//                       <div className="text-sm text-gray-900">{result.best_section}</div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {results && (
//           <div className="space-y-3 mb-6">
//             <button
//               onClick={generateInsights}
//               disabled={loading}
//               className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
//             >
//               {loading ? <Loader size={16} className="animate-spin" /> : <Lightbulb size={16} />}
//               Generate Insights
//             </button>

//             <button
//               onClick={generatePodcast}
//               disabled={loading}
//               className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
//             >
//               {loading ? <Loader size={16} className="animate-spin" /> : <Mic size={16} />}
//               Generate Podcast
//             </button>
//           </div>
//         )}

//         {insights && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">AI Insights</h4>
//             <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-3 max-h-64 overflow-y-auto">
//               {insights.key_insights && (
//                 <div>
//                   <h5 className="font-medium text-blue-600 mb-2">💡 Key Insights</h5>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     {insights.key_insights.map((insight, index) => (
//                       <li key={index}>{insight}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {insights.did_you_know && (
//                 <div>
//                   <h5 className="font-medium text-green-600 mb-2">🤔 Did You Know?</h5>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     {insights.did_you_know.map((fact, index) => (
//                       <li key={index}>{fact}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {insights.connections && (
//                 <div>
//                   <h5 className="font-medium text-purple-600 mb-2">🔗 Connections</h5>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     {insights.connections.map((connection, index) => (
//                       <li key={index}>{connection}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Search Results */}
//         {searchResults && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">🔍 Search Results</h4>
//             <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-3 max-h-64 overflow-y-auto">
//               {searchResults.map((result, index) => (
//                 <div key={index} className="border-l-4 border-purple-500 pl-3">
//                   <div className="font-medium text-gray-900">{result.pdf}</div>
//                   <div className="text-gray-600 text-xs mb-1">
//                     Page {result.page} • Score: {(result.score * 100).toFixed(1)}%
//                   </div>
//                   <div className="text-sm text-gray-700 mb-2">{result.snippet}</div>
//                   <button
//                     onClick={() => handlePageClick(result.page, result.file_id)}
//                     className="text-xs text-purple-600 hover:text-purple-800 hover:underline transition-colors"
//                     title={`Go to page ${result.page} in ${result.file_name || result.pdf}`}
//                   >
//                     📄 Go to Page {result.page} in {result.file_name || result.pdf}
//                   </button>
//                 </div>
//               ))}
//             </div>

//             {/* Search Action Buttons */}
//             <div className="mt-4 space-y-2">
//               <button
//                 onClick={generateSearchInsights}
//                 disabled={insightsLoading}
//                 className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
//               >
//                 {insightsLoading ? (
//                   <>
//                     <Loader size={16} className="animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Lightbulb size={16} />
//                     Generate Insights
//                   </>
//                 )}
//               </button>

//               <button
//                 onClick={generateSearchPodcast}
//                 disabled={podcastLoading}
//                 className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
//               >
//                 {podcastLoading ? (
//                   <>
//                     <Loader size={16} className="animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Mic size={16} />
//                     Generate Podcast
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Search Insights */}
//         {searchInsights && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">💡 Search Insights</h4>
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
//               <div className="text-yellow-800">
//                 {searchInsights}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Search Podcast */}
//         {searchPodcast && (
//           <div className="mb-6">
//             <h4 className="font-medium text-gray-800 mb-3">🎙️ Podcast Script</h4>
//             <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
//               <div className="text-green-800 mb-3 whitespace-pre-wrap">
//                 {searchPodcast.script}
//               </div>

//               {/* Audio Controls */}
//               {searchPodcast.audio_url ? (
//                 <div className="mt-3 space-y-3">
//                   <div className="bg-white rounded-lg p-3 border">
//                     <audio controls className="w-full">
//                       <source src={searchPodcast.audio_url} type="audio/wav" />
//                       Your browser does not support the audio element.
//                     </audio>
//                   </div>

//                   {/* Audio Metadata */}
//                   <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
//                     <div>
//                       <span className="font-medium">Duration:</span> {searchPodcast.duration_estimate} min
//                     </div>
//                     <div>
//                       <span className="font-medium">File Size:</span> {(searchPodcast.file_size / 1024).toFixed(1)} KB
//                     </div>
//                     <div>
//                       <span className="font-medium">Script Length:</span> {searchPodcast.script_length} chars
//                     </div>
//                     <div>
//                       <span className="font-medium">Voice:</span> {selectedVoice.replace('en-US-', '').replace('en-GB-', '').replace('Neural', '')}
//                     </div>
//                   </div>

//                   {/* Download Button */}
//                   <button
//                     onClick={() => downloadAudio(searchPodcast.audio_url, searchPodcast.audio_filename)}
//                     className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
//                   >
//                     <Download size={14} />
//                     Download Audio
//                   </button>
//                 </div>
//               ) : (
//                 <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
//                   🎵 Audio generation failed. Please try again.
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {selectedFiles.length > 0 && (
//           <div className="bg-blue-50 rounded-lg p-3">
//             <h5 className="font-medium text-blue-800 mb-2">Selected Files</h5>
//             <div className="space-y-1">
//               {selectedFiles.map((file, index) => (
//                 <div key={index} className="text-sm text-blue-700">
//                   📄 {file.name}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProcessingPanel;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from "react";
import {
  Brain,
  Users,
  Lightbulb,
  Mic,
  Loader,
  Search,
  Volume2,
  Settings,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  process1A as process1AApi,
  process1B as process1BApi,
  generateInsights as generateInsightsApi,
  generatePodcast as generatePodcastApi,
  searchPDFs as searchPDFsApi,
  searchRelatedWithInsights as searchRelatedWithInsightsApi,
  getAvailableVoices as getAvailableVoicesApi,
  configureTTS as configureTTSApi,
} from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

// Collapsible Panel Component
const CollapsiblePanel = ({
  title,
  children,
  isOpen,
  onToggle,
  icon: Icon,
}) => (
  <div className="border rounded-lg mb-4 bg-white shadow-sm">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition"
      aria-expanded={isOpen}
      aria-controls={`panel-${title.replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center gap-2">
        {Icon ? <Icon size={18} className="text-gray-700" /> : null}
        <span>{title}</span>
      </div>
      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.section
          key="content"
          id={`panel-${title.replace(/\s+/g, "-")}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden px-4 py-3"
        >
          {children}
        </motion.section>
      )}
    </AnimatePresence>
  </div>
);

const ProcessingPanel = ({
  selectedFiles,
  processingMode,
  setProcessingMode,
  onNavigateToPage,
  searchQuery,
  setSearchQuery,
}) => {
  const [results, setResults] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState("");
  const [objective, setObjective] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInsights, setSearchInsights] = useState(null);
  const [searchPodcast, setSearchPodcast] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [podcastLoading, setPodcastLoading] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("en-US-JennyNeural");
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [showTTSSettings, setShowTTSSettings] = useState(false);

  // Accordion expanded state
  const [expandedPanels, setExpandedPanels] = useState({
    workspace: true,
    ttsSettings: false,
    geminiSearch: true,
    results: true,
    insights: false,
    searchResults: false,
    searchInsights: false,
    searchPodcast: false,
  });

  const togglePanel = (panel) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  // Your existing functions below remain exactly the same:

  const process1A = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a file first");
      return;
    }
    setLoading(true);
    try {
      const response = await process1AApi(selectedFiles[0].id);
      if (response.data) {
        setResults(response.data);
        toast.success("Heading extraction completed");
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error processing document:", error);
      toast.error(error.response?.data?.error || "Error processing document");
    } finally {
      setLoading(false);
    }
  };

  const process1B = async () => {
    if (selectedFiles.length === 0 || !persona || !objective) {
      toast.error("Please select files and fill in persona and objective");
      return;
    }
    setLoading(true);
    try {
      const fileIds = selectedFiles.map((file) => file.id);
      const response = await process1BApi(fileIds, persona, objective);
      if (response.data) {
        setResults(response.data);
        toast.success("Document intelligence analysis completed");
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error processing documents:", error);
      toast.error(error.response?.data?.error || "Error processing documents");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!results) {
      toast.error("Process a document first");
      return;
    }
    setLoading(true);
    try {
      let content = "";
      if (processingMode === "1a" && results && results.outline) {
        content = results.outline
          .map((item) => `${item.level}: ${item.text}`)
          .join("\n");
      } else if (processingMode === "1b" && Array.isArray(results)) {
        content = results.map((result) => result.best_section).join("\n\n");
      }
      const response = await generateInsightsApi(content);
      if (response.data) {
        setInsights(response.data);
        toast.success("Insights generated");
      } else {
        throw new Error("No insights data received");
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error(error.response?.data?.error || "Error generating insights");
    } finally {
      setLoading(false);
    }
  };

  const generatePodcast = async () => {
    if (!results) {
      toast.error("Process a document first");
      return;
    }
    setLoading(true);
    try {
      let content = "";
      if (processingMode === "1a" && results && results.outline) {
        content = results.outline
          .map((item) => `${item.level}: ${item.text}`)
          .join("\n");
      } else if (processingMode === "1b" && Array.isArray(results)) {
        content = results.map((result) => result.best_section).join("\n\n");
      }
      const response = await generatePodcastApi(content, insights);
      if (response.data) {
        const blob = new Blob([response.data], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "podcast_script.txt");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Podcast script downloaded successfully!");
      } else {
        throw new Error("No podcast data received");
      }
    } catch (error) {
      console.error("Error generating podcast:", error);
      toast.error(error.response?.data?.error || "Error generating podcast");
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files first");
      return;
    }
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    setSearchLoading(true);
    try {
      const fileIds = selectedFiles.map((file) => file.id);
      let query = searchQuery;
      let isInsightsCommand = false;
      let isPodcastCommand = false;
      if (searchQuery.includes("[INSIGHTS]")) {
        query = searchQuery.replace("[INSIGHTS]", "").trim();
        isInsightsCommand = true;
      } else if (searchQuery.includes("[PODCAST]")) {
        query = searchQuery.replace("[PODCAST]", "").trim();
        isPodcastCommand = true;
      }
      if (isInsightsCommand || isPodcastCommand) {
        const response = await searchRelatedWithInsightsApi(query, fileIds);
        if (response.data && response.data.success) {
          setSearchResults(response.data.related);
          setSearchInsights(response.data.insight);
          setSearchPodcast(response.data.podcast);
          if (isInsightsCommand) {
            toast.success("Insights generated successfully!");
          } else if (isPodcastCommand) {
            toast.success("Podcast script generated successfully!");
          }
        } else {
          throw new Error("No data received");
        }
      } else {
        const response = await searchPDFsApi(query, fileIds);
        if (response.data && response.data.success) {
          setSearchResults(response.data.results);
          setSearchInsights(null);
          setSearchPodcast(null);
          toast.success(
            `Found ${response.data.results.length} related results`
          );
        } else {
          throw new Error("No search results received");
        }
      }
    } catch (error) {
      console.error("Error performing search:", error);
      toast.error(error.response?.data?.error || "Error performing search");
    } finally {
      setSearchLoading(false);
    }
  };

  const generateSearchInsights = async () => {
    if (!searchResults || !searchQuery.trim()) {
      toast.error("Please perform a search first");
      return;
    }
    setInsightsLoading(true);
    try {
      const fileIds = selectedFiles.map((file) => file.id);
      const response = await searchRelatedWithInsightsApi(searchQuery, fileIds);
      if (response.data && response.data.success) {
        setSearchInsights(response.data.insight);
        toast.success("Insights generated successfully!");
      } else {
        throw new Error("No insights data received");
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error(error.response?.data?.error || "Error generating insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  const generateSearchPodcast = async () => {
    if (!searchResults || !searchQuery.trim()) {
      toast.error("Please perform a search first");
      return;
    }
    setPodcastLoading(true);
    try {
      const fileIds = selectedFiles.map((file) => file.id);
      const response = await searchRelatedWithInsightsApi(searchQuery, fileIds);
      if (response.data && response.data.success) {
        setSearchPodcast(response.data.podcast);
        toast.success("Podcast script generated successfully!");
      } else {
        throw new Error("No podcast data received");
      }
    } catch (error) {
      console.error("Error generating podcast:", error);
      toast.error(error.response?.data?.error || "Error generating podcast");
    } finally {
      setPodcastLoading(false);
    }
  };

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await getAvailableVoicesApi();
        if (response.data && response.data.success) {
          setAvailableVoices(response.data.voices);
        }
      } catch (error) {
        console.error("Error loading voices:", error);
      }
    };
    loadVoices();
  }, []);

  const handleVoiceChange = async (voice) => {
    try {
      setSelectedVoice(voice);
      await configureTTSApi(voice, speakingRate);
      toast.success(`Voice changed to ${voice}`);
    } catch (error) {
      console.error("Error changing voice:", error);
      toast.error("Failed to change voice");
    }
  };

  const handleSpeakingRateChange = async (rate) => {
    try {
      setSpeakingRate(rate);
      await configureTTSApi(selectedVoice, rate);
      toast.success(`Speaking rate changed to ${rate}x`);
    } catch (error) {
      console.error("Error changing speaking rate:", error);
      toast.error("Failed to change speaking rate");
    }
  };

  const downloadAudio = (audioUrl, filename) => {
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = filename || "podcast.wav";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Audio download started!");
    }
  };

  const handlePageClick = (pageNumber, fileId = null) => {
    if (onNavigateToPage) {
      onNavigateToPage(pageNumber, fileId);
      if (fileId) {
        const targetFile = selectedFiles.find((f) => f.id === fileId);
        toast.success(
          `Navigating to page ${pageNumber} in ${
            targetFile?.name || "document"
          }`
        );
      } else {
        toast.success(`Navigating to page ${pageNumber}`);
      }
    }
  };

  return (
    <div className="w-96 bg-white shadow-lg border-l flex flex-col max-h-screen">
      <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
        {/* Workspace Panel */}
        <CollapsiblePanel
          title="WORKSPACE"
          isOpen={expandedPanels.workspace}
          onToggle={() => togglePanel("workspace")}
          icon={processingMode === "1a" ? Brain : Users}
        >
          <div className="flex gap-2 mb-4">
            {/* <button
            onClick={() => {
              setProcessingMode('1a');
              setResults(null);
              setInsights(null);
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${processingMode === '1a'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Brain size={16} className="inline mr-1" />
            Headings
          </button> */}
            <button
              onClick={() => {
                setProcessingMode("1a");
                setResults(null);
                setInsights(null);
              }}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-semibold tracking-wide transition-all shadow-sm ${
                processingMode === "1a"
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md scale-[1.02]"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
              }`}
            >
              <Brain size={16} className="inline" />
              Headings
            </button>

            {/* <button
              onClick={() => {
                setProcessingMode("1b");
                setResults(null);
                setInsights(null);
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                processingMode === "1b"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Users size={16} className="inline mr-1" />
              Persona-based
            </button> */}
            <button
              onClick={() => {
                setProcessingMode("1b");
                setResults(null);
                setInsights(null);
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold tracking-wide transition-all shadow-sm ${
                processingMode === "1b"
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md scale-[1.02]"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
              }`}
            >
              <Users size={16} className="inline" />
              Persona-based
            </button>
          </div>

          {processingMode === "1b" && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persona
                </label>
                <input
                  type="text"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job to be Done
                </label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g., Learn about API design"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          )}

          {/* <button
            onClick={processingMode === "1a" ? process1A : process1B}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Processing...
              </>
            ) : processingMode === "1a" ? (
              "Extract Headings"
            ) : (
              "Start Persona Analysis"
            )}
          </button> */}
          <button
            onClick={processingMode === "1a" ? process1A : process1B}
            disabled={loading}
            className={`w-full px-5 py-3 rounded-xl font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm ${
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : processingMode === "1a"
                ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:scale-[1.01] shadow-md"
                : "bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:scale-[1.01] shadow-md"
            }`}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Processing...
              </>
            ) : processingMode === "1a" ? (
              "Extract Headings"
            ) : (
              "Start Persona Analysis"
            )}
          </button>
        </CollapsiblePanel>

        {/* TTS Settings Panel */}
        {/* <CollapsiblePanel
          title="Podcast Settings"
          isOpen={expandedPanels.ttsSettings}
          onToggle={() => togglePanel("ttsSettings")}
          icon={Volume2}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  handleVoiceChange(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {availableVoices.map((voice) => (
                  <option key={voice} value={voice}>
                    {voice
                      .replace("en-US-", "")
                      .replace("en-GB-", "")
                      .replace("Neural", "")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speaking Rate: {speakingRate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speakingRate}
                onChange={(e) => {
                  setSpeakingRate(parseFloat(e.target.value));
                  handleSpeakingRateChange(parseFloat(e.target.value));
                }}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </CollapsiblePanel> */}
        <CollapsiblePanel
          title="Podcast Settings"
          isOpen={expandedPanels.ttsSettings}
          onToggle={() => togglePanel("ttsSettings")}
          icon={Volume2}
        >
          <div className="space-y-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  handleVoiceChange(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:border-blue-400"
              >
                {availableVoices.map((voice) => (
                  <option key={voice} value={voice}>
                    {voice
                      .replace("en-US-", "")
                      .replace("en-GB-", "")
                      .replace("Neural", "")}
                  </option>
                ))}
              </select>
            </div>

            {/* Speaking Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaking Rate:{" "}
                <span className="font-semibold">{speakingRate}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speakingRate}
                onChange={(e) => {
                  setSpeakingRate(parseFloat(e.target.value));
                  handleSpeakingRateChange(parseFloat(e.target.value));
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </CollapsiblePanel>

        {/* Gemini Search Panel */}
        <CollapsiblePanel
          title="Related Content"
          isOpen={expandedPanels.geminiSearch}
          onToggle={() => togglePanel("geminiSearch")}
          icon={Search}
        >
          {selectedFiles.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Search size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Select PDF files to enable search</p>
            </div>
          ) : (
            <>
              {searchQuery && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                  <p className="text-xs text-blue-600 mb-1">
                    Selected text from PDF:
                  </p>
                  <p
                    className="text-sm text-blue-800 font-medium truncate"
                    title={searchQuery}
                  >
                    "
                    {searchQuery.length > 50
                      ? searchQuery.substring(0, 50) + "..."
                      : searchQuery}
                    "
                  </p>
                </div>
              )}

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Search Query
                  </label>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      title="Clear search query"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter text to search for in your PDFs..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
                  rows={3}
                />
              </div>

              {/* <button
                onClick={performSearch}
                disabled={searchLoading || !searchQuery.trim()}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {searchLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Search PDFs
                  </>
                )}
              </button> */}
              <button
                onClick={performSearch}
                disabled={searchLoading || !searchQuery.trim()}
                className="w-full bg-purple-600 text-white px-5 py-3 rounded-xl shadow-md 
             hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed 
             transition-all duration-300 flex items-center justify-center gap-2 
             font-medium tracking-wide"
              >
                {searchLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={16} className="opacity-90" />
                    Search PDFs
                  </>
                )}
              </button>
            </>
          )}
        </CollapsiblePanel>

        {/* Results Panel */}
        {results &&
          ((processingMode === "1a" && results.outline) ||
            (processingMode === "1b" && Array.isArray(results))) && (
            <CollapsiblePanel
              title="Results"
              isOpen={expandedPanels.results}
              onToggle={() => togglePanel("results")}
              icon={processingMode === "1a" ? Brain : Users}
            >
              <div className="bg-gray-50 rounded-lg p-3 text-sm max-h-64 overflow-y-auto space-y-3">
                {processingMode === "1a" ? (
                  <>
                    <h5 className="font-medium mb-2 text-gray-900">
                      {results.title}
                    </h5>
                    <div className="space-y-1">
                      {results.outline?.map((item, index) => (
                        <div
                          key={index}
                          className={`${
                            item.level === "H1"
                              ? "pl-0 font-medium"
                              : item.level === "H2"
                              ? "pl-4"
                              : "pl-8"
                          } text-gray-900`}
                        >
                          <span className="text-gray-600">{item.level}:</span>{" "}
                          {item.text}
                          <button
                            onClick={() => handlePageClick(item.page + 1)}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2 transition-colors"
                            title={`Go to page ${item.page + 1}`}
                          >
                            (Page {item.page + 1})
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {Array.isArray(results) ? (
                      results.map((result, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-3"
                        >
                          <div className="font-medium text-gray-900">
                            {result.file}
                          </div>
                          <div className="text-gray-600 text-xs mb-1">
                            Relevance: {(result.score * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-900">
                            {result.best_section}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm">
                        No results available. Please run the analysis first.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-4">
                {/* <button
                  onClick={generateInsights}
                  disabled={
                    loading ||
                    !(
                      (processingMode === "1a" && results && results.outline) ||
                      (processingMode === "1b" && Array.isArray(results))
                    )
                  }
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Lightbulb size={16} />
                  )}
                  Generate Insights
                </button>

                <button
                  onClick={generatePodcast}
                  disabled={
                    loading ||
                    !(
                      (processingMode === "1a" && results && results.outline) ||
                      (processingMode === "1b" && Array.isArray(results))
                    )
                  }
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Mic size={16} />
                  )}
                  Generate Podcast
                </button> */}
                <button
                  onClick={generateInsights}
                  disabled={
                    loading ||
                    !(
                      (processingMode === "1a" && results && results.outline) ||
                      (processingMode === "1b" && Array.isArray(results))
                    )
                  }
                  className="w-full bg-yellow-500 text-white px-5 py-3 rounded-xl shadow-md
             hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed
             transition-all duration-300 flex items-center justify-center gap-2
             font-medium tracking-wide"
                >
                  {loading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Lightbulb size={18} className="opacity-90" />
                  )}
                  Generate Insights
                </button>

                <button
                  onClick={generatePodcast}
                  disabled={
                    loading ||
                    !(
                      (processingMode === "1a" && results && results.outline) ||
                      (processingMode === "1b" && Array.isArray(results))
                    )
                  }
                  className="w-full bg-green-500 text-white px-5 py-3 rounded-xl shadow-md
             hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed
             transition-all duration-300 flex items-center justify-center gap-2
             font-medium tracking-wide"
                >
                  {loading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Mic size={18} className="opacity-90" />
                  )}
                  Generate Podcast
                </button>
              </div>
            </CollapsiblePanel>
          )}

        {/* AI Insights Panel */}
        {insights &&
          ((processingMode === "1a" && results && results.outline) ||
            (processingMode === "1b" && Array.isArray(results))) && (
            <CollapsiblePanel
              title="AI Insights"
              isOpen={expandedPanels.insights}
              onToggle={() => togglePanel("insights")}
              icon={Lightbulb}
            >
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-3 max-h-64 overflow-y-auto">
                {insights.key_insights && (
                  <div>
                    <h5 className="font-medium text-blue-600 mb-2">
                      💡 Key Insights
                    </h5>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {insights.key_insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.did_you_know && (
                  <div>
                    <h5 className="font-medium text-green-600 mb-2">
                      🤔 Did You Know?
                    </h5>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {insights.did_you_know.map((fact, index) => (
                        <li key={index}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.connections && (
                  <div>
                    <h5 className="font-medium text-purple-600 mb-2">
                      🔗 Connections
                    </h5>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {insights.connections.map((connection, index) => (
                        <li key={index}>{connection}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsiblePanel>
          )}

        {/* Search Results Panel */}
        {searchResults && (
          <CollapsiblePanel
            title="Search Results"
            isOpen={expandedPanels.searchResults}
            onToggle={() => togglePanel("searchResults")}
            icon={Search}
          >
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-3 max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-3">
                  <div className="font-medium text-gray-900">{result.pdf}</div>
                  <div className="text-gray-600 text-xs mb-1">
                    Page {result.page} • Score:{" "}
                    {(result.score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    {result.snippet}
                  </div>
                  <button
                    onClick={() => handlePageClick(result.page, result.file_id)}
                    className="text-xs text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                    title={`Go to page ${result.page} in ${
                      result.file_name || result.pdf
                    }`}
                  >
                    📄 Go to Page {result.page} in{" "}
                    {result.file_name || result.pdf}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {/* <button
                onClick={generateSearchInsights}
                disabled={insightsLoading}
                className="
  w-auto bg-yellow-500 text-white 
  px-3 py-2 rounded-lg shadow 
  hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-300 flex items-center justify-center gap-2
  text-sm font-medium
"
              >
                {insightsLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb size={16} />
                    Generate Insights
                  </>
                )}
              </button>

              <button
                onClick={generateSearchPodcast}
                disabled={podcastLoading}
                className="w-auto bg-green-500 text-white 
  px-3 py-2 rounded-lg shadow 
  hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-300 flex items-center justify-center gap-2
  text-sm font-medium
"
              >
                {podcastLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mic size={16} />
                    Generate Podcast
                  </>
                )}
              </button> */}
              <div className="flex items-center gap-3 mt-4">
  <button
    onClick={generateSearchInsights}
    disabled={insightsLoading}
    className="
      w-auto bg-yellow-500 text-white 
      px-3 py-2 rounded-lg shadow 
      hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-300 flex items-center justify-center gap-2
      text-sm font-medium
    "
  >
    {insightsLoading ? (
      <>
        <Loader size={30} className="animate-spin" />
        Generating...
      </>
    ) : (
      <>
        <Lightbulb size={30} />
        Generate Insights
      </>
    )}
  </button>

  <button
    onClick={generateSearchPodcast}
    disabled={podcastLoading}
    className="
      w-auto bg-green-500 text-white 
      px-3 py-2 rounded-lg shadow 
      hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-300 flex items-center justify-center gap-2
      text-sm font-medium
    "
  >
    {podcastLoading ? (
      <>
        <Loader size={30} className="animate-spin" />
        Generating...
      </>
    ) : (
      <>
        <Mic size={30} />
        Generate Podcast
      </>
    )}
  </button>
</div>

            </div>
          </CollapsiblePanel>
        )}

        {/* Search Insights Panel */}
        {searchInsights && (
          <CollapsiblePanel
            title="Search Insights"
            isOpen={expandedPanels.searchInsights}
            onToggle={() => togglePanel("searchInsights")}
            icon={Lightbulb}
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <div className="text-yellow-800">{searchInsights}</div>
            </div>
          </CollapsiblePanel>
        )}

        {/* Search Podcast Panel */}
        {searchPodcast && (
          <CollapsiblePanel
            title="Podcast Mode"
            isOpen={expandedPanels.searchPodcast}
            onToggle={() => togglePanel("searchPodcast")}
            icon={Mic}
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <div className="text-green-800 mb-3 whitespace-pre-wrap">
                {searchPodcast.script}
              </div>

              {searchPodcast.audio_url ? (
                <>
                  <div className="bg-white rounded-lg p-3 border mb-3">
                    <audio controls className="w-full">
                      <source src={searchPodcast.audio_url} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {searchPodcast.duration_estimate} min
                    </div>
                    <div>
                      <span className="font-medium">File Size:</span>{" "}
                      {(searchPodcast.file_size / 1024).toFixed(1)} KB
                    </div>
                    <div>
                      <span className="font-medium">Script Length:</span>{" "}
                      {searchPodcast.script_length} chars
                    </div>
                    <div>
                      <span className="font-medium">Voice:</span>{" "}
                      {selectedVoice
                        .replace("en-US-", "")
                        .replace("en-GB-", "")
                        .replace("Neural", "")}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      downloadAudio(
                        searchPodcast.audio_url,
                        searchPodcast.audio_filename
                      )
                    }
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Download size={14} />
                    Download Audio
                  </button>
                </>
              ) : (
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
                  🎵 Audio generation failed. Please try again.
                </div>
              )}
            </div>
          </CollapsiblePanel>
        )}

        {/* Selected Files Panel */}
        {selectedFiles.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 mt-auto">
            <h5 className="font-medium text-blue-800 mb-2">Selected Files</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="text-sm text-blue-700 truncate"
                  title={file.name}
                >
                  📄 {file.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingPanel;
