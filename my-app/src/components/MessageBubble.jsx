import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sparkles, User } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-dark-border flex items-center justify-center text-primary-600 dark:text-primary-400">
              <User size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles size={16} />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div 
          className={`flex flex-col group ${
            isUser ? 'items-end' : 'items-start'
          }`}
        >
          <div 
            className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${
              isUser 
                ? 'bg-primary-600 text-white rounded-tr-sm' 
                : 'bg-white dark:bg-dark-panel border border-gray-100 dark:border-dark-border text-gray-800 dark:text-gray-200 rounded-tl-sm'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none 
                prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent
                prose-headings:font-semibold prose-a:text-primary-500
                prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <div className="relative mt-4 mb-4 rounded-xl overflow-hidden bg-[#1E1E1E] border border-gray-800">
                          <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-gray-400 text-xs font-mono border-b border-gray-800">
                            <span>{match[1]}</span>
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            children={String(children).replace(/\n$/, '')}
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              background: 'transparent',
                              fontSize: '0.875rem',
                            }}
                          />
                        </div>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
