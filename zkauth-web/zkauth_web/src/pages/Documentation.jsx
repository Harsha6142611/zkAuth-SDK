import { useState } from 'react';
import './Documentation.css';

const topics = {
  introduction: {
    title: 'Introduction',
    content: 'ZKAuth is a revolutionary authentication system that leverages zero-knowledge proofs...',
    subtopics: ['What is ZKAuth?', 'Key Features', 'Use Cases']
  },
  gettingStarted: {
    title: 'Getting Started',
    content: 'Follow these steps to integrate ZKAuth into your application...',
    subtopics: ['Installation', 'Configuration', 'Quick Start']
  },
  zkpBasics: {
    title: 'Zero Knowledge Proofs',
    content: 'Learn about the fundamental concepts of Zero Knowledge Proofs...',
    subtopics: ['What is ZKP?', 'How it Works', 'Benefits']
  },
  integration: {
    title: 'Integration Guide',
    content: 'Detailed instructions for integrating ZKAuth into different platforms...',
    subtopics: ['Web Integration', 'Mobile Integration', 'API Reference']
  },
  security: {
    title: 'Security',
    content: 'Understanding the security features and best practices...',
    subtopics: ['Security Model', 'Best Practices', 'Compliance']
  },
  troubleshooting: {
    title: 'Troubleshooting',
    content: 'Common issues and their solutions...',
    subtopics: ['Common Issues', 'FAQ', 'Support']
  }
};

const Documentation = () => {
  const [selectedTopic, setSelectedTopic] = useState('introduction');

  return (
    <div className="documentation-container">
      
      <div className="docs-sidebar">
        <nav>
          {Object.entries(topics).map(([key, topic]) => (
            <button
              key={key}
              className={`topic-button ${selectedTopic === key ? 'active' : ''}`}
              onClick={() => setSelectedTopic(key)}
            >
              {topic.title}
            </button>
          ))}
        </nav>
      </div>

      
      <div className="docs-content">
        <h1>{topics[selectedTopic].title}</h1>
        <div className="content-body">
          {topics[selectedTopic].content}
        </div>
      </div>

      
      <div className="docs-subtopics">
        <h3>In This Section</h3>
        <nav>
          {topics[selectedTopic].subtopics.map((subtopic, index) => (
            <button key={index} className="subtopic-button">
              {subtopic}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Documentation;